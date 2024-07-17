const List = require('../../models/list');
const { SUCCESS, FAIL, getInscriptionInfo } = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    // console.log("delistitem: ", req_.body);

    const inscriptionId = req_.body.inscriptionId;
    const price = req_.body.price;
    const sellIn = req_.body.sellIn;
    const sellOut = req_.body.sellOut;
    const psbt = req_.body.psbt;

    // console.log("inscriptionId: ", inscriptionId, !inscriptionId);
    // console.log("price: ", price, !price);
    // console.log("sellIn: ", sellIn, !sellIn);
    // console.log("sellOut: ", sellOut, !sellOut);
    // console.log("psbt: ", psbt, !psbt);

    if (!inscriptionId) {
      return res_.send({ result: false, status: FAIL, message: 'fail' });
    }

    // TODO verification

    const itemData = await getInscriptionInfo(inscriptionId);
    if (!itemData) {
      return res_.send({ result: false, status: FAIL, message: 'fail' });
    }
    const fetchItem = await List.findOne({ inscriptionId });

    // console.log("fetchItem: ", fetchItem);
    if (!fetchItem) {
      return res_.send({ result: true, status: SUCCESS, message: 'ok' });
    } else {
      const _ret = await List.deleteMany({ inscriptionId });

      if (!_ret) {
        return res_.send({ result: false, status: FAIL, message: 'fail' });
      }

      return res_.send({ result: true, status: SUCCESS, message: 'ok' });
    }
  } catch (error) {
    console.log('delistitem catch error: ', error);
    return res_.send({ result: false, status: FAIL, message: 'fail' });
  }
};
