const { offer } = require('../../db');
const inscription = require('../../db/inscription');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getMostTrendList: ");

        try {
            const fetchItems = await offer.find({ inscriptionID: { $in: ["972710738cc59f3d25e07a10faef3c89b6e489d11c576d4e51d80c106f6bc1abi0"] } }); // TODO most trending conditions
            console.log("getMostTrendList fetchItems: ", fetchItems)
            if (!fetchItems || fetchItems.length <= 0 || true) {
                const inscriptionsVal = await inscription.findOne({ btcAccount: "bc1pymwq9x3vulsscpm9306dqn4qcj63qzhasuae6uxxep0s4yw32kzq6jj5jm" })
                console.log("inscriptionsVal: ", inscriptionsVal)
                if (!inscriptionsVal) {
                    return res_.send({ result: false, status: FAIL, message: "getMostTrendList err" });
                }
                return res_.send({ result: inscriptionsVal.inscription, status: SUCCESS, message: "getMostTrendList static success" });
            }
            return res_.send({ result: fetchItems, status: SUCCESS, message: "getMostTrendList dynamic success" });
        } catch (error) {
            console.log("getMostTrendList fetchItems error: ", error)
            return res_.send({ result: false, status: FAIL, message: "getMostTrendList fail" });
        }
    } catch (error) {
        console.log('getMostTrendList catch error: ', error)
        return res_.send({ result: false, status: FAIL, message: "Catch Error" });
    }
}
