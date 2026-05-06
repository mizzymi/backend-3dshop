import { Router } from "express";
import { createCustomRequest } from "../controllers/customRequest.controller";
import { validate } from "../middleware/validate";
import { createCustomRequestValidator } from "../validators/customRequest.validator";

const router = Router();

router.post(
    "/",
    createCustomRequestValidator,
    validate,
    createCustomRequest
);

export default router;