const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PATH } = require('../../utils');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${PATH}/uploads`);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const listitem = require('./listitem');
const delistitem = require('./delistitem');
const buyitem = require('./buyitem');

const inscribe = require('./inscribe');
const estimateInscribe = require('./estimateInscribe');

// listitem
router.post('/listitem', listitem);
// delistitem
router.post('/delistitem', delistitem);
// buyitem
router.post('/buyitem', buyitem);
// inscribe
router.post('/inscribe', upload.single('file'), inscribe);
// estimateInscribe
router.post('/estimateInscribe', upload.single('file'), estimateInscribe);

module.exports = router;
