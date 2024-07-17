const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const ListSchema = new mongoose.Schema(
  {
    inscriptionId: { type: String, default: '' },
    inscriptionNumber: { type: Number, default: -1 },
    address: { type: String, default: '' },
    price: { type: Number, default: 0 },
    satoshi: { type: Number, default: 0 },
    sellIn: { type: String, default: '' },
    sellOut: { type: String, default: '' },
    psbt: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = List = mongoose.model('List', ListSchema);
