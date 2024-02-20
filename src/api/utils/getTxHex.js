const axios = require("axios");
const {
    SUCCESS,
    FAIL,
    MEMPOOL_URL,
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        console.log("getTxHex: ", req_.body);

        const txid = req_.body.txid;

        // console.log("req_: ", req_)

        // console.log("txid: ", txid);

        if (!txid) {
            return res_.send({ result: null, status: FAIL, message: "fail" });
        }

        try {
            const options = {
                method: 'GET',
                url: `${MEMPOOL_URL}/api/tx/${txid}/hex`,
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
        console.log('getTxHex: ', error)
        return res_.send({ result: null, status: FAIL, message: "fail" });
    }
}
