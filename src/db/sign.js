const mongoose = require("mongoose");

const signSchema = new mongoose.Schema(
    {
        signData: { type: String, default: '' }
    }
)

module.exports = sign = mongoose.model("sign", signSchema)
