const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const config = require('./config');

const db = {};
db.mongoose = mongoose;
db.url = config.url;

module.exports = db;
