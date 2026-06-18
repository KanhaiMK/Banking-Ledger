const fundRequestModel = require('../models/fundRequest.model')
const emailService = require('../services/email.service')
const userModel = require('../models/user.model')
const accountModel = require('../models/account.model')

// Called by normal user — creates the request
async function createFundRequest(req, res) {
    const { amount } = req.body;
    const { accountId } = req.params;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount is required' })
    }

    const request = await fundRequestModel.create({
        toAccount: accountId,
        requestedBy: req.user._id,
        amount
    })

    return res.status(201).json({
        message: 'Fund request submitted successfully',
        request
    })
}

// Called by system user — fetches all pending requests
async function getPendingFundRequests(req, res) {
    const requests = await fundRequestModel.find({ status: 'PENDING' })
        .populate('toAccount')
        .populate('requestedBy', 'name email')

    return res.status(200).json({ requests })
}

async function approveFundRequest(req, res) {
    const request = await fundRequestModel.findByIdAndUpdate(
        req.params.requestId,
        { status: 'APPROVED' },
        { new: true }
    ).populate('requestedBy').populate('toAccount')

    await emailService.sendFundRequestApprovedEmail(request.requestedBy.email,request.requestedBy.name,request.amount,request.toAccount.accountNo)

    res.status(200).json({ message: 'Request approved' })
}

async function rejectFundRequest(req, res) {
    const request = await fundRequestModel.findByIdAndUpdate(
        req.params.requestId,
        { status: 'REJECTED' },
        { new: true }
    ).populate('requestedBy').populate('toAccount')

    await emailService.sendFundRequestRejectedEmail(request.requestedBy.email,request.requestedBy.name,request.amount,request.toAccount.accountNo)

    res.status(200).json({ message: 'Request rejected' })
}

async function getFundRequestHistory(req, res) {
    const { accountId } = req.params;
    const requests = await fundRequestModel.find({
        toAccount: accountId
    }).sort({ createdAt: -1 })

    res.status(200).json({ requests })
}

module.exports = { 
    createFundRequest,
    getPendingFundRequests,
    approveFundRequest,
    rejectFundRequest,
    getFundRequestHistory
}