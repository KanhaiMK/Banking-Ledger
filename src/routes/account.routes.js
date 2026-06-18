const express = require("express")
const router = express.Router()

const authMiddleware=require("../middleware/auth.middleware")
const accountController=require("../controllers/account.controller")

router.get('/', authMiddleware.authMiddleware, (req, res) => {
    res.render('accounts', { user: req.user })
})

// Create a new account
router.post("/create", authMiddleware.authMiddleware,accountController.createAccountController)

// Get all account

router.get("/get",authMiddleware.authMiddleware,accountController.getUserAccountsController)

router.get('/:accountId', authMiddleware.authMiddleware, accountController.getAccountDetailsController)

// GET /api/accounts/balance/:accountId
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)

router.delete('/:accountId/delete', authMiddleware.authMiddleware, accountController.deleteAccountController)

module.exports = router