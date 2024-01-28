import express from "express";
import CartController from "../controllers/CartController.js";
import { verifyAccessToken } from "../helpers/jwtHelper.js";
const router = express.Router();

router.post('/', verifyAccessToken, CartController.createCart);
router.put(
    "/:id/:quantity",
    verifyAccessToken,
    CartController.updateCartItemCount
);
router.delete("/:id", verifyAccessToken, CartController.removeFromCart);
router.get('/', verifyAccessToken, CartController.getCart);

export default router;