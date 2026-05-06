import { Router } from "express";

import { createCustomRequest } from "../controllers/customRequest.controller";

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

export default router;