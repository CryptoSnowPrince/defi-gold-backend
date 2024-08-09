const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now() + file.originalname}`);
  },
});

const upload = multer({ storage: storage });
const addCollection = require("./addCollection.js");
const getCollections = require("./getCollections.js");
const getCollection = require("./getCollection.js");
const checkSymbol = require("./checkSymbol.js");
const checkInscription = require("./checkInscription.js");

router.post('/addCollection', upload.single('file'), addCollection);
router.get('/getCollections', getCollections);
router.get('/getCollection', getCollection);
router.get('/checkSymbol', checkSymbol);
router.post('/checkInscription', checkInscription);

module.exports = router;