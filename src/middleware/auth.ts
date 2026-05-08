import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
    role?: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const protect = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Token no proporcionado',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        req.user = decoded;

        next();
    } catch {
        return res.status(401).json({
            message: 'Token inválido',
        });
    }
};

export const protectAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'No autorizado',
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Acceso denegado',
        });
    }

    next();
};