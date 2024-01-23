const { user, offer } = require('../../db');
const { SUCCESS, FAIL, getInscriptionData, OFFER_UNLIST, OFFER_ALLOWED } = require('../../utils')

module.exports = async (req_, res_) => {
    console.log("detail: ", req_.query);
    const inscriptionID = req_.query.inscriptionID

    console.log("inscriptionID", inscriptionID)

    if (!inscriptionID) {
        console.log("null: ", !inscriptionID);
        return res_.send({ result: false, status: FAIL, message: "inscriptionID fail" });
    }

    try {
        const data = await getInscriptionData(inscriptionID);
        if (data.result) {
            const historyData = await offer.aggregate([
                {
                    $match: { inscriptionID: inscriptionID, active: false }
                },
                {
                    $sort: { actionDate: 1 }
                }
            ]);
            // console.log("historyData: ", historyData)
            // console.log("data.inscriptionData: ", data.inscriptionData)

            let curData = await offer.findOne({ inscriptionID: inscriptionID, active: true, state: { $ne: OFFER_ALLOWED } });
            if (!curData) {
                curData = await offer.findOne({ inscriptionID: inscriptionID, active: true });
            }
            // console.log("curData: ", curData)

            const userItem = await user.findOne({ btcAccount: data.inscriptionData.address })
            // console.log("getOwnerInfo: ", userItem)

            if (curData) {
                return res_.send({
                    result: {
                        detail: {
                            ...data.inscriptionData,
                            inscriptionNumber: curData.inscriptionNumber,
                            inscriptionID: curData.inscriptionID,
                            name: curData.name,
                            category: curData.category,
                            orderNumber: curData.orderNumber,
                            btcSeller: curData.btcSeller,
                            btcBuyer: curData.btcBuyer,
                            erc20Seller: curData.erc20Seller,
                            erc20Buyer: curData.erc20Buyer,
                            tokenAddress: curData.tokenAddress,
                            tokenAmount: curData.tokenAmount,
                            description: curData.description,
                            state: curData.state,
                            actionDate: curData.actionDate,
                            lockTime: curData.lockTime,
                            txHash: curData.txHash,
                            active: curData.active
                        }, status: curData ? curData.state : OFFER_UNLIST, ownerInfo: userItem ? userItem : 'NO_OWNER',
                        history: historyData
                    },
                    status: SUCCESS,
                    message: data.result
                });
            } else {
                return res_.send({
                    result: {
                        detail: data.inscriptionData, status: curData ? curData.state : OFFER_UNLIST, ownerInfo: userItem ? userItem : 'NO_OWNER',
                        history: historyData
                    },
                    status: SUCCESS,
                    message: data.result
                });
            }
        } else {
            return res_.send({ result: null, status: FAIL, message: data.result });
        }
    } catch (error) {
        console.log("getList aggregate error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get detail fail" });
    }
}
