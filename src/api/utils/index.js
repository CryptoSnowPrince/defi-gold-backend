const express = require('express');
const router = express.Router();
const getGasPrice = require("./getGasPrice");

// getGasPrice
router.get('/getGasPrice', getGasPrice);

module.exports = router;