import { Request, Response } from "express";
import stripe from "../config/stripe";
import { processOrder } from "../utils/processOrder";

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
            const items = JSON.parse(session.metadata?.items || "[]");
            const shippingAddress = JSON.parse(
                session.metadata?.shippingAddress || "{}"
            );

            await processOrder({
                items,
                shippingAddress,
                customerName: session.metadata?.customerName,
                email: session.metadata?.email || session.customer_email,
                phone: session.metadata?.phone,
                subtotal: Number(session.metadata?.subtotal || 0),
                shippingCost: Number(session.metadata?.shippingCost || 0),
                total: (session.amount_total || 0) / 100,
                paymentMethod: "stripe",
                stripeSessionId: session.id
            });
        } catch (error) {
            console.error("Error procesando webhook:", error);

            return res.status(500).json({
                message: "Error procesando webhook"
            });
        }
    }

    return res.status(200).json({ received: true });
};