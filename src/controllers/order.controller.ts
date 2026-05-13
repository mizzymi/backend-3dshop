import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { AuthRequest } from "../middleware/auth";
import { calculateShipping } from "../utils/calculateShipping";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

const parseJSON = (value: any, fallback: any = []) => {
  if (!value) return fallback;

  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const session = await Order.startSession();

  try {
    session.startTransaction();

    const files = req.files as Express.Multer.File[] | undefined;

    const uploadedImages = files?.length
      ? await Promise.all(files.map((file) => uploadToCloudinary(file.buffer)))
      : [];

    const customerName = req.body.customerName;
    const email = req.body.email;
    const phone = req.body.phone;

    const shippingAddress = parseJSON(req.body.shippingAddress, {});
    const items = parseJSON(req.body.items, []);

    const paymentMethod = req.body.paymentMethod || "manual";
    const sumupCheckoutId = req.body.sumupCheckoutId;
    const sumupCheckoutReference = req.body.sumupCheckoutReference;
    const notes = req.body.notes;

    if (!customerName || !email) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Nombre y email son obligatorios",
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
      await session.abortTransaction();
      return res.status(400).json({
        message: "La dirección de envío es obligatoria",
      });
    }

    if (!items?.length) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "El pedido no tiene productos",
      });
    }

    const productIds = items.map((item: any) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    if (products.length !== productIds.length) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Uno o más productos no existen",
      });
    }

    const orderItems = [];

    for (const item of items) {
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

      const selectedModifiers = item.modifiers || [];

      let modifiersTotal = 0;

      const orderModifiers = selectedModifiers.map((selectedModifier: any) => {
        const productModifier = product.modifiers?.find(
          (modifier: any) => modifier.id === selectedModifier.id,
        );

        if (!productModifier) {
          throw new Error(`Modificador no válido para ${product.name}`);
        }

        const selectedOptions = selectedModifier.options || [];

        const validOptions = selectedOptions.map((selectedOption: any) => {
          const productOption = productModifier.options.find(
            (option: any) => option.id === selectedOption.id,
          );

          if (!productOption) {
            throw new Error(`Opción no válida para ${product.name}`);
          }

          modifiersTotal += Number(productOption.price || 0);

          return {
            id: productOption.id,
            label: productOption.label,
            price: productOption.price,
            image: productOption.image,
          };
        });

        return {
          id: productModifier.id,
          name: productModifier.name,
          type: productModifier.type,
          options: validOptions,
        };
      });

      const customImages = (item.customImageIndexes || [])
        .map((index: number) => uploadedImages[index])
        .filter(Boolean);

      product.stock -= quantity;
      await product.save({ session });

      const unitPrice = product.price + modifiersTotal;
      const itemSubtotal = unitPrice * quantity;

      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        quantity,
        unitPrice,
        basePrice: product.price,
        modifiersTotal,
        subtotal: itemSubtotal,
        color: item.color,
        size: item.size,
        image: product.images?.[0],
        customization: item.customization,
        customText: item.customText,
        modifiers: orderModifiers,
        customImages,
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const shippingCost = calculateShipping(orderItems, shippingAddress.country);

    const total = subtotal + shippingCost;

    const [order] = await Order.create(
      [
        {
          customerName,
          email,
          phone,
          user: req.user?.id,
          shippingAddress,
          items: orderItems,
          subtotal,
          shippingCost,
          total,
          status: "pending",
          paymentMethod,
          sumupCheckoutId,
          sumupCheckoutReference,
          notes,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return res.status(201).json({
      message: "Pedido creado correctamente",
      order,
    });
  } catch (error: any) {
    await session.abortTransaction();

    return res.status(400).json({
      message: error.message || "Error creando pedido",
    });
  } finally {
    session.endSession();
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("user", "name username email profileImage")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch {
    return res.status(500).json({
      message: "Error obteniendo pedidos",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name username email profileImage",
    );

    if (!order) {
      return res.status(404).json({
        message: "Pedido no encontrado",
      });
    }

    return res.json(order);
  } catch {
    return res.status(500).json({
      message: "Error obteniendo pedido",
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const validStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Estado no válido",
      });
    }

    const updateData: any = {
      status,
    };

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({
        message: "Pedido no encontrado",
      });
    }

    return res.json({
      message: "Estado del pedido actualizado",
      order,
    });
  } catch {
    return res.status(500).json({
      message: "Error actualizando pedido",
    });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({
      $or: [{ user: req.user?.id }, { email: req.user?.email }],
    }).sort({
      createdAt: -1,
    });

    return res.json(orders);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error obteniendo pedidos",
    });
  }
};
