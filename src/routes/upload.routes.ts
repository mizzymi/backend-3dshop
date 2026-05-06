import { Router } from "express";
import { upload } from "../middleware/upload";
import { uploadProductImages } from "../controllers/upload.controller";

const router = Router();

router.post("/products", upload.array("images", 8), uploadProductImages);

export default router;