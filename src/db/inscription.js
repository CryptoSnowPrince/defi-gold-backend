const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema(
    {
        btcAccount: { type: String, default: '' },
        inscription: [
            {
                content: { type: String, default: "" },
                content_length: { type: String, default: "" },
                content_type: { type: String, default: "" },
                genesis_fee:  { type: String, default: "" },
                genesis_height:  { type: String, default: "" },
                genesis_transaction:  { type: String, default: "" },
                inscription_id:  { type: String, default: "" },
                inscription_number: { type: Number, default: -1 },
                location:  { type: String, default: "" },
                offset:  { type: String, default: "" },
                output:  { type: String, default: "" },
                output_value:  { type: String, default: "" },
                preview:  { type: String, default: "" },
                sat:  { type: String, default: "" },
                timestamp:  { type: String, default: "" },
                title:  { type: String, default: "" },
            }
        ]
    }
)

module.exports = inscription = mongoose.model("inscription", inscriptionSchema)
