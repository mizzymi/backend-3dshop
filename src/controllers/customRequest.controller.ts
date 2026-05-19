import { Request, Response } from "express";
import CustomRequest from "../models/CustomRequest";
import {
  sendAdminCustomRequestNotification,
  sendCustomerCustomRequestConfirmation,
} from "../utils/customRequestEmails";
import { uploadToProducts } from "../utils/cloudinaryHelpers";

export const createCustomRequest = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    const imageUrls = files?.length
      ? await Promise.all(
          files.map((file) =>
            uploadToProducts(file.buffer, "reimii-3d/custom-requests"),
          ),
        )
      : [];

    const customRequest = await CustomRequest.create({
      ...req.body,
      images: imageUrls,
    });

    try {
      await sendAdminCustomRequestNotification(customRequest);
      await sendCustomerCustomRequestConfirmation(customRequest);
    } catch (emailError) {
      console.error("CUSTOM REQUEST EMAIL ERROR:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Solicitud personalizada creada correctamente",
      customRequest,
    });
  } catch (error) {
    console.error("CUSTOM REQUEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error creando solicitud personalizada",
    });
  }
};

export const getCustomRequests = async (_req: Request, res: Response) => {
  try {
    const customs = await CustomRequest.find().sort({ createdAt: -1 });

    res.json(customs);
  } catch (error) {
    console.error("GET CUSTOM REQUESTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error cargando solicitudes personalizadas",
    });
  }
};

export const updateCustomRequestStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["new", "quoted", "accepted", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado no válido",
      });
    }

    const customRequest = await CustomRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!customRequest) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Estado actualizado correctamente",
      customRequest,
    });
  } catch (error) {
    console.error("UPDATE CUSTOM REQUEST STATUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error actualizando estado",
    });
  }
};
