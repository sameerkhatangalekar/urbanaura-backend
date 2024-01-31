import express from "express";
import OrderController from "../controllers/OrderController.js";
import { isAdmin, verifyAccessToken } from "../helpers/jwtHelper.js";

const router = express.Router();

router.get('/secured/my-orders/', verifyAccessToken, OrderController.getMyOrders);
router.get('/secured/', [verifyAccessToken, isAdmin], OrderController.getAllOrders);
router.get('/secured/:id', [verifyAccessToken, isAdmin], OrderController.getOrderById);

export default router;