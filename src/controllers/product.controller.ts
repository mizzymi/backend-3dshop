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
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({
            message: "Producto actualizado correctamente",
            product
        });
    } catch {
        res.status(500).json({ message: "Error actualizando producto" });
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