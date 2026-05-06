import { Request, Response } from "express";
import stripe from "../config/stripe";
import Order from "../models/Order";
import Product from "../models/Product";
import {
    sendAdminOrderNotification,
    sendCustomerOrderConfirmation
} from "../utils/orderEmails";

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: any;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error: any) {
        console.error("Webhook signature error:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        try {
            const alreadyExists = await Order.findOne({
                stripeSessionId: session.id
            });

            if (alreadyExists) {
                return res.status(200).json({ received: true });
            }

            const items = JSON.parse(session.metadata?.items || "[]");
            const shippingAddress = JSON.parse(
                session.metadata?.shippingAddress || "{}"
            );

            const orderItems = [];

            for (const item of items) {
                const product = await Product.findOneAndUpdate(
                    {
                        _id: item.productId,
                        stock: { $gte: item.quantity }
                    },
                    {
                        $inc: { stock: -item.quantity }
                    },
                    {
                        new: true
                    }
                );

                if (!product) {
                    throw new Error(
                        `Producto no encontrado o stock insuficiente: ${item.productId}`
                    );
                }

                const itemSubtotal = product.price * item.quantity;

                orderItems.push({
                    productId: product._id.toString(),
                    name: product.name,
                    quantity: item.quantity,
                    unitPrice: product.price,
                    subtotal: itemSubtotal,
                    color: item.color,
                    size: item.size
                });
            }

            const subtotal = Number(session.metadata?.subtotal || 0);
            const shippingCost = Number(session.metadata?.shippingCost || 0);
            const total = (session.amount_total || 0) / 100;

            const email = session.metadata?.email || session.customer_email;

            const order = await Order.create({
                customerName: session.metadata?.customerName,
                email,
                phone: session.metadata?.phone,
                shippingAddress,
                items: orderItems,
                subtotal,
                shippingCost,
                total,
                status: "paid",
                paymentMethod: "stripe",
                stripeSessionId: session.id
            });

            try {
                await sendCustomerOrderConfirmation(order);
                await sendAdminOrderNotification(order);
            } catch (emailError) {
                console.error(
                    "Pedido creado, pero falló el envío de emails:",
                    emailError
                );
            }
        } catch (error) {
            console.error("Error procesando webhook:", error);

            return res.status(500).json({
                message: "Error procesando webhook"
            });
        }
    }

    return res.status(200).json({ received: true });
};