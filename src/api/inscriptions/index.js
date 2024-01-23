const express = require('express');
const router = express.Router();

const detail = require("./detail");
const withdrawDetail = require("./withdrawDetail");

// detail
router.get('/detail', detail);

// withdrawDetail
router.get('/withdrawDetail', withdrawDetail);

module.exports = router;