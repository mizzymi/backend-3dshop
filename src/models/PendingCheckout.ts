import mongoose, { Schema, Document } from "mongoose";

export interface IPendingCheckout extends Document {
  checkoutReference: string;
  checkoutId: string;
  checkoutUrl: string;
  customerName: string;
  email: string;
  phone?: string;
  user?: mongoose.Types.ObjectId;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  items: {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
    customization?: string;
    customText?: string;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

const PendingItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String },
    size: { type: String },
    customization: { type: String },
    customText: { type: String },
  },
  { _id: false },
);

const PendingCheckoutSchema = new Schema(
  {
    checkoutReference: { type: String, required: true, unique: true },
    checkoutId: { type: String, required: true, unique: true },
    checkoutUrl: { type: String, required: true },

    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    items: {
      type: [PendingItemSchema],
      required: true,
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 5,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  },
);

export default mongoose.model<IPendingCheckout>(
  "PendingCheckout",
  PendingCheckoutSchema,
);
