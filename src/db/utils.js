const mongoose = require("mongoose");

const utilsSchema = new mongoose.Schema(
    {
        gas: {
            chainID: { type: Number, default: -1 },
            gasPrices: {
                low: { type: String, default: "" },
                medium: { type: String, default: "" },
                high: { type: String, default: "" },
            }
        }
    }
)

module.exports = utils = mongoose.model("utils", utilsSchema)
