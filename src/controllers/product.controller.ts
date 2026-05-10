import { Request, Response } from "express";
import Product from "../models/Product";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const getProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch {
        res.status(500).json({ message: "Error obteniendo productos" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(product);
    } catch {
        res.status(500).json({ message: "Error obteniendo producto" });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Producto creado correctamente",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creando producto",
            error
        });
    }
};

export const createProductWithImages = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        const imageUrls = files?.length
            ? await Promise.all(
                files.map((file) => uploadToCloudinary(file.buffer))
            )
            : [];

        const product = await Product.create({
            ...req.body,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            category: JSON.parse(req.body.category || "[]"),
            customizable: req.body.customizable === "true",
            featured: req.body.featured === "true",
            colors: JSON.parse(req.body.colors || "[]"),
            sizes: JSON.parse(req.body.sizes || "[]"),
            images: imageUrls
        });

        res.status(201).json({
            message: "Producto creado con imágenes correctamente",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creando producto con imágenes",
            error
        });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[] | undefined;

        const parseArray = (value: any) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;

            try {
                return JSON.parse(value);
            } catch {
                return [];
            }
        };

        const newImageUrls = files?.length
            ? await Promise.all(files.map((file) => uploadToCloudinary(file.buffer)))
            : [];

        const existingImages = parseArray(req.body.existingImages);

        const updateData: any = {
            name: req.body.name,
            description: req.body.description,
            category: parseArray(req.body.category),
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            customizable: req.body.customizable === "true" || req.body.customizable === true,
            featured: req.body.featured === "true" || req.body.featured === true,
            colors: parseArray(req.body.colors),
            sizes: parseArray(req.body.sizes),
            images: [...existingImages, ...newImageUrls]
        };

        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined || Number.isNaN(updateData[key])) {
                delete updateData[key];
            }
        });

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({
            message: "Producto actualizado correctamente",
            product
        });
    } catch (error: any) {
        console.error("UPDATE PRODUCT ERROR:", error);

        res.status(500).json({
            message: "Error actualizando producto",
            error: error.message || error
        });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({
            message: "Producto eliminado correctamente"
        });
    } catch {
        res.status(500).json({ message: "Error eliminando producto" });
    }
};

export const addProductReview = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({
                message: "Rating y comentario son obligatorios",
            });
        }

        const ratingNumber = Number(rating);

        if (ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({
                message: "El rating debe estar entre 1 y 5",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Producto no encontrado",
            });
        }

        const user = await User.findById(req.user?.id);

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado",
            });
        }

        const alreadyReviewed = product.reviews.find(
            (review) => review.user.toString() === user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                message: "Ya has dejado una reseña en este producto",
            });
        }

        product.reviews.push({
            user: user._id,
            username: user.username,
            profileImage: user.profileImage,
            rating: ratingNumber,
            comment,
        } as any);

        product.ratingCount = product.reviews.length;

        product.ratingAverage =
            product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length;

        user.myReviews.push({
            product: product._id,
            rating: ratingNumber,
            comment,
        } as any);

        await product.save();
        await user.save();

        res.status(201).json({
            message: "Reseña añadida correctamente",
            ratingAverage: product.ratingAverage,
            ratingCount: product.ratingCount,
            reviews: product.reviews,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error al añadir reseña",
        });
    }
};