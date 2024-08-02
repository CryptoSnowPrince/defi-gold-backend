const express = require('express');
const router = express.Router();
const getAddressInfo = require('./getAddressInfo.js');
const getAddressUtxo = require('./getAddressUtxo.js');
const getIsValidAddress = require('./getIsValidAddress.js');
const getRecommendFee = require('./getRecommendFee.js');
const getTxHex = require('./getTxHex.js');
const postTx = require('./postTx.js');
const generateAIImage = require('./generateAIImage.js');
const getDeposit = require('./getDeposit.js');

// getList
router.post('/getAddressInfo', getAddressInfo);
router.post('/getAddressUtxo', getAddressUtxo);
router.post('/getIsValidAddress', getIsValidAddress);
router.post('/getRecommendFee', getRecommendFee);
router.post('/getTxHex', getTxHex);
router.post('/postTx', postTx);
router.post('/generateAIImage', generateAIImage);
router.get('/getDeposit', getDeposit);

module.exports = router;
