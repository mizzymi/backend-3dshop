import mongoose, { Schema, Document } from "mongoose";

export interface IReview {
  user: mongoose.Types.ObjectId;
  username: string;
  rating: number;
  comment: string;
  profileImage?: string;
  images?: string[];
  createdAt?: Date;
}

export interface IProductVariant {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  sku?: string;
}
export interface IModifierOption {
  id: string;
  label: string;
  price: number;
  image?: string;
  description?: string;
  requiresCustomerImage: boolean;
}

export interface IModifier {
  id: string;
  name: string;
  type: "single" | "multiple";
  required?: boolean;
  options: IModifierOption[];
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

  variants: IProductVariant[];

  modifiers: IModifier[];

  stock: number;
  weight: number;
  width: number;
  height: number;
  depth: number;

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

    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

const ModifierOptionSchema = new Schema<IModifierOption>(
  {
    id: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
    },

    image: {
      type: String,
    },

    requiresCustomerImage: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const ModifierSchema = new Schema<IModifier>(
  {
    id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: {
      type: [ModifierOptionSchema],
      default: [],
    },
  },
  { _id: false },
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    id: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
    },
  },
  { _id: false },
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

    variants: {
      type: [ProductVariantSchema],
      default: [],
    },

    modifiers: {
      type: [ModifierSchema],
      default: [],
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    width: {
      type: Number,
      default: 0,
      min: 0,
    },

    height: {
      type: Number,
      default: 0,
      min: 0,
    },

    depth: {
      type: Number,
      default: 0,
      min: 0,
    },

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
  { timestamps: true },
);

export default mongoose.model<IProduct>("Product", ProductSchema);
