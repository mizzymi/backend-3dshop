import mongoose, { Schema, Document } from "mongoose";

export interface IReview {
    user: mongoose.Types.ObjectId;
    username: string;
    rating: number;
    comment: string;
    profileImage?: string;
    createdAt?: Date;
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    category: string[];
    colors: string[];
    sizes: string[];
    stock: number;
    customizable: boolean;
    featured: boolean;
    reviews: IReview[];
    ratingAverage: number;
    ratingCount: number;
}

const ReviewSchema = new Schema<IReview>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        username: {
            type: String,
            required: true,
        },

        profileImage: {
            type: String,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        images: [{ type: String }],
        category: {
            type: [String],
            default: [],
        },
        colors: [{ type: String }],
        sizes: [{ type: String }],
        stock: {
            type: Number,
            default: 0,
        },
        customizable: {
            type: Boolean,
            default: false,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        reviews: {
            type: [ReviewSchema],
            default: [],
        },
        ratingAverage: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);