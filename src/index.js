const app = require("./app");
const checkOffer = require("./checkOffer");
const checkGasPrice = require("./checkGasPrice");

var server = require('http').createServer(app);

const port = process.env.PORT || 7777;
server.listen(port, () => console.log(`Listening on port ${port}..`));

checkOffer();
checkGasPrice()