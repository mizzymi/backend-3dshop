import Order from "../models/Order";
import Product from "../models/Product";
import {
  sendAdminOrderNotification,
  sendCustomerOrderConfirmation,
} from "./orderEmails";

export const processOrder = async ({
  items,
  shippingAddress,
  customerName,
  email,
  phone,
  subtotal,
  shippingCost,
  total,
  paymentMethod,
  sumupCheckoutId,
  sumupCheckoutReference,
  user,
}: any) => {
  if (sumupCheckoutId) {
    const alreadyExists = await Order.findOne({ sumupCheckoutId });

    if (alreadyExists) {
      return alreadyExists;
    }
  }

  const orderItems = [];

  for (const item of items) {
    const product = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { stock: -item.quantity },
      },
      {
        new: true,
      },
    );

    if (!product) {
      throw new Error(
        `Producto no encontrado o stock insuficiente: ${item.productId}`,
      );
    }

    orderItems.push({
      productId: product._id.toString(),
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: product.price * item.quantity,
      color: item.color,
      size: item.size,
      image: product.images?.[0],
      customization: item.customization,
      customText: item.customText,
    });
  }

  const order = await Order.create({
    customerName,
    email,
    phone,
    user,
    shippingAddress,
    items: orderItems,
    subtotal,
    shippingCost,
    total,
    status: "paid",
    paymentMethod,
    sumupCheckoutId,
    sumupCheckoutReference,
  });

  try {
    await sendCustomerOrderConfirmation(order);
    await sendAdminOrderNotification(order);
  } catch (emailError) {
    console.error("Pedido creado, pero falló el envío de emails:", emailError);
  }

  return order;
};
