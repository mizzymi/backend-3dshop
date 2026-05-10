import { Router } from "express";

import {
    createCheckoutSession,
    getCheckoutSessionResult
} from "../controllers/payment.controller";

import { optionalAuth } from "../middleware/optionalAuth";

const router = Router();

router.post(
    "/checkout",
    optionalAuth,
    createCheckoutSession
);

router.get(
    "/session/:sessionId",
    getCheckoutSessionResult
);

export default router;