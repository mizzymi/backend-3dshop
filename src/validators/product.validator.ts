import { body } from "express-validator";

export const createProductValidator = [
    body("name")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ min: 3 })
        .withMessage("El nombre debe tener al menos 3 caracteres"),

    body("slug")
        .notEmpty()
        .withMessage("El slug es obligatorio")
        .isLength({ min: 3 })
        .withMessage("El slug debe tener al menos 3 caracteres"),

    body("description")
        .notEmpty()
        .withMessage("La descripción es obligatoria")
        .isLength({ min: 10 })
        .withMessage("La descripción debe tener al menos 10 caracteres"),

    body("price")
        .notEmpty()
        .withMessage("El precio es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser un número mayor o igual a 0"),

    body("category")
        .notEmpty()
        .withMessage("La categoría es obligatoria"),

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("El stock debe ser un número entero mayor o igual a 0")
];