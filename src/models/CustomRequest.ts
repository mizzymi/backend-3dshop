import mongoose, { Schema, Document } from "mongoose";

export interface ICustomRequest extends Document {
    name: string;
    email: string;
    phone?: string;

    type?: string;
    size?: string;

    images?: string[];

    description: string;

    budget?: number;
    deadline?: Date;

    status: "new" | "quoted" | "accepted" | "rejected";
}

const CustomRequestSchema = new Schema<ICustomRequest>(
    {
        name: { type: String, required: true },

        email: { type: String, required: true },

        phone: { type: String },

        type: { type: String },

        size: { type: String },

        images: [{ type: String }],
        
        description: {
            type: String,
            required: true
        },

        budget: { type: Number },

        deadline: { type: Date },

        status: {
            type: String,
            enum: ["new", "quoted", "accepted", "rejected"],
            default: "new"
        }
    },
    { timestamps: true }
);

export default mongoose.model<ICustomRequest>(
    "CustomRequest",
    CustomRequestSchema
);