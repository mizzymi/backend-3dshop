import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AuthRequest } from "./auth";

export const optionalAuth = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        return next();
    }

    try {
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as any;

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

    } catch {
        // ignorar token inválido
    }

    next();
};