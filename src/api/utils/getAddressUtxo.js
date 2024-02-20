const axios = require("axios");
const {
    SUCCESS,
    FAIL,
    MEMPOOL_URL,
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        console.log("getAddressUtxo: ", req_.body);

        const address = req_.body.address;

        // console.log("req_: ", req_)

        // console.log("address: ", address);

        if (!address) {
            return res_.send({ result: null, status: FAIL, message: "fail" });
        }

        try {
            const options = {
                method: 'GET',
                url: `${MEMPOOL_URL}/api/address/${address}/utxo`,
                headers: {
                    Accept: '*/*',
                }
            };
            const response = await axios.request(options)
            return res_.send({ result: response.data, status: SUCCESS, message: "ok" });
        } catch (error) {
            console.log(error)
            return res_.send({ result: null, status: FAIL, message: "fail" });
        }
    } catch (error) {
        console.log('getAddressUtxo: ', error)
        return res_.send({ result: null, status: FAIL, message: "fail" });
    }
}
