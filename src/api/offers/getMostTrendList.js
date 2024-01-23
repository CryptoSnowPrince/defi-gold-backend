const { offer } = require('../../db');
const inscription = require('../../db/inscriptioin');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getMostTrendList: ");

        try {
            const fetchItems = await offer.find({ inscriptionID: { $in: ["e164b024836bab73c0a9e6d2250c8746e276a7a02cdcf25487b2089be480dbdfi0"] } }); // TODO most trending conditions
            // console.log("getMostTrendList fetchItems: ", fetchItems)
            if (!fetchItems || fetchItems.length <= 0 || true) {
                const inscriptionsVal = await inscription.findOne({ btcAccount: "bc1phxht4kwgzja4nke5zhrg3aal7xwkkh44qxwax97vtyl36d7zwn5qrdr864" })
                // console.log("inscriptionsVal: ", inscriptionsVal)
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
