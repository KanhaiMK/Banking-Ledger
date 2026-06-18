const router = require('express').Router()
const authMiddleware = require('../middleware/auth.middleware')

router.get('/', authMiddleware.authSystemUserMiddleware, (req, res) => {
    res.render('system', {
        user: req.user
    })
})

module.exports = router