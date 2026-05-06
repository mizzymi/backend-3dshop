import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller";
import { protectAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderValidator } from "../validators/order.validator";

const router = Router();

router.post(
    "/",
    createOrderValidator,
    validate,
    createOrder
);

router.get("/", protectAdmin, getOrders);
router.get("/:id", protectAdmin, getOrderById);
router.patch("/:id/status", protectAdmin, updateOrderStatus);

export default router;