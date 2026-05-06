import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Datos no válidos",
            errors: errors.array()
        });
    }

    next();
};