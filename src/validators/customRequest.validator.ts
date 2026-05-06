import { body } from "express-validator";

export const createCustomRequestValidator = [
    body("name")
        .notEmpty()
        .withMessage("El nombre es obligatorio"),

    body("email")
        .notEmpty()
        .withMessage("El email es obligatorio")
        .isEmail()
        .withMessage("El email no es válido"),

    body("description")
        .notEmpty()
        .withMessage("La descripción es obligatoria")
        .isLength({ min: 20 })
        .withMessage("La descripción debe tener al menos 20 caracteres"),

    body("budget")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("El presupuesto debe ser mayor o igual a 0")
];