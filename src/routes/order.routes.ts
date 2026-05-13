import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
} from "../controllers/order.controller";
import { protect, protectAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderValidator } from "../validators/order.validator";
import { upload } from "../middleware/upload";

const router = Router();

router.post(
  "/",
  createOrderValidator,
  validate,
  upload.array("customImages", 10),
  createOrder,
);

router.get("/my-orders", protect, getMyOrders);

router.get("/", protect, protectAdmin, getOrders);
router.get("/:id", protect, protectAdmin, getOrderById);
router.patch("/:id/status", protect, protectAdmin, updateOrderStatus);

export default router;
