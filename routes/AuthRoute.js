import express from "express";
import authController from "../controllers/AuthController.js";
const router = express.Router();


router.post('/login', authController.login);

router.put('/logout', authController.logout);

router.post('/register', authController.register);


export default router;