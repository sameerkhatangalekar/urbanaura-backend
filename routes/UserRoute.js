import express from "express";
import { verifyAccessToken, isAdmin } from "../helpers/jwtHelper.js";
import UserController from "../controllers/UserController.js";
const router = express.Router();

router.get('/secured', verifyAccessToken, UserController.getLoggedInUser)
router.put('/secured', verifyAccessToken, UserController.updateUser);
router.delete('/secured', verifyAccessToken, UserController.deleteOwnAccount);
router.get('/secured/admin/', [verifyAccessToken, isAdmin], UserController.getAllUsers);
router.delete('/secured/admin/:id', [verifyAccessToken, isAdmin], UserController.deleteAccount);
router.delete('/secured/admin/:id', [verifyAccessToken, isAdmin], UserController.deleteAccount);
export default router;
