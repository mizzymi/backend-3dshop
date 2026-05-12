import { Response } from "express";
import sumup from "../config/sumUp";
import Product from "../models/Product";
import Order from "../models/Order";
import { calculateShipping } from "../utils/calculateShipping";
import { processOrder } from "../utils/processOrder";
import { AuthRequest } from "../middleware/auth";
import PendingCheckout from "../models/PendingCheckout";

export const createCheckoutSession = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { customerName, email, phone, items, shippingAddress } = req.body;

    if (!customerName || !email) {
      return res.status(400).json({
        message: "Nombre y email son obligatorios",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "El carrito está vacío",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.province ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        message: "La dirección de envío es obligatoria",
      });
    }

    const productIds = items.map((item: any) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "Uno o más productos no existen",
      });
    }

    let subtotal = 0;

    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      const quantity = Number(item.quantity || 1);

      if (quantity <= 0) {
        throw new Error("Cantidad no válida");
      }

      if (product.stock < quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const itemSubtotal = product.price * quantity;
      subtotal += itemSubtotal;

      return {
        productId: product._id.toString(),
        name: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
        color: item.color,
        size: item.size,
        image: product.images?.[0],
        customization: item.customization,
        customText: item.customText,
      };
    });

    const shippingCost = calculateShipping(subtotal, shippingAddress.country);
    const total = subtotal + shippingCost;

    if (total <= 0) {
      const order = await processOrder({
        items: orderItems,
        shippingAddress,
        customerName,
        email,
        phone,
        subtotal,
        shippingCost,
        total: 0,
        paymentMethod: "free",
        sumupCheckoutId: undefined,
        sumupCheckoutReference: undefined,
        user: req.user?.id,
      });

      return res.json({
        freeOrder: true,
        orderId: order._id,
        redirectUrl: `${process.env.FRONTEND_URL}/success?session_id=free_order_${order._id}`,
      });
    }

    const checkoutReference = `ORDER-${Date.now()}`;

    const checkout = await sumup.checkouts.create({
      checkout_reference: checkoutReference,
      amount: Number(total.toFixed(2)),
      currency: "EUR",
      merchant_code: process.env.SUMUP_MERCHANT_CODE!,
      description: `Pedido REIMII 3D - ${customerName}`,
      redirect_url: `${process.env.FRONTEND_URL}/success?session_id=${checkoutReference}`,
      hosted_checkout: {
        enabled: true,
      },
    });

    await PendingCheckout.create({
      checkoutReference,
      checkoutId: checkout.id,
      checkoutUrl: checkout.hosted_checkout_url,
      customerName,
      email,
      phone,
      user: req.user?.id,
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
    });

    return res.json({
      url: checkout.hosted_checkout_url,
      checkoutId: checkout.id,
      checkoutReference,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Error creando checkout de SumUp",
    });
  }
};

export const getCheckoutSessionResult = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const sessionId = req.params.sessionId as string;

    if (sessionId.startsWith("free_order_")) {
      const orderId = sessionId.replace("free_order_", "");
      const order = await Order.findById(orderId);

      return res.json({
        session: null,
        order,
      });
    }

    const pending = await PendingCheckout.findOne({
      checkoutReference: sessionId,
    });

    if (!pending) {
      const order = await Order.findOne({
        sumupCheckoutReference: sessionId,
      });

      if (order) {
        return res.json({
          session: null,
          order,
        });
      }

      return res.status(404).json({
        message: "Checkout pendiente no encontrado",
      });
    }

    const checkout = await sumup.checkouts.get(pending.checkoutId);

    if (checkout.status !== "PAID") {
      return res.json({
        session: {
          id: checkout.id,
          paymentStatus: checkout.status,
          amountTotal: checkout.amount,
          currency: checkout.currency,
        },
        order: null,
      });
    }

    let order = await Order.findOne({
      sumupCheckoutId: pending.checkoutId,
    });

    if (!order) {
      order = await processOrder({
        items: pending.items,
        shippingAddress: pending.shippingAddress,
        customerName: pending.customerName,
        email: pending.email,
        phone: pending.phone,
        subtotal: pending.subtotal,
        shippingCost: pending.shippingCost,
        total: pending.total,
        paymentMethod: "sumup",
        sumupCheckoutId: pending.checkoutId,
        sumupCheckoutReference: pending.checkoutReference,
        user: pending.user,
      });

      await PendingCheckout.deleteOne({ _id: pending._id });
    }

    return res.json({
      session: {
        id: checkout.id,
        paymentStatus: checkout.status,
        amountTotal: checkout.amount,
        currency: checkout.currency,
      },
      order,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Error obteniendo checkout de SumUp",
    });
  }
};
