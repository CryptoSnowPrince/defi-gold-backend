const mongoose = require('mongoose');
const { ACTION_UNKNOWN } = require('../utils');
mongoose.set('strictQuery', false);

const ActionSchema = new mongoose.Schema({
    inscriptionId: { type: String, default: "" },
    inscriptionNumber: { type: String, default: "" },
    transactionType: { type: String, default: ACTION_UNKNOWN },
    price: { type: Number, default: 0 },
    sellerPayments: { type: String, default: '' },
    sellerOrdinals: { type: String, default: '' },
    buyerPayments: { type: String, default: '' },
    buyerOrdinals: { type: String, default: '' },
}, { timestamps: true });

module.exports = Action = mongoose.model('Action', ActionSchema);
