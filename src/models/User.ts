import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IShippingAddress {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
}

export interface IMyReview {
    product: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt?: Date;
}

export interface IUser extends Document {
    profileImage: string;
    username: string;
    email: string;
    password: string;
    name: string;
    role: "user" | "admin";
    shippingAddresses: IShippingAddress[];
    savedProducts: mongoose.Types.ObjectId[];
    cart: ICartItem[];
    myReviews: IMyReview[];
    comparePassword(password: string): Promise<boolean>;
}

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'España' },
        isDefault: { type: Boolean, default: false },
    },
    { _id: true }
);

const userSchema = new Schema<IUser>(
    {
        profileImage: {
            type: String,
            default: 'https://placehold.co/300x300?text=REIMII+3D',
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        shippingAddresses: {
            type: [shippingAddressSchema],
            default: [],
        },

        savedProducts: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                },
            ],
            default: [],
        },

        cart: {
            type: [
                {
                    product: {
                        type: Schema.Types.ObjectId,
                        ref: "Product",
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        default: 1,
                        min: 1,
                    },
                },
            ],
            default: [],
        },

        myReviews: {
            type: [
                {
                    product: {
                        type: Schema.Types.ObjectId,
                        ref: "Product",
                        required: true,
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
            ],
            default: [],
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);