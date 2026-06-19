const userModel = require('../models/user.model')
const emailService = require("../services/email.service")

async function updateChanges(req, res){
    try {
        console.log('body:', req.body)
        console.log('file:', req.file)
        const { name, deleteImage } = req.body
        const updateData = {}

        if (name) updateData.name = name

        if (deleteImage === 'true') {
            updateData.profilePicture = null
        } else if (req.file) {
            updateData.profilePicture = req.file.path  // Cloudinary URL
        }

        await userModel.findByIdAndUpdate(req.user._id, updateData)

        res.status(200).json({ message: 'Profile updated successfully' })

    } catch (err) {
        res.status(500).json({ message: err.message || 'Something went wrong' })
    }
}

async function deleteProfileController(req, res) {
    const { password } = req.body;

    const user = await userModel.findById(req.user._id).select('+password')
    const isValid = await user.comparePassword(password)

    if (!isValid) {
        return res.status(401).json({ message: 'Incorrect password.' })
    }

    await emailService.sendAccountDeletionEmail(user.email, user.name)
    await userModel.findByIdAndDelete(req.user._id)

    res.cookie('token', '')
    res.clearCookie('token')

    return res.status(200).json({ message: 'Account deleted successfully.' })
}

module.exports = {
    updateChanges,
    deleteProfileController
}