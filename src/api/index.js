const express = require('express');
const users = require("./users");
const offers = require("./offers");
const inscriptions = require("./inscriptions");
const utils = require("./utils");

const router = express.Router();

router.use("/users", users);
router.use("/offers", offers);
router.use("/inscriptions", inscriptions);
router.use("/utils", utils);

module.exports = router;
