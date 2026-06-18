const mongoose = require("mongoose");
const ledgerModel = require("../models/ledger.model")

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account msut be associated with a user"],
        index: true // to enhance searching
    },
    accountNo: {
        type: String,
        unique: true,
        length: 11
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN or CLOSED",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    }
}, {
    timestamps: true
})

accountSchema.index({user: 1, status: 1})

accountSchema.pre('save', async function() {
    if (!this.accountNo) {
        let unique = false;
        while (!unique) {
            const num = String(Math.floor(10000000000 + Math.random() * 90000000000));
            const exists = await this.constructor.findOne({ accountNo: num });
            if (!exists) {
                this.accountNo = num;
                unique = true;
            }
        }
    }
})

accountSchema.methods.getBalance = async function() {
    const balanceData = await ledgerModel.aggregate([
        { $match: { account: this._id}},
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"]}
            }
        }
    ])
    if(balanceData.length === 0) {
        return 0;
    }
    return balanceData[0].balance
}

const accountModel = mongoose.model("account", accountSchema)

module.exports = accountModel