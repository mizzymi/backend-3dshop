import { Router } from "express";
import { upload } from "../middleware/upload";
import { protect, protectAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProductValidator, updateProductValidator } from "../validators/product.validator";
import {
    getProducts,
    getProductById,
    createProductWithImages,
    updateProduct,
    deleteProduct,
    addProductReview
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
    upload.array("images", 8),
    updateProductValidator,
    validate,
    updateProduct
);

router.delete("/:id", protectAdmin, deleteProduct);

router.post("/:productId/reviews", protect, addProductReview);

export default router;