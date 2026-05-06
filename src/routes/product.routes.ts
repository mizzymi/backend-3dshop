import { Router } from "express";
import { upload } from "../middleware/upload";
import { protectAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProductValidator, updateProductValidator } from "../validators/product.validator";
import {
    getProducts,
    getProductById,
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
    upload.array("images", 8),
    createProductValidator,
    validate,
    createProductWithImages
);

router.put(
    "/:id",
    protectAdmin,
    updateProductValidator,
    validate,
    updateProduct
);

router.delete("/:id", protectAdmin, deleteProduct);

export default router;