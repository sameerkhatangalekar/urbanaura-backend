import { Router } from "express";
import { isAdmin, verifyAccessToken } from "../helpers/jwtHelper.js";
import StatsController from "../controllers/StatsController.js";

const router = Router();


router.get('/secured/admin/total', [verifyAccessToken, isAdmin], StatsController.getTotalStats);
router.get('/secured/admin/recent/users', [verifyAccessToken, isAdmin], StatsController.getRecentWeekUsers);
router.get('/secured/admin/recent/orders', [verifyAccessToken, isAdmin], StatsController.getRecentWeekOrders);
router.get('/secured/admin/year/stats', [verifyAccessToken, isAdmin], StatsController.getOrderCountsByMonth)


export default router;