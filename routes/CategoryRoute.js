import express from "express";
import CategoryController from "../controllers/CategoryController.js";
import { verifyAccessToken, isAdmin } from '../helpers/jwtHelper.js'
const router = express.Router();

router.get('/', CategoryController.getAllCategories);
router.post('/secured/admin/', [verifyAccessToken, isAdmin], CategoryController.createCategory);
router.put('/secured/admin/:id', [verifyAccessToken, isAdmin], CategoryController.updateCategory);

//TODO delete route

export default router;