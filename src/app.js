const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const api = require('./api');
const app = express();
const path = require('path');

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

app.use('/download', express.static(path.join(__dirname, '../uploads')));
app.use('/api', api);
module.exports = app;
