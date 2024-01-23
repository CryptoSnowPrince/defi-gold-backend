const { user, offer } = require('../../db');
const { SUCCESS, FAIL, OFFER_UNLIST, OFFER_ALLOWED } = require('../../utils')

module.exports = async (req_, res_) => {
    console.log("withdrawDetail: ", req_.query);
    const orderNumber = req_.query.orderNumber

    console.log("orderNumber", orderNumber)

    if (!orderNumber) {
        console.log("null: ", !orderNumber);
        return res_.send({ result: false, status: FAIL, message: "orderNumber fail" });
    }

    try {
        const curData = await offer.findOne({ orderNumber: orderNumber, active: true, state: OFFER_ALLOWED });
        // console.log("curData: ", curData)

        if (curData) {
            const userItem = await user.findOne({ btcAccount: curData.btcSeller })
            // console.log("getOwnerInfo: ", userItem)
            return res_.send({
                result: {
                    detail: {
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
                    },
                    status: curData ? curData.state : OFFER_UNLIST,
                    ownerInfo: userItem ? userItem : 'NO_OWNER'
                },
                status: SUCCESS,
                message: 'OK'
            });
        } else {
            return res_.send({ result: false, status: FAIL, message: 'FAIL' });
        }
    } catch (error) {
        console.log("getList aggregate error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get detail fail" });
    }
}
