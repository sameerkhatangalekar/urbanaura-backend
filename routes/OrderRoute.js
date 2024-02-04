import express from "express";
import OrderController from "../controllers/OrderController.js";
import { isAdmin, verifyAccessToken } from "../helpers/jwtHelper.js";

const router = express.Router();

router.get('/secured/my-orders/', verifyAccessToken, OrderController.getMyOrders);
router.put('/secured/cancel/:id', verifyAccessToken, OrderController.cancelOrder);
router.get('/secured/', [verifyAccessToken, isAdmin], OrderController.getAllOrders);
router.get('/secured/:id', [verifyAccessToken, isAdmin], OrderController.getOrderById);
router.put('/secured/:id', [verifyAccessToken, isAdmin], OrderController.updateOrderStatus);

export default router;