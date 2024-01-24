import express from "express";
import CheckoutController from "../controllers/CheckoutController.js";
import { verifyAccessToken } from "../helpers/jwtHelper.js";

const router = express.Router();


router.get('/config', verifyAccessToken, CheckoutController.config)
router.post('/', verifyAccessToken, CheckoutController.createCheckout)
export default router;