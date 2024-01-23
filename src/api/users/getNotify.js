const notify = require('../../db/notify');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getNotify: ", req_.query);

        const erc20Account = req_.query.erc20Account;

        // console.log("erc20Account: ", erc20Account);

        if (!erc20Account) {
            return res_.send({ result: false, status: FAIL, message: "getNotify erc20Account error" });
        }

        const fetchItems = await notify.find({ erc20Account: erc20Account, active: true }).sort({ notifyDate: 'desc' }).limit(10);
        if (!fetchItems) {
            return res_.send({ result: false, status: FAIL, message: "getNotify field is empty" });
        }
        return res_.send({ result: fetchItems, status: SUCCESS, message: "get getNotify success" });
    } catch (error) {
        console.log("get getNotify error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get getNotify fail" });
    }
}
