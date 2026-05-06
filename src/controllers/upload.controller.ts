import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const uploadProductImages = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "No se han enviado imágenes"
            });
        }

        const imageUrls = await Promise.all(
            files.map((file) => uploadToCloudinary(file.buffer))
        );

        res.status(201).json({
            message: "Imágenes subidas correctamente",
            images: imageUrls
        });
    } catch (error) {
        res.status(500).json({
            message: "Error subiendo imágenes",
            error
        });
    }
};