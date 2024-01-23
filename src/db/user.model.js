const { AVATAR_UNKONWN, BACKGROUND_UNKONWN } = require('../utils')

module.exports = (mongoose) => {
    const dbModel = mongoose.model(
        "user",
        mongoose.Schema(
            {
                erc20Account: { type: String, default: "" }, // erc20 Account
                btcAccount: { type: String, default: "" }, // btc Account,
                avatar: { type: Number, default: AVATAR_UNKONWN },
                background: { type: Number, default: BACKGROUND_UNKONWN },
                first_name: { type: String, default: "" },
                last_name: { type: String, default: "" },
                bio: { type: String, default: "" },
                email: { type: String, default: "" },
                facebook: { type: String, default: "" },
                instagram: { type: String, default: "" },
                twitter: { type: String, default: "" },
                website: { type: String, default: "" },
                phone: { type: String, default: "" },
                firstLoginDate: { type: Date, default: Date.now() },
                lastUpdateDate: { type: Date, default: Date.now() },
                lastLoginDate: { type: Date, default: Date.now() },
                active: { type: Boolean, default: true }
            }
        )
    )
    return dbModel;
};
