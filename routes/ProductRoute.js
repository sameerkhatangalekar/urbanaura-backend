import express from "express";
import { verifyAccessToken, isAdmin } from "../helpers/jwtHelper.js";
import ProductController from "../controllers/ProductController.js";
const router = express.Router();

router.post('/secured/admin/', [verifyAccessToken, isAdmin], ProductController.createProduct);
router.put('/secured/admin/:id', [verifyAccessToken, isAdmin], ProductController.updateProduct)
router.delete('/secured/admin/:id', [verifyAccessToken, isAdmin], ProductController.deleteProduct)
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);
export default router;