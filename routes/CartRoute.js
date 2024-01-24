import express from "express";
import CartController from "../controllers/CartController.js";
import { verifyAccessToken } from "../helpers/jwtHelper.js";
const router = express.Router();

router.post('/', verifyAccessToken, CartController.createCart);
router.put('/', verifyAccessToken, CartController.updateCart);
router.delete('/', verifyAccessToken, CartController.deleteCart);
router.get('/', verifyAccessToken, CartController.getCart);

export default router;