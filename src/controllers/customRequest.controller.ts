import { Request, Response } from "express";
import CustomRequest from "../models/CustomRequest";
import { transporter } from "../config/mailer";

export const createCustomRequest = async (
    req: Request,
    res: Response
) => {

    try {

        const customRequest = await CustomRequest.create(req.body);

        // EMAIL A REIMII
        await transporter.sendMail({
            from: '"Reimii 3D" <noreply@reimii.com>',
            to: "shop@reimii.com",
            subject: "New Custom 3D Request",
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h1>New Custom Request</h1>

                    <p><b>Name:</b> ${customRequest.name}</p>
                    <p><b>Email:</b> ${customRequest.email}</p>
                    <p><b>Phone:</b> ${customRequest.phone || "-"}</p>
                    <p><b>Type:</b> ${customRequest.type || "-"}</p>
                    <p><b>Size:</b> ${customRequest.size || "-"}</p>
                    <p><b>Budget:</b> ${customRequest.budget || "-"}</p>
                    <p><b>Deadline:</b> ${customRequest.deadline || "-"}</p>

                    <hr />

                    <p>${customRequest.description}</p>
                </div>
            `
        });

        // EMAIL AL CLIENTE
        await transporter.sendMail({
            from: '"Reimii 3D" <shop@reimii.com>',
            to: customRequest.email,
            subject: "We received your request",
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h1>Thank you for your request!</h1>

                    <p>
                        We received your custom 3D request successfully.
                    </p>

                    <p>
                        Our team will contact you soon.
                    </p>

                    <hr />

                    <p>
                        Reimii 3D
                    </p>
                </div>
            `
        });

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