import express from "express";
import CartController from "../controllers/CartController.js";
import { verifyAccessToken } from "../helpers/jwtHelper.js";
const router = express.Router();

router.post('/secured', verifyAccessToken, CartController.createCart);
router.put(
    "secured/:id/:quantity",
    verifyAccessToken,
    CartController.updateCartItemCount
);
router.delete("/secured/:id", verifyAccessToken, CartController.removeFromCart);
router.get('/secured', verifyAccessToken, CartController.getCart);



export default router;