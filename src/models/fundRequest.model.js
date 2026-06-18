const mongoose = require('mongoose')

const fundRequestSchema = new mongoose.Schema({
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be greater than 0']
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    }
}, { timestamps: true })

const fundRequestModel = mongoose.model('fundRequest', fundRequestSchema)
module.exports = fundRequestModel