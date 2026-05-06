import { body } from "express-validator";

export const createOrderValidator = [
    body("customerName")
        .notEmpty()
        .withMessage("El nombre del cliente es obligatorio"),

    body("email")
        .notEmpty()
        .withMessage("El email es obligatorio")
        .isEmail()
        .withMessage("El email no es válido"),

    body("phone")
        .optional()
        .isString()
        .withMessage("El teléfono debe ser texto"),

    body("items")
        .isArray({ min: 1 })
        .withMessage("El pedido debe tener al menos un producto"),

    body("items.*.productId")
        .notEmpty()
        .withMessage("Cada producto debe tener productId"),

    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("La cantidad debe ser mínimo 1"),

    body("items.*.color")
        .optional()
        .isString()
        .withMessage("El color debe ser texto"),

    body("items.*.size")
        .optional()
        .isString()
        .withMessage("El tamaño debe ser texto")
];