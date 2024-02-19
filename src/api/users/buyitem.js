const List = require('../../models/list');
const { SUCCESS, FAIL } = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("buyitem: ", req_.body);

        const buyerSignedPsbt = req_.body.buyerSignedPsbt
        const inscriptionId = req_.body.inscriptionId

        // console.log("inscriptionId: ", inscriptionId, !inscriptionId);
        // console.log("buyerSignedPsbt: ", buyerSignedPsbt, !buyerSignedPsbt);

        if (
            !buyerSignedPsbt ||
            !inscriptionId
        ) {
            return res_.send({ result: false, status: FAIL, message: "fail" });
        }

        // TODO verification

        const itemData = await getInscriptionInfo(inscriptionId)
        if (!itemData) {
            return res_.send({ result: false, status: FAIL, message: "fail" });
        }
        const fetchItem = await List.findOne({ inscriptionId });

        console.log("fetchItem: ", fetchItem);
        if (!fetchItem) {
            const listitem = new List({
                inscriptionId,
                number: itemData.inscriptionNumber,
                address: itemData.address,
                price,
                satoshi: itemData.utxo.satoshi,
                sellIn,
                sellOut,
                psbt,
            })
            // console.log("listitem: ", listitem);

            try {
                await listitem.save();
            } catch (error) {
                console.log('Error saving item:', error);
                return res_.send({ result: false, status: FAIL, message: "fail" });
            }
            return res_.send({ result: true, status: SUCCESS, message: "ok" });
        } else {
            // update old list
            const _updateResult = await List.updateOne({
                inscriptionId,
            }, {
                address: itemData.address,
                price,
                satoshi: itemData.utxo.satoshi,
                sellIn,
                sellOut,
                psbt,
            });

            if (!_updateResult) {
                return res_.send({ result: false, status: FAIL, message: "fail" });
            }

            return res_.send({ result: true, status: SUCCESS, message: "ok" });
        }
    } catch (error) {
        console.log('buyitem catch error: ', error)
        return res_.send({ result: false, status: FAIL, message: "fail" });
    }
}
