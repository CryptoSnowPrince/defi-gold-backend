const express = require('express');
const users = require("./users");
const lists = require("./lists");
const utils = require("./utils");

const router = express.Router();

router.use("/users", users);
router.use("/lists", lists);
router.use("/utils", utils);

module.exports = router;
