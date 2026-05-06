import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    customerName: string;
    email: string;
    phone?: string;
    shippingAddress: {
        fullName: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
    items: {
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
        color?: string;
        size?: string;
    }[];
    subtotal: number;
    shippingCost: number;
    total: number;
    status: "pending" | "paid" | "processing" | "shipped" | "cancelled";
    paymentMethod: "manual" | "stripe";
    stripeSessionId?: string;
}

const OrderSchema = new Schema<IOrder>(
    {
        customerName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },

        shippingAddress: {
            fullName: { type: String, required: true },
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            province: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true, default: "España" }
        },

        items: [
            {
                productId: { type: String, required: true },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                unitPrice: { type: Number, required: true },
                subtotal: { type: Number, required: true },
                color: { type: String },
                size: { type: String }
            }
        ],

        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true },

        status: {
            type: String,
            enum: ["pending", "paid", "processing", "shipped", "cancelled"],
            default: "pending"
        },

        paymentMethod: {
            type: String,
            enum: ["manual", "stripe"],
            default: "manual"
        },

        stripeSessionId: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);