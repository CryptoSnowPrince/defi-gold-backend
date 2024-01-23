const { user } = require('../../db');
const { SUCCESS, FAIL, isAccount } = require('../../utils')

module.exports = async (req_, res_) => {
    console.log("getUserInfo: ", req_.body);
    const erc20Account = req_.body.erc20Account

    //console.log("erc20Account", erc20Account)

    if (!erc20Account || !isAccount(erc20Account)) {
        console.log("null: ", (!erc20Account || !isAccount(erc20Account)));
        return res_.send({ result: false, status: FAIL, message: "erc20Account fail" });
    }

    const fetchItem = await user.findOne({ erc20Account: erc20Account });
    //console.log("fetchItem: ", fetchItem);
    if (fetchItem && isAccount(fetchItem.erc20Account)) {
        // update last loginTime
        const _updateResult = await user.updateOne({ erc20Account: erc20Account }, {
            lastLoginDate: Date.now()
        });

        if (!_updateResult) {
            console.log("updateOne fail!", _updateResult);
        }
        return res_.send({ result: fetchItem, status: SUCCESS, message: "erc20Account info" });
    } else {
        return res_.send({ result: false, status: FAIL, message: "NO_REGISTER" });
    }
}
