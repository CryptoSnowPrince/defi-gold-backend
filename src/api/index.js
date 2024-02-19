const express = require('express');
const users = require("./users");
const lists = require("./lists");

const router = express.Router();

router.use("/users", users);
router.use("/lists", lists);

module.exports = router;
