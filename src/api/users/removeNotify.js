const notify = require('../../db/notify');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("removeNotify: ", req_.body);

        const erc20Account = req_.body.erc20Account;
        const removeAll = req_.body.removeAll;
        const type = req_.body.type;
        const title = req_.body.title;
        const link = req_.body.link;
        const content = req_.body.content;
        const notifyDate = req_.body.notifyDate;

        // console.log("erc20Account: ", erc20Account)
        // console.log("removeAll: ", removeAll)
        // console.log("type: ", type)
        // console.log("title: ", title)
        // console.log("link: ", link)
        // console.log("content: ", content)
        // console.log("notifyDate: ", notifyDate)

        if (!erc20Account) {
            return res_.send({ result: false, status: FAIL, message: "removeNofity fail" });
        }

        if (removeAll) {
            const _updateResult = await notify.updateMany({
                erc20Account: erc20Account,
                active: true
            }, { active: false });

            if (!_updateResult) {
                return res_.send({ status: FAIL, message: "remove all fail!" });
            }
            return res_.send({ status: SUCCESS, message: "remove all success" });
        } else {
            const _updateResult = await notify.updateOne({
                erc20Account: erc20Account,
                type: type,
                title: title,
                link: link,
                content: content,
                notifyDate: notifyDate,
                active: true
            }, { active: false });

            if (!_updateResult) {
                return res_.send({ status: FAIL, message: "remove one fail!" });
            }
            return res_.send({ status: SUCCESS, message: "remove one success" });
        }
    } catch (error) {
        console.log('remove notify catch error: ', error)
        return res_.send({ status: FAIL, message: "Catch Error" });
    }
}
