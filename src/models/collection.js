const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const CollectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    symbol: { type: String, unique: true, required: true },
    description: { type: String, required: true, minlength: 10, maxlength: 1000 },
    icon: { type: String },
    image: { type: String, required: true },
    derivated: { type: Boolean, required: true, default: false },
    artLink: { type: String },
    originalName: { type: String },
    primaryCategory: { type: String, enum: ['pfps', 'games', 'art', 'virtual_worlds', 'music', 'photography', 'sports'], required: true },
    secondCategory: { type: String, enum: ['pfps', 'games', 'art', 'virtual_worlds', 'music', 'photography', 'sports'], required: true },
    twitter: { type: String, required: true },
    discord: { type: String },
    website: { type: String },
    tipAddress: { type: String },
    ownerAddress: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    depositAddress: { type: String, required: true },
    inscriptionList: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = Collection = mongoose.model('Collection', CollectionSchema);
