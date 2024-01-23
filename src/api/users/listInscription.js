const { offer, user } = require('../../db');
const { SUCCESS, FAIL, getRecoverAddress, web3, isMine, OFFER_NOT_STARTED, OFFER_CREATED, getInscriptionData, MIN_LOCKTIME, OFFER_CANCELED } = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("listInscription: ", req_.body);

        const inscriptionID = req_.body.inscriptionID
        const name = req_.body.name;
        const category = req_.body.category;
        const btcSeller = req_.body.btcSeller;
        const tokenAddress = req_.body.tokenAddress;
        const tokenAmount = req_.body.tokenAmount;
        const description = req_.body.description;
        // const lockTime = req_.body.lockTime;
        const actionDate = req_.body.actionDate;
        const signData = req_.body.signData;

        // console.log("inscriptionID: ", inscriptionID, !inscriptionID);
        // console.log("name: ", name, !name);
        // console.log("category: ", category, !category);
        // console.log("btcSeller: ", btcSeller, !btcSeller);
        // console.log("tokenAddress: ", tokenAddress, !tokenAddress);
        // console.log("tokenAmount: ", tokenAmount, !tokenAmount);
        // console.log("description: ", description, !description);
        // // console.log("lockTime: ", lockTime, !lockTime);
        // console.log("actionDate: ", actionDate, !actionDate);
        // console.log("signData: ", signData, !signData);

        if (
            !inscriptionID ||
            !name ||
            !category ||
            !btcSeller ||
            !tokenAddress ||
            !tokenAmount ||
            !description ||
            // !lockTime ||
            // lockTime < MIN_LOCKTIME ||
            !actionDate ||
            !signData
        ) {
            return res_.send({ result: false, status: FAIL, message: "edit fail" });
        }

        // verification sign
        const _data = {
            inscriptionID: inscriptionID,
            name: name,
            category: category,
            btcSeller: btcSeller,
            tokenAddress: tokenAddress,
            tokenAmount: tokenAmount,
            description: description,
            // lockTime: lockTime,
            actionDate: actionDate
        }

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
            state: { $in: [OFFER_NOT_STARTED, OFFER_CREATED] },
            active: true
        });

        console.log("fetchItem: ", fetchItem);
        if (!fetchItem) {
            console.log("new offer(OFFER_NOT_STARTED) list: ");
            const offerItem = new offer({
                inscriptionNumber: inscriptionData.inscription_number,
                inscriptionID: inscriptionID,
                name: name,
                category: category,
                orderNumber: -1,
                btcSeller: btcSeller,
                erc20Seller: recoverAddress,
                tokenAddress: tokenAddress,
                tokenAmount: tokenAmount,
                description: description,
                state: OFFER_NOT_STARTED,
                actionDate: Date.now(),
                lockTime: MIN_LOCKTIME,
                active: true
            })
            // console.log("offerItem: ", offerItem);

            try {
                const savedItem = await offerItem.save();
                // console.log("save savedItem: ", savedItem);
            } catch (error) {
                console.log('Error saving item:', error);
                return res_.send({ result: false, status: FAIL, message: "Error saving item" });
            }
            return res_.send({ result: true, status: SUCCESS, message: "new offer listed success" });
        } else if (fetchItem.state === OFFER_CREATED) {
            return res_.send({ result: false, status: FAIL, message: "offer is active in OFFER_CREATED" });
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

                console.log("update new offer(OFFER_NOT_STARTED) list: ");
                const offerItem = new offer({
                    inscriptionNumber: inscriptionData.inscription_number,
                    inscriptionID: inscriptionID,
                    name: name,
                    category: category,
                    orderNumber: -1,
                    btcSeller: btcSeller,
                    erc20Seller: recoverAddress,
                    tokenAddress: tokenAddress,
                    tokenAmount: tokenAmount,
                    description: description,
                    state: OFFER_NOT_STARTED,
                    actionDate: Date.now(),
                    lockTime: MIN_LOCKTIME,
                    active: true
                })

                //console.log("userItem: ", userItem);

                try {
                    const savedItem = await offerItem.save();
                    // console.log("save savedItem: ", savedItem);
                } catch (error) {
                    console.log('Error saving item:', error);
                    return res_.send({ result: false, status: FAIL, message: "Error saving item" });
                }
                return res_.send({ result: true, status: SUCCESS, message: "update offer listed success" });
            }
            return res_.send({ result: false, status: FAIL, message: "In locktime yet" });
        }
    } catch (error) {
        console.log('listInscription catch error: ', error)
        return res_.send({ result: false, status: FAIL, message: "Catch Error" });
    }
}
