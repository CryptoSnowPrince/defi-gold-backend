const { offer, user } = require('../../db');
const { SUCCESS, FAIL, getRecoverAddress, web3, isMine, OFFER_NOT_STARTED, getInscriptionData, OFFER_UNLIST } = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("unListInscription: ", req_.body);

        const inscriptionID = req_.body.inscriptionID
        const btcSeller = req_.body.btcSeller;
        const actionDate = req_.body.actionDate;
        const signData = req_.body.signData;

        // console.log("req_.body: ", req_.body);

        // console.log("inscriptionID: ", inscriptionID, !inscriptionID);
        // console.log("btcSeller: ", btcSeller, !btcSeller);
        // console.log("actionDate: ", actionDate, !actionDate);
        // console.log("signData: ", signData, !signData);

        if (
            !inscriptionID ||
            !btcSeller ||
            !actionDate ||
            !signData
        ) {
            return res_.send({ result: false, status: FAIL, message: "edit fail" });
        }

        // verification sign
        const _data = {
            inscriptionID: inscriptionID,
            btcSeller: btcSeller,
            actionDate: actionDate
        }

        // console.log("unListInscription", _data)

        const recoverAddress = getRecoverAddress(web3.utils.keccak256(JSON.stringify(_data)), signData);
        console.log("recoverAddress: ", recoverAddress)

        const getUserInfo = await user.findOne({ erc20Account: recoverAddress, btcAccount: btcSeller })

        if (!getUserInfo) {
            return res_.send({ result: false, status: FAIL, message: "sign fail" });
        }

        const inscriptionDataVal = await getInscriptionData(inscriptionID)
        if (!inscriptionDataVal.result) {
            return res_.send({ result: false, status: FAIL, message: "getInscriptionData err" });
        }

        const inscriptionData = inscriptionDataVal.inscriptionData;

        const isOwner = await isMine(inscriptionID, btcSeller);
        if (!isOwner) {
            return res_.send({ result: false, status: FAIL, message: "not owner" });
        }

        const fetchItem = await offer.findOne({
            inscriptionID: inscriptionID,
            state: OFFER_NOT_STARTED,
            active: true
        });

        // console.log("fetchItem: ", fetchItem);
        if (!fetchItem) {
            console.log("no need unlist");
            return res_.send({ result: false, status: FAIL, message: "no need unlist" });
        } else {
            // check locktime
            if ((fetchItem.state === OFFER_NOT_STARTED || fetchItem.state === OFFER_CANCELED) && actionDate > (new Date(fetchItem.actionDate).getTime() + fetchItem.lockTime)) {
                // update old offer to inactive
                const _updateResult = await offer.updateOne({
                    inscriptionID: inscriptionID,
                    state: OFFER_NOT_STARTED,
                    active: true
                }, { active: false });

                if (!_updateResult) {
                    return res_.send({ result: false, status: FAIL, message: "Something wrong with update offer to inactive!" });
                }

                console.log("new offer(OFFER_UNLIST) unlist: ");
                const offerItem = new offer({
                    inscriptionNumber: inscriptionData.inscription_number,
                    inscriptionID: inscriptionID,
                    name: fetchItem.name,
                    category: fetchItem.category,
                    orderNumber: -1,
                    btcSeller: btcSeller,
                    erc20Seller: recoverAddress,
                    tokenAddress: fetchItem.tokenAddress,
                    tokenAmount: fetchItem.tokenAmount,
                    description: fetchItem.description,
                    state: OFFER_UNLIST,
                    actionDate: Date.now(),
                    active: false
                })

                // console.log("offerItem: ", offerItem);

                try {
                    const savedItem = await offerItem.save();
                    // console.log("save savedItem: ", savedItem);
                } catch (error) {
                    console.log('Error saving item:', error);
                    return res_.send({ result: false, status: FAIL, message: "Error saving item" });
                }
                return res_.send({ result: true, status: SUCCESS, message: "update offer unlisted success" });
            }
            return res_.send({ result: false, status: FAIL, message: "In locktime yet" });
        }
    } catch (error) {
        console.log('unListInscription catch error: ', error)
        return res_.send({ result: false, status: FAIL, message: "Catch Error" });
    }
}
