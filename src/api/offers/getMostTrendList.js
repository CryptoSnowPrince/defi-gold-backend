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
            const fetchItems = await offer.find({ inscriptionID: { $in: ["76cca14987619198ff82e3b543d63f9a19a48c80477c97a94b24e7561a559757i0"] } }); // TODO most trending conditions
            // console.log("getMostTrendList fetchItems: ", fetchItems)
            if (!fetchItems || fetchItems.length <= 0 || true) {
                const inscriptionsVal = await inscription.findOne({ btcAccount: "tb1pc4mv8wkg5mx3ddruy5exzej6suwjull0q92zy0e008r0sqv0l83sfs6jzm" })
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
