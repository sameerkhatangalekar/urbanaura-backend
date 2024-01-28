import express from "express";
import OrderController from "../controllers/OrderController.js";
import { verifyAccessToken } from "../helpers/jwtHelper.js";

const router = express.Router();

router.get('/my-orders/', verifyAccessToken, OrderController.getMyOrders);

export default router;