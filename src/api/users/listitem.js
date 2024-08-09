const List = require('../../models/list');
const { SUCCESS, FAIL, getInscriptionInfo } = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    // console.log("listitem: ", req_.body);

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

    if (!inscriptionId || !price || !sellIn || !sellOut || !psbt) {
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
      const listitem = new List({
        inscriptionId,
        inscriptionNumber: itemData.inscriptionNumber,
        address: itemData.address,
        price,
        satoshi: itemData.utxo.satoshi,
        sellIn,
        sellOut,
        psbt,
      });
      // console.log("listitem: ", listitem);

      try {
        await listitem.save();
      } catch (error) {
        console.log('Error saving item:', error);
        return res_.send({ result: false, status: FAIL, message: 'fail' });
      }
      return res_.send({ result: true, status: SUCCESS, message: 'ok' });
    } else {
      // update old list
      const _ret = await List.updateOne(
        {
          inscriptionId: inscriptionId,
        },
        {
          address: itemData.address,
          price,
          satoshi: itemData.utxo.satoshi,
          sellIn,
          sellOut,
          psbt,
        }
      );

      if (!_ret) {
        return res_.send({ result: false, status: FAIL, message: 'fail' });
      }

      return res_.send({ result: true, status: SUCCESS, message: 'ok' });
    }
  } catch (error) {
    console.log('listitem catch error: ', error);
    return res_.send({ result: false, status: FAIL, message: 'fail' });
  }
};
