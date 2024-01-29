import express from "express";
import authController from "../controllers/AuthController.js";
const router = express.Router();


router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/forgot', authController.forgotPassword);

router.post("/verify-otp", authController.verifyOTP);


router.post("/reset", authController.resetPassword);

router.put('/logout', authController.logout);




export default router;