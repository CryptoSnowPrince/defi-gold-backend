const { exec } = require('child_process');
// const util = require('util');
const { verifyEvent } = require("nostr-tools");
const { user, offer } = require('../../db');
const {
    SUCCESS,
    FAIL,
    isAccount,
    getRecoverAddress,
    web3,
    isMine,
    OFFER_NOT_STARTED,
    OFFER_CREATED,
    addNotify,
    getDisplayString,
    ORD_CMD,
    FEE_RECOMMAND_API,
} = require('../../utils')

// const awaitExec = util.promisify(exec);

module.exports = async (req_, res_) => {
    try {
        console.log("withdraw: ", req_.body);
        const erc20Account = req_.body.erc20Account
        const inscriptionID = req_.body.inscriptionID
        const receiver = req_.body.receiver
        const actionDate = req_.body.actionDate
        const signData = req_.body.signData;

        //console.log("erc20Account: ", erc20Account)
        //console.log("inscriptionID: ", inscriptionID)
        //console.log("sender: ", sender)
        //console.log("receiver: ", receiver)
        //console.log("signData: ", signData)

        if (!erc20Account || !isAccount(erc20Account) || !inscriptionID || !receiver || !signData || !actionDate) {
            // console.log("null: ", (!erc20Account || !isAccount(erc20Account) || !inscriptionID || !receiver || !signData || !actionDate));
            return res_.send({ result: false, status: FAIL, message: "withdraw fail" });
        }

        // verification sign
        const _data = {
            erc20Account: erc20Account,
            inscriptionID: inscriptionID,
            receiver: receiver,
            actionDate: actionDate,
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

        // check inscription state
        const fetchInscriptionState = await offer.find({ inscriptionID: inscriptionID, state: { $in: [OFFER_NOT_STARTED, OFFER_CREATED] }, active: true });
        console.log('fetchInscriptionState: ', fetchInscriptionState)

        if (fetchInscriptionState && fetchInscriptionState.length > 0) {
            return res_.send({ result: false, status: FAIL, message: "It is active in OFFER_NOT_STARTED or OFFER_CREATED" });
        }

        const fetchItem = await user.findOne({ erc20Account: erc20Account });
        console.log("fetchItem: ", fetchItem);
        if (fetchItem && fetchItem.btcAccount) {
            // check inscription owner
            const isOwner = await isMine(inscriptionID, fetchItem.btcAccount);
            if (!isOwner) {
                return res_.send({ result: false, status: FAIL, message: "NOT OWNER OF INSCRIPTION" });
            }

            const response = await axios.get(FEE_RECOMMAND_API)
            const feeRate = response.data.fastestFee
            exec(`${ORD_CMD} send --fee-rate ${feeRate} ${receiver} ${inscriptionID}`, async (error, stdout, stderr) => {
                if (error) {
                    console.log(`exec error: ${error}`);
                    return res_.send({ result: error, status: FAIL, message: `${ORD_CMD} send err` });
                }
                if (stderr) {
                    console.log(`exec stderr: ${stderr}`);
                    return res_.send({ result: stderr, status: FAIL, message: `${ORD_CMD} send stderr` });
                }

                await addNotify(erc20Account, {
                    type: 0,
                    title: 'Withdraw Inscription Success!',
                    link: `https://mempool.space/tx/${stdout}`,
                    content: `Withdraw your inscription ${getDisplayString(inscriptionID, 8, 8)} to ${getDisplayString(receiver, 8, 8)}! ${getDisplayString(receiver, 8, 8)} will receive your inscription in 30 mins`
                })

                return res_.send({ result: stdout, status: SUCCESS, message: "txHash" });
            });
        } else {
            return res_.send({ result: false, status: FAIL, message: "NOT USER" });
        }
    } catch (error) {
        console.log('withdrawInscription catch error: ', error)
        return res_.send({ result: false, status: FAIL, message: "Catch Error" });
    }
}
