import express from "express";
import { isAdmin } from "../helpers/jwtHelper.js";
import UserController from "../controllers/UserController.js";
const router = express.Router();

router.get('/', UserController.getLoggedInUser)
router.put('/', UserController.updateUser);
router.delete('/', UserController.deleteOwnAccount);
router.get('/admin/', isAdmin, UserController.getAllUsers);
router.delete('/admin/:id', isAdmin, UserController.deleteAccount);
export default router;
