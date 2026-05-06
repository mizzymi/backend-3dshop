import { Request, Response } from "express";
import stripe from "../config/stripe";
import Product from "../models/Product";
import Order from "../models/Order";
import { calculateShipping } from "../utils/calculateShipping";
import { processOrder } from "../utils/processOrder";

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const { customerName, email, phone, items, shippingAddress } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "El carrito está vacío"
            });
        }

        if (!shippingAddress) {
            return res.status(400).json({
                message: "La dirección de envío es obligatoria"
            });
        }

        const productIds = items.map((item: any) => item.productId);

        const products = await Product.find({
            _id: { $in: productIds }
        });

        let subtotal = 0;

        const line_items = items.map((item: any) => {
            const product = products.find(
                (p) => p._id.toString() === item.productId
            );

            if (!product) {
                throw new Error("Producto no encontrado");
            }

            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${product.name}`);
            }

            subtotal += product.price * item.quantity;

            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: product.name,
                        images: product.images?.slice(0, 1)
                    },
                    unit_amount: Math.round(product.price * 100)
                },
                quantity: item.quantity
            };
        });

        const shippingCost = calculateShipping(
            subtotal,
            shippingAddress.country
        );

        const total = subtotal + shippingCost;

        if (total <= 0) {
            const order = await processOrder({
                items,
                shippingAddress,
                customerName,
                email,
                phone,
                subtotal,
                shippingCost,
                total: 0,
                paymentMethod: "free",
                stripeSessionId: undefined
            });

            return res.json({
                freeOrder: true,
                orderId: order._id,
                redirectUrl: `${process.env.FRONTEND_URL}/success?session_id=free_order_${order._id}`
            });
        }

        if (shippingCost > 0) {
            line_items.push({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: "Envío",
                        images: []
                    },
                    unit_amount: Math.round(shippingCost * 100)
                },
                quantity: 1
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            customer_email: email,
            metadata: {
                customerName,
                email,
                phone: phone || "",
                items: JSON.stringify(items),
                shippingAddress: JSON.stringify(shippingAddress),
                subtotal: subtotal.toString(),
                shippingCost: shippingCost.toString()
            },
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`
        });

        return res.json({ url: session.url });
    } catch (error: any) {
        return res.status(400).json({
            message: error.message || "Error creando sesión de pago"
        });
    }
};

export const getCheckoutSessionResult = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId as string;

        if (sessionId.startsWith("free_order_")) {
            const orderId = sessionId.replace("free_order_", "");

            const order = await Order.findById(orderId);

            return res.json({
                session: null,
                order
            });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        const order = await Order.findOne({
            stripeSessionId: sessionId
        });

        return res.json({
            session: {
                id: session.id,
                paymentStatus: session.payment_status,
                customerEmail: session.customer_email,
                amountTotal: session.amount_total,
                currency: session.currency
            },
            order
        });
    } catch (error: any) {
        return res.status(400).json({
            message: error.message || "Error obteniendo sesión de pago"
        });
    }
};