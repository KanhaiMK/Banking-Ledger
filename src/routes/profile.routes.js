const router = require('express').Router()
const authMiddleware = require('../middleware/auth.middleware')

const profileController = require("../controllers/profile.controller")

const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary.config')
const path = require('path')

// Cloudinary storage config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bank-app/profile-pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }
})

// GET /profile
router.get('/', authMiddleware.authMiddleware, (req, res) => {
    res.render('profile', { user: req.user })
})

// POST /profile/update
router.post('/update', authMiddleware.authMiddleware, upload.single('profilePicture'),profileController.updateChanges)

router.delete('/delete', authMiddleware.authMiddleware, profileController.deleteProfileController)

module.exports = router