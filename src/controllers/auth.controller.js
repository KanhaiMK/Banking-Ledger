const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService=require("../services/email.service")
const tokenBlackListModel=require("../models/blackList.model")
const otpModel = require('../models/otp.model')

/**
 * - user register controller
 * - POST /auth/register
 */

async function userRegisterController(req,res) {
    const {email, password, name} = req.body;
    const isExists = await userModel.findOne({
        email: email
    })
    if(isExists) {
        return res.status(422).redirect('/?error=email_exists')
    }
    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"})

    res.cookie("token", token)

    res.status(201).render('register-success', {
        name: req.body.name,
        email: req.body.email
    })

    await emailService.sendRegistrationEmail(user.email,user.name)
}

async function userLoginController(req, res) {
    const {email, password} = req.body;
    const user = await userModel.findOne({email}).select("+password +systemUser")
    
    if(!user) {
        return res.status(401).redirect('/login?error=user_not_found')
    }
    
    const isValidPassword = await user.comparePassword(password);
    if(!isValidPassword) {
        return res.status(401).redirect('/login?error=wrong_password')
    }
    
    if(user.systemUser) {
        const systemToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"})
        res.cookie("systemToken", systemToken)
        return res.status(200).redirect('/system')
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"})
    res.cookie("token", token)
    return res.status(200).redirect('/accounts')
}

async function userLogoutController(req, res) {
    const token = req.cookies.token || req.cookies.systemToken || req.headers.authorization?.split(" ")[1]

    if(!token) {
        return res.status(200).redirect('/login')
    }

    await tokenBlackListModel.create({ token })

    res.cookie("token", "")
    res.cookie("systemToken", "")
    res.clearCookie("token")
    res.clearCookie("systemToken")

    res.status(200).redirect('/login')
}

// Step 1 - Send OTP
async function forgotPasswordController(req, res) {
    const { email } = req.body;

    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(404).redirect('/auth/forgot-password?error=email_not_found')
    }

    // Generate 4 digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000))

    // Delete any existing OTPs for this email
    await otpModel.deleteMany({ email })

    // Save new OTP with 10 min expiry
    await otpModel.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    })

    // Send OTP email
    await emailService.sendOTPEmail(email, user.name, otp)

    return res.status(200).redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
}

// Step 2 - Verify OTP
async function verifyOTPController(req, res) {
    const { email, otp } = req.body;

    const otpRecord = await otpModel.findOne({ email, otp, used: false })

    if (!otpRecord) {
        return res.status(400).redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}&error=invalid_otp`)
    }

    if (otpRecord.expiresAt < new Date()) {
        return res.status(400).redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}&error=otp_expired`)
    }

    // Mark OTP as used
    await otpModel.findByIdAndUpdate(otpRecord._id, { used: true })

    return res.status(200).redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`)
}

// Step 3 - Reset Password
async function resetPasswordController(req, res) {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).redirect(`/auth/reset-password?email=${encodeURIComponent(email)}&error=password_mismatch`)
    }

    if (password.length < 6) {
        return res.status(400).redirect(`/auth/reset-password?email=${encodeURIComponent(email)}&error=password_short`)
    }

    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(404).redirect('/auth/forgot-password?error=email_not_found')
    }

    user.password = password
    await user.save()

    return res.status(200).redirect('/login?success=password_reset')
}

async function resendOTP(req, res){
    const { email } = req.body;
    const user = await userModel.findOne({ email })
    if (!user) return res.status(404).json({ message: 'Email not found' })

    const otp = String(Math.floor(1000 + Math.random() * 9000))
    await otpModel.deleteMany({ email })
    await otpModel.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    })

    await emailService.sendOTPEmail(email, user.name, otp)
    res.status(200).json({ message: 'OTP resent' })
}

module. exports = {
    userRegisterController,
    userLoginController,
    userLogoutController,
    forgotPasswordController,
    verifyOTPController,
    resetPasswordController,
    resendOTP
}