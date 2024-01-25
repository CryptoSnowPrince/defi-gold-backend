const { user } = require('../../db');
const { verifyEvent } = require("nostr-tools");
const util = require('util');
const awaitExec = util.promisify(require('child_process').exec);

const { SUCCESS, FAIL, isAccount, web3, getRecoverAddress, ORD_CMD } = require('../../utils')

module.exports = async (req_, res_) => {
    console.log("setUserInfo: ", req_.body);
    const erc20Account = req_.body.erc20Account
    const avatar = req_.body.avatar
    const background = req_.body.background
    const first_name = req_.body.first_name
    const last_name = req_.body.last_name
    const bio = req_.body.bio
    const email = req_.body.email
    const facebook = req_.body.facebook
    const instagram = req_.body.instagram
    const twitter = req_.body.twitter
    const website = req_.body.website
    const phone = req_.body.phone
    const actionDate = req_.body.actionDate
    const signData = req_.body.signData;

    // console.log("erc20Account", erc20Account)
    // console.log("avatar", avatar)
    // console.log("background", background)
    // console.log("first_name: ", first_name)
    // console.log("last_name: ", last_name)
    // console.log("bio: ", bio)
    // console.log("email: ", email)
    // console.log("facebook: ", facebook)
    // console.log("instagram: ", instagram)
    // console.log("twitter: ", twitter)
    // console.log("website: ", website)
    // console.log("phone: ", phone)
    // console.log("actionDate", actionDate)
    // console.log("signData", signData)

    if (!erc20Account || !isAccount(erc20Account) || !avatar || !background || !actionDate || !signData) {
        console.log("null: ", (!erc20Account || !isAccount(erc20Account) || !avatar || !background || !actionDate || !signData));
        return res_.send({ result: false, status: FAIL, message: "erc20Account fail" });
    }

    // verification sign
    const _data = {
        erc20Account: erc20Account,
        avatar: avatar,
        background: background,
        first_name: first_name,
        last_name: last_name,
        bio: bio,
        email: email,
        facebook: facebook,
        instagram: instagram,
        twitter: twitter,
        website: website,
        phone: phone,
        actionDate: actionDate
    }

    const recoverAddress = getRecoverAddress(web3.utils.keccak256(JSON.stringify(_data)), signData);
    console.log("recoverAddress: ", recoverAddress)
    if (recoverAddress !== erc20Account) {
        return res_.send({ result: false, status: FAIL, message: "sign fail" });
    }

    // nip42 verification
    const nip42FinalizeEvent = req_.body.nip42FinalizeEvent;
    if (!nip42FinalizeEvent) {
        return res_.send({
            result: false,
            status: FAIL,
            message: "reason: nip42 nip42FinalizeEvent missing",
        });
    }
    const isVerified = verifyEvent(nip42FinalizeEvent)
    if (!isVerified) {
        return res_.send({ result: false, status: FAIL, message: "nip42 verify fail" });
    }

    const fetchItem = await user.findOne({ erc20Account: erc20Account });
    //console.log("fetchItem: ", fetchItem);
    if (fetchItem) {
        if (actionDate > fetchItem.lastUpdateDate) {
            // update profile
            console.log("update user profile: ");
            const _updateResult = await user.updateOne({ erc20Account: erc20Account }, {
                avatar: avatar,
                background: background,
                first_name: first_name,
                last_name: last_name,
                bio: bio,
                email: email,
                facebook: facebook,
                instagram: instagram,
                twitter: twitter,
                website: website,
                phone: phone,
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now()
            });

            if (!_updateResult) {
                console.log("updateOne fail!", _updateResult);
                return res_.send({ result: true, status: FAIL, message: "Update Fail" });
            }

            return res_.send({ result: true, status: SUCCESS, message: "Update Success" });
        }

        return res_.send({ result: true, status: FAIL, message: "Valid Timestamp" });
    } else {
        // register profile
        try {
            const { stdout, stderr } = await awaitExec(`${ORD_CMD} receive`)
            if (stderr) {
                console.log(`exec stderr: ${stderr}`);
                return res_.send({ result: stderr, status: FAIL, message: "erc20Account create stderr" });
            }
            console.log(`stdout: ${stdout}`);
            const btcAccount = JSON.parse(stdout).address;
            console.log("add new user: ");
            const userItem = new user({
                erc20Account: erc20Account,
                btcAccount: btcAccount,
                avatar: avatar,
                background: background,
                first_name: first_name,
                last_name: last_name,
                bio: bio,
                email: email,
                facebook: facebook,
                instagram: instagram,
                twitter: twitter,
                website: website,
                phone: phone,
                firstLoginDate: Date.now(),
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now(),
            })
            console.log("userItem: ", userItem);
            try {
                const savedItem = await userItem.save();
                console.log("save savedItem: ", savedItem);
            } catch (error) {
                console.log('Error saving item:', error);
                return res_.send({ result: false, status: FAIL, message: "Error saving item" });
            }
            return res_.send({ result: true, status: SUCCESS, message: "Create Success" });
        } catch (error) {
            console.log(`exec error: ${error}`);
            return res_.send({ result: error, status: FAIL, message: "erc20Account create err" });
        }
    }
}
