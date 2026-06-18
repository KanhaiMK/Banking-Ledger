const router = require('express').Router()
const authMiddleware = require('../middleware/auth.middleware')

const profileController = require("../controllers/profile.controller")

const multer = require('multer')
const path = require('path')

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/images/uploads')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        cb(null, `profile-${req.user._id}-${Date.now()}${ext}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (allowed.includes(file.mimetype)) cb(null, true)
        else cb(new Error('Only JPEG, PNG and WEBP images are allowed'))
    }
})

// GET /profile
router.get('/', authMiddleware.authMiddleware, (req, res) => {
    res.render('profile', { user: req.user })
})

// POST /profile/update
router.post('/update', authMiddleware.authMiddleware, upload.single('profilePicture'),profileController.updateChanges)

router.delete('/delete', authMiddleware.authMiddleware, profileController.deleteProfileController)

module.exports = router