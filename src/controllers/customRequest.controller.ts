import { Request, Response } from "express";
import CustomRequest from "../models/CustomRequest";
import {
    sendAdminCustomRequestNotification,
    sendCustomerCustomRequestConfirmation
} from "../utils/customRequestEmails";

export const createCustomRequest = async (req: Request, res: Response) => {
    try {
        const customRequest = await CustomRequest.create(req.body);

        try {
            await sendAdminCustomRequestNotification(customRequest);
            await sendCustomerCustomRequestConfirmation(customRequest);
        } catch (emailError) {
            console.error("CUSTOM REQUEST EMAIL ERROR:", emailError);
        }

        res.status(201).json({
            success: true,
            message: "Solicitud personalizada creada correctamente",
            customRequest
        });
    } catch (error) {
        console.error("CUSTOM REQUEST ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Error creando solicitud personalizada"
        });
    }
};