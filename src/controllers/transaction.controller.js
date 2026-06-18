const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

async function createTransaction(req,res) {
    const {fromAccount,toAccount,amount,idempotencyKey} = req.body;

    // 1. Validate request
    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({ accountNo: fromAccount })
    const toUserAccount = await accountModel.findOne({ accountNo: toAccount }).populate("user");

    if(!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    // 2. Validate idempotencyKey
    const isTransactionExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })
    if(isTransactionExists) {
        if(isTransactionExists.status==="COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionExists
            })
        }
        if(isTransactionExists.status==="PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing"
            })
        }
        if(isTransactionExists.status==="FAILED") {
            return res.status(500).json({
                message: "Transaction failed previously, please retry",
            })
        }
        if(isTransactionExists.status==="REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry",
            })
        }
    }

    // 3. Check account status
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts must be active to perform a transaction"
        })
    }

    // 4. Derive sender balance from ledger
    const balance = await fromUserAccount.getBalance();
    if(balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}, Requested amount is ${amount}`
        })
    }

    try {
        // 5. Create transaction (PENDING)
        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = (await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], {session}))[0]

        // 6. Create DEBIT Ledger Entry
        const debitLedgerEntry = await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], {session})

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

        // 7. Create CREDIT Ledger Entry
        const creditLedgerEntry = await ledgerModel.create([{
            account: toUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], {session})

        // 8. Mark Transaction COMPLETED
        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

        // 9. Commit MongoDB session
        await session.commitTransaction()
        session.endSession()

        // 10. Send Email notification
        await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount._id)
        await emailService.sendTransactionEmailtoAccount(toUserAccount.user.email, toUserAccount.user.name, amount, fromUserAccount._id)

        return res.status(201).json({
            message: "Transaction completed successfully",
            transaction: transaction
        })
    }

    catch (error) {
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })
    }
}

async function createInitialFundsTransaction(req,res) {
    const {toAccount,amount,idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id:toAccount
    })
    if(!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })
    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    const session = await mongoose.startSession();
    session.startTransaction()

    const transaction = (await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }],{session}))[0]
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], {session})

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], {session})

    transaction.status="COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Intital funds transaction completed successfully",
        transaction: transaction
    })
}

async function getAccountTransactions(req, res) {
    const { accountId } = req.params;
    const account = await accountModel.findOne({ _id: accountId, user: req.user._id })
    if (!account) {
        return res.status(404).json({ message: 'Account not found' })
    }
    const transactions = await transactionModel.find({
        $or: [{ fromAccount: account._id }, { toAccount: account._id }]
    }).sort({ createdAt: -1 })

    res.status(200).json({ transactions })
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getAccountTransactions
}