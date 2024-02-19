const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const SignSchema = new mongoose.Schema({
    signData: { type: String, default: '' },
}, { timestamps: true });

module.exports = Sign = mongoose.model('Sign', SignSchema);
