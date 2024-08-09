const awaitExec = require('util').promisify(require('child_process').exec);
const { SUCCESS, FAIL, MEMPOOL_URL, ORD_CMD } = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    console.log('requestAIGeneration:');

    try {
      const { stdout: out, stderr: err } = await awaitExec(`${ORD_CMD} receive`);
      if (err) {
        return res_.send({
          result: false,
          status: FAIL,
          message: 'Cannot get deposit address',
        });
      }
      const deposit = JSON.parse(out).addresses[0];
      return res_.send({
        result: deposit,
        status: SUCCESS,
        message: 'ok',
      });
    } catch (error) {
      console.log(error);
      return res_.send({ result: null, status: FAIL, message: 'fail' });
    }
  } catch (error) {
    console.log('getAddressInfo: ', error);
    return res_.send({ result: null, status: FAIL, message: 'fail' });
  }
};
