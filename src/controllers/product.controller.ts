import { Request, Response } from "express";
import Product from "../models/Product";
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
            category: req.body.category,
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