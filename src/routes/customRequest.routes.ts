import { Router } from "express";

import {
    createCustomRequest,
    getCustomRequests
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
    createCustomRequest
);

router.get(
    "/",
    protect,
    protectAdmin,
    getCustomRequests
);

export default router;