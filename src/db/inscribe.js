const { INSCRIBE_UNKONWN } = require("../utils");
const mongoose = require("mongoose");

const inscribeSchema = new mongoose.Schema({
  number: { type: Number, default: -1 },
  erc20Inscriber: { type: String, default: "" }, // erc20 address
  btcDestination: { type: String, default: "" }, // btc address
  satsAmount: { type: Number, default: 0 },
  token: { type: String, default: "" }, // erc20 token address
  tokenAmount: { type: String, default: "" },
  inscriptionID: { type: String, default: "" },
  state: { type: Number, default: INSCRIBE_UNKONWN },
  actionDate: { type: Date, default: Date.now() },
  txHash: { type: String, default: "" }, // Bitcoin txHash
});

module.exports = inscribe = mongoose.model("inscribe", inscribeSchema);
