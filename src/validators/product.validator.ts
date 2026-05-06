import { body } from "express-validator";

export const updateProductValidator = [
    body("name")
        .optional()
        .notEmpty()
        .withMessage("El nombre no puede estar vacío"),

    body("description")
        .optional()
        .isString()
        .withMessage("La descripción no es válida"),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("El precio no es válido"),

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("El stock no es válido"),

    body("category")
        .optional()
        .isString()
        .withMessage("La categoría no es válida")
];

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