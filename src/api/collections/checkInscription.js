const Collection = require('../../models/collection');
const {
  SUCCESS,
  FAIL,
} = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    console.log('checkInscription: ', req_.body);
    const { inscriptionList } = req_.body;
    console.log(inscriptionList);
    let inscriptions = JSON.parse(inscriptionList);
    const collection = await Collection.findOne({
      inscriptionList: { $in: inscriptions }
    });

    if (collection) {
      return res_.send({ result: true, status: SUCCESS, message: 'ok' });
    } else {
      return res_.send({result: false, status: SUCCESS, message: 'ok'});
    }
  } catch (error) {
    console.log('addCollection catch error: ', error);
    return res_.send({ result: false, status: FAIL, message: 'fail' });
  }
};