import express from "express";

import {
    registerUser,
    loginUser,
    getProfile,
    addShippingAddress,
    editProfile,
    toggleSavedProduct,
    getSavedProducts,
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getMyReviews,
} from "../controllers/user.controller";

import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profileImage"), editProfile);

router.post("/address", protect, addShippingAddress);

router.post("/saved/:productId", protect, toggleSavedProduct);
router.get("/saved", protect, getSavedProducts);

router.get("/reviews", protect, getMyReviews);

router.post("/cart", protect, addToCart);
router.get("/cart", protect, getCart);
router.put("/cart/:productId", protect, updateCartItem);
router.delete("/cart/:productId", protect, removeFromCart);
router.delete("/cart", protect, clearCart);

export default router;