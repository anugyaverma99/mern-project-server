const express=require('express');
const authController=require('../controller/authController');
const router=express.Router();
const {body}=require('express-validator');
const { sendResetPasswordToken, resetPassword } = require("../controller/authController");

const loginValidator=[
    body('username')
    .notEmpty().withMessage('username is required')
    .isEmail().withMessage('username must be a valid email'),
    body('password')
    .notEmpty().withMessage("password is required")
    .isLength({min:3}).withMessage("password must be 3 characters long")

];
router.post('/login',loginValidator,authController.login);
router.post('/logout',authController.logout);
router.get('/is-user-logged-in',authController.isUserLoggedIn);
router.post('/register',authController.register);
router.post('/google-auth',authController.googleAuth);
router.post("/send-reset-token", sendResetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports=router;