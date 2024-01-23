const express = require('express');
const router = express.Router();
const getList = require("./getList");
const getMostTrendList = require("./getMostTrendList");

// getList
router.post('/getList', getList);

// getMostTrendList
router.get('/getMostTrendList', getMostTrendList);

module.exports = router;