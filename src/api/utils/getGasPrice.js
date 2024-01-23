const utils = require('../../db/utils');
const { CHAINID_ETH, SUCCESS, FAIL } = require('../../utils');

module.exports = async (req_, res_) => {
    try {
        // console.log("gasPrice: ", req_.query);

        const chainID = parseInt(req_.query.chainID);

        // console.log("chainID: ", chainID);

        const fetchItems = await utils.findOne({ 'gas.chainID': chainID ? chainID : CHAINID_ETH });
        if (!fetchItems || !(fetchItems.gas.gasPrices)) {
            return res_.send({ result: false, status: FAIL, message: "gasPrice field is empty" });
        }
        return res_.send({ result: fetchItems.gas.gasPrices, status: SUCCESS, message: "get gasPrice success" });
    } catch (error) {
        console.log("get gasPrice error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get gasPrice fail" });
    }
}
