const Collection = require('../../models/collection');
const {
  SUCCESS,
  FAIL,
} = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    console.log('checkSymbol: ', req_.query);
    const { symbol } = req_.query;
    console.log(symbol);
    const collection = await Collection.findOne({symbol: symbol});
    console.log(collection);
    if (collection) return res_.send({ result: { exist: true }, status: SUCCESS, message: 'ok' });
    return res_.send({result: { exist: false }, status: SUCCESS, message: 'ok'});
  } catch (error) {
    console.log('addCollection catch error: ', error);
    return res_.send({ result: false, status: FAIL, message: 'fail' });
  }
};