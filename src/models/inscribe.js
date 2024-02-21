const mongoose = require('mongoose');
const { INSCRIBE_UNKONWN } = require('../utils');
mongoose.set('strictQuery', false);

const InscribeSchema = new mongoose.Schema({
    order: { type: Number, default: 0 },
    ordinal: { type: String, default: "" },
    deposit: { type: String, default: "" },
    satoshi: { type: Number, default: 0 },
    feeRate: { type: Number, default: 0 },
    filePath: { type: String, default: "" },
    depositTx: { type: String, default: "" },
    inscribeTx: { type: String, default: "" },
    state: { type: Number, default: INSCRIBE_UNKONWN },
}, { timestamps: true });

module.exports = Inscribe = mongoose.model('Inscribe', InscribeSchema);
