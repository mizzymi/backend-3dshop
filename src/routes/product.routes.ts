import { Router } from "express";
import { upload } from "../middleware/upload";
import { protectAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProductValidator } from "../validators/product.validator";
import {
    getProducts,
    getProductById,
    createProduct,
    createProductWithImages,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
    "/",
    protectAdmin,
    createProductValidator,
    validate,
    createProduct
);

router.post(
    "/with-images",
    protectAdmin,
    upload.array("images", 8),
    createProductValidator,
    validate,
    createProductWithImages
);

router.put(
    "/:id",
    protectAdmin,
    createProductValidator,
    validate,
    updateProduct
);

router.delete("/:id", protectAdmin, deleteProduct);

export default router;