import { Request, Response } from "express";
import CustomRequest from "../models/CustomRequest";

export const createCustomRequest = async (req: Request, res: Response) => {
    try {
        const customRequest = await CustomRequest.create(req.body);

        res.status(201).json({
            message: "Solicitud personalizada creada correctamente",
            customRequest
        });
    } catch {
        res.status(500).json({
            message: "Error creando solicitud personalizada"
        });
    }
};