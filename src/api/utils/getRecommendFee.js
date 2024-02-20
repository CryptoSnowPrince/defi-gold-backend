const axios = require("axios");
const {
    SUCCESS,
    FAIL,
    MEMPOOL_URL,
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        console.log("getRecommendFee: ", req_.body);

        try {
            const options = {
                method: 'GET',
                url: `${MEMPOOL_URL}/api/v1/fees/recommended`,
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
        console.log('getRecommendFee: ', error)
        return res_.send({ result: null, status: FAIL, message: "fail" });
    }
}
