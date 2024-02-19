const express = require('express');
const router = express.Router();
const getlist = require("./getlist.js");

// getList
router.post('/getlist', getlist);

module.exports = router;