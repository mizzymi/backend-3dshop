import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;

    color?: string;
    size?: string;

    image?: string;

    customization?: string;

    customText?: string;
}

export interface IShippingAddress {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
}

export interface IOrder extends Document {
    customerName: string;
    email: string;
    phone?: string;
    user?: mongoose.Types.ObjectId;
    shippingAddress: IShippingAddress;
    items: IOrderItem[];
    subtotal: number;
    shippingCost: number;
    total: number;
    status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
    paymentMethod: "manual" | "stripe" | "free";
    stripeSessionId?: string;
    trackingNumber?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },

        shippingAddress: {
            fullName: {
                type: String,
                required: true,
                trim: true,
            },

            phone: {
                type: String,
                required: true,
                trim: true,
            },

            street: {
                type: String,
                required: true,
                trim: true,
            },

            city: {
                type: String,
                required: true,
                trim: true,
            },

            province: {
                type: String,
                required: true,
                trim: true,
            },

            postalCode: {
                type: String,
                required: true,
                trim: true,
            },

            country: {
                type: String,
                required: true,
                default: "España",
                trim: true,
            },
        },

        items: [
            {
                productId: {
                    type: String,
                    required: true,
                },

                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },

                unitPrice: {
                    type: Number,
                    required: true,
                    min: 0,
                },

                subtotal: {
                    type: Number,
                    required: true,
                    min: 0,
                },

                color: {
                    type: String,
                    trim: true,
                },

                size: {
                    type: String,
                    trim: true,
                },

                image: {
                    type: String,
                },

                customization: {
                    type: String,
                    trim: true,
                },

                customText: {
                    type: String,
                    trim: true,
                },
            },
        ],

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        shippingCost: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },

        paymentMethod: {
            type: String,
            enum: ["manual", "stripe", "free"],
            default: "stripe",
        },

        stripeSessionId: {
            type: String,
            unique: true,
            sparse: true,
        },

        trackingNumber: {
            type: String,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IOrder>("Order", OrderSchema);