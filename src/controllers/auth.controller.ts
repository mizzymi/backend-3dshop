import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Credenciales incorrectas"
            });
        }

        const token = jwt.sign(
            { role: "admin", email },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login correcto",
            token
        });
    } catch {
        res.status(500).json({
            message: "Error en login"
        });
    }
};