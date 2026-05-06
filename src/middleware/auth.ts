import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    role: string;
    email: string;
}

export const protectAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Token no proporcionado"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "No autorizado"
            });
        }

        next();
    } catch {
        return res.status(401).json({
            message: "Token inválido"
        });
    }
};