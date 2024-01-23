const { CATEGORY_UNKONWN, OFFER_UNLIST } = require('../utils')

module.exports = (mongoose) => {
    const dbModel = mongoose.model(
        "offer",
        mongoose.Schema(
            {
                inscriptionNumber: { type: Number, default: 0 },
                inscriptionID: { type: String, default: "" },
                name: { type: String, default: "" },
                category: { type: Number, default: CATEGORY_UNKONWN },
                orderNumber: { type: Number, default: -1 },
                btcSeller: { type: String, default: "" }, // btc address
                btcBuyer: { type: String, default: "" }, // btc address
                erc20Seller: { type: String, default: "" }, // erc20 address
                erc20Buyer: { type: String, default: "" }, // erc20 address
                tokenAddress: { type: String, default: "" }, // erc20 address
                tokenAmount: { type: Number, default: 0 },
                description: { type: String, default: "" },
                state: { type: Number, default: OFFER_UNLIST },
                actionDate: { type: Date, default: Date.now() },
                lockTime: { type: Number, default: 0 },
                txHash: { type: String, default: '' }, // Inscription Send Bitcoin txHash
                active: { type: Boolean, default: false }
            }
        )
    )
    return dbModel;
};
