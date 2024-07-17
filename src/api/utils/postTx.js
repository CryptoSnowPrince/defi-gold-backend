const axios = require('axios');
const { SUCCESS, FAIL, MEMPOOL_URL } = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    // console.log("postTx: ", req_.body);

    const data = req_.body.data;

    // console.log("req_: ", req_)

    // console.log("data: ", data);

    if (!data) {
      return res_.send({ result: null, status: FAIL, message: 'fail' });
    }

    try {
      const options = {
        method: 'POST',
        url: `${MEMPOOL_URL}/api/tx`,
        headers: {
          Accept: '*/*',
          'Content-Type': 'text/plain',
        },
        data,
      };
      const response = await axios.request(options);
      return res_.send({
        result: response.data,
        status: SUCCESS,
        message: 'ok',
      });
    } catch (error) {
      console.log(error);
      return res_.send({ result: null, status: FAIL, message: 'fail' });
    }
  } catch (error) {
    console.log('postTx: ', error);
    return res_.send({ result: null, status: FAIL, message: 'fail' });
  }
};
