import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    colors: string[];
    sizes: string[];
    stock: number;
    customizable: boolean;
    featured: boolean;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        images: [{ type: String }],
        category: { type: String, required: true },
        colors: [{ type: String }],
        sizes: [{ type: String }],
        stock: { type: Number, default: 0 },
        customizable: { type: Boolean, default: false },
        featured: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);