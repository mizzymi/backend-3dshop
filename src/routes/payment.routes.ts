import { Router } from "express";
import {
    createCheckoutSession,
    getCheckoutSessionResult
} from "../controllers/payment.controller";

const router = Router();

router.post("/checkout", createCheckoutSession);
router.get("/session/:sessionId", getCheckoutSessionResult);

export default router;