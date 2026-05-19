import { Router } from "express";

import {
  createCustomRequest,
  getCustomRequests,
  updateCustomRequestStatus,
} from "../controllers/customRequest.controller";

import { protect, protectAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upload } from "../middleware/upload";

import { createCustomRequestValidator } from "../validators/customRequest.validator";

const router = Router();

router.post(
  "/",
  upload.array("images", 10),
  createCustomRequestValidator,
  validate,
  createCustomRequest,
);

router.get("/", protect, protectAdmin, getCustomRequests);

router.patch("/:id/status", protect, protectAdmin, updateCustomRequestStatus);

export default router;
