const accountModel = require("../models/account.model");
const userModel = require("../models/user.model")

async function createAccountController(req,res) {
    const user = req.user;
    const account = await accountModel.create({
        user: user._id
    })
    res.status(201).redirect('/accounts')
}

async function getUserAccountsController(req,res) {
    const accounts = await accountModel.find({
        user: req.user._id
    })

    res.status(200).json({
        accounts
    })
}

async function getAccountDetailsController(req, res) {
    const account = await accountModel.findById(req.params.accountId)
    res.render('account-detail', { account })
}

async function getAccountBalanceController(req,res) {
    const {accountId} = req.params;
    const account = await accountModel.findOne({
        _id:accountId,
        user: req.user._id
    })

    if(!account) {
        return res.status(400).json({
            message: "Account not found"
        })
    }
    const balance = await account.getBalance();
    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}

async function deleteAccountController(req, res) {
    const { password } = req.body;
    const { accountId } = req.params;

    const user = await userModel.findById(req.user._id).select('+password')
    const isValid = await user.comparePassword(password)

    if (!isValid) {
        return res.status(401).json({ message: 'Incorrect password.' })
    }

    await accountModel.findByIdAndDelete(accountId)
    res.status(200).json({ message: 'Account deleted.' })
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    getAccountDetailsController,
    deleteAccountController
}