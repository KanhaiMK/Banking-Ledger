const express = require("express")
const authController = require("../controllers/auth.controller")
const router = express.Router()

/* POST /auth/register */
router.post("/register", authController.userRegisterController)

/* POST /auth/login */
router.post("/login", authController.userLoginController)

// POST /auth/logout
router.post("/logout", authController.userLogoutController)

// GET routes - render pages
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { query: req.query })
})

router.get('/verify-otp', (req, res) => {
    res.render('verify-otp', { query: req.query })
})

router.get('/reset-password', (req, res) => {
    res.render('reset-password', { query: req.query })
})

// POST routes - handle form submissions
router.post('/forgot-password', authController.forgotPasswordController)
router.post('/verify-otp', authController.verifyOTPController)
router.post('/reset-password', authController.resetPasswordController)

// POST resend OTP
router.post('/resend-otp',authController.resendOTP)

module.exports = router