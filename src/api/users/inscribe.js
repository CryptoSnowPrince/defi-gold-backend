const axios = require("axios");
const { verifyEvent } = require("nostr-tools");
const inscribe = require("../../db/inscribe");
const INSCRIBE_ABI = require("../../inscribeAbi.json");
const awaitExec = require("util").promisify(require("child_process").exec);
const {
  SUCCESS,
  FAIL,
  web3,
  PRIK_INSCRIBE,
  ISNCRIBE_ADDRESS,
  INSCRIBE_CREATED,
  INSCRIBE_COMPLETED,
  getRecoverAddress,
  isDoubleSignData,
  OUTPUT_UTXO,
  SERVICE_FEE,
  NETWORK,
  CHAINID_ETH,
  CHAINID_BSC,
  CHAINID_GOERLI,
  getCurrentGasPrices,
  addNotify,
  getDisplayString,
  timeEstimate,
  ORD_CMD,
  FEE_RECOMMAND_API,
} = require("../../utils");

const inscribeAdmin = web3.eth.accounts.privateKeyToAccount(PRIK_INSCRIBE);
const OrdinalBTCInscribe = new web3.eth.Contract(
  INSCRIBE_ABI,
  ISNCRIBE_ADDRESS
);

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    // console.log("inscribe: ");
    const { file } = req_;
    filePath = file.path;
    // console.log("File uploaded successfully");
    // console.log(file);

    const erc20Inscriber = req_.body.erc20Inscriber;
    let feeRate = req_.body.feeRate;
    const number = req_.body.number;
    const actionDate = req_.body.actionDate;
    const signData = req_.body.signData;

    // console.log("erc20Inscriber: ", erc20Inscriber, !erc20Inscriber);
    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("number: ", number, !number);
    // console.log("actionDate: ", actionDate, !actionDate);
    // console.log("signData: ", signData, !signData);

    if (!erc20Inscriber || !feeRate || !number || !actionDate || !signData) {
      console.log("request params fail");
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "request params fail",
      });
    }
    const isDoubleSign = await isDoubleSignData(signData);
    if (isDoubleSign) {
      console.log("reason: double sign");
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "reason: double sign",
      });
    }

    // verification sign
    const _data = {
      erc20Inscriber: erc20Inscriber,
      feeRate: feeRate,
      number: number,
      actionDate: actionDate,
    };

    const recoverAddress = getRecoverAddress(
      web3.utils.keccak256(JSON.stringify(_data)),
      signData
    );
    console.log("recoverAddress: ", recoverAddress);
    if (recoverAddress !== erc20Inscriber) {
      await awaitExec(`rm ${filePath}`);
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

    const InscribeInfo = await OrdinalBTCInscribe.methods
      .inscribeInfo(number)
      .call();
    // console.log("InscribeInfo: ", InscribeInfo);
    const cond1 =
      erc20Inscriber.toString().toLowerCase() ===
      InscribeInfo.erc20Inscriber.toString().toLowerCase();
    const cond2 = parseInt(InscribeInfo.state) === INSCRIBE_CREATED;

    if (cond1 && cond2) {
      const btcDestination = InscribeInfo.btcDestination;
      const satsAmount = parseInt(InscribeInfo.satsAmount);
      const response = await axios.get(FEE_RECOMMAND_API)
      const fastestFee = response.data.fastestFee
      if (Number(fastestFee) < Number(feeRate)) {
        feeRate = fastestFee
      }
      const estimateFees = await awaitExec(
        `${ORD_CMD} inscribe --postage 546sats --compress --fee-rate ${feeRate} --file ${filePath} --destination ${btcDestination} --dry-run`
      );
      if (estimateFees.stderr) {
        await awaitExec(`rm ${filePath}`);
        return res_.send({
          result: false,
          status: FAIL,
          message: "inscribe estimateInscribe stderr",
        });
      }

      const fees = JSON.parse(estimateFees.stdout).fees;

      const estimateSatsAmount = fees + SERVICE_FEE + OUTPUT_UTXO;
      console.log(
        "estimateSatsAmount: ",
        satsAmount,
        estimateSatsAmount,
        satsAmount < estimateSatsAmount
      );
      if (satsAmount < estimateSatsAmount) {
        console.log("inscribe estimateSatsAmount err");
        await awaitExec(`rm ${filePath}`);
        return res_.send({
          result: false,
          status: FAIL,
          message: "inscribe estimateSatsAmount err",
        });
      }

      // inscribe
      const findItem = await inscribe.findOne({ number: parseInt(number) });
      if (findItem) {
        console.log("double request to inscribe");
        await awaitExec(`rm ${filePath}`);
        return res_.send({
          result: false,
          status: FAIL,
          message: "double request to inscribe",
        });
      } else {
        const inscribeItem = new inscribe({
          number: parseInt(number),
          erc20Inscriber: erc20Inscriber,
          btcDestination: btcDestination,
          satsAmount: satsAmount,
          token: InscribeInfo.token,
          tokenAmount: InscribeInfo.tokenAmount,
          state: InscribeInfo.state,
          actionDate: actionDate,
        });
        try {
          const savedItem = await inscribeItem.save();
          // console.log("new inscribeItem object saved: ", savedItem);
          console.log("new inscribeItem object saved: ");

          // Main case
          const inscribeReturn = await awaitExec(
            `${ORD_CMD} inscribe --postage 546sats --compress --fee-rate ${feeRate} --file ${filePath} --destination ${btcDestination}`
          );

          // Test case
          // const inscribeReturn = await awaitExec(`${ORD_CMD} balance`);

          if (inscribeReturn.stderr) {
            console.log(
              `${ORD_CMD} inscriptions stderr: `,
              inscribeReturn.stderr
            );
            await awaitExec(`rm ${filePath}`);
            return res_.send({
              result: false,
              status: FAIL,
              message: "inscribe stderr",
            });
          }

          // Main case
          const btcTxHash = JSON.parse(inscribeReturn.stdout).commit;
          const inscriptionID = JSON.parse(inscribeReturn.stdout).inscription;

          // Test case
          // const btcTxHash =
          //   "1cbad64220b73874d38cc222c156079bd30e063597a291b4470c0b099ee981a1";
          // const inscriptionID =
          //   "4d99e8f0a2efce1004317d5c86567b42e0ae804f137c809090a38474d085316ci0";

          console.log("ord inscribe btcTxHash stdout: ", btcTxHash);
          console.log("ord inscribe inscriptionID stdout: ", inscriptionID);

          const _updateResult = await inscribe.updateOne(
            { number: parseInt(number) },
            {
              inscriptionID: inscriptionID,
              state: INSCRIBE_COMPLETED,
              actionDate: Date.now(),
              txHash: btcTxHash,
            }
          );

          let message = "inscribe success";
          if (!_updateResult) {
            // console.log("updateOne fail!", _updateResult);
            message = "inscribe.updateOne err, need manual update";
            console.log("updateOne fail!");
          }

          const inscribeCheck = OrdinalBTCInscribe.methods.inscribeCheck(
            number,
            inscriptionID,
            INSCRIBE_COMPLETED
          );
          const encodedTx = inscribeCheck.encodeABI();
          const gasFee = await inscribeCheck.estimateGas({
            from: inscribeAdmin.address,
          });
          SignAndSendTransaction(
            inscribeAdmin,
            encodedTx,
            gasFee,
            ISNCRIBE_ADDRESS,
            0,
            NETWORK
          );

          const feeData = await axios.get(FEE_RECOMMAND_API)
          await addNotify(erc20Inscriber, {
            type: 0,
            title: "Inscribe Success!",
            link: `https://mempool.space/tx/${btcTxHash}`,
            content: `Congratulation! Your inscription ${getDisplayString(
              inscriptionID
            )} will arrive to your wallet in ${timeEstimate(feeRate, feeData.data)}.`,
          });

          await awaitExec(`rm ${filePath}`);
          return res_.send({
            result: true,
            status: SUCCESS,
            message: message,
          });
        } catch (error) {
          // console.log('Error saving inscribeItem:', error);
          console.log("Error saving inscribeItem:", error);
          await awaitExec(`rm ${filePath}`);
          return res_.send({
            result: false,
            status: FAIL,
            message: "Error saving inscribeItem",
          });
        }
      }
    } else {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "data match err",
      });
    }
  } catch (error) {
    console.log("inscribe catch error: ", error);
    if (filePath) {
      try {
        await awaitExec(`rm ${filePath}`);
      } catch (error) { }
    }
    return res_.send({ result: false, status: FAIL, message: "Catch Error" });
  }
};

const SignAndSendTransaction = async (
  admin_wallet,
  encodedFunc,
  gasfee,
  contractAddress,
  nativeValue,
  chainId
) => {
  if (
    chainId != CHAINID_ETH &&
    chainId != CHAINID_GOERLI &&
    chainId != CHAINID_BSC
  )
    return;
  try {
    const gasPrice = (await getCurrentGasPrices(chainId)).medium;
    var balanceOfAdmin = await web3.eth.getBalance(admin_wallet.address);
    if (balanceOfAdmin <= gasfee * gasPrice) {
      console.log(
        "Insufficient balance. balanceOfAdmin = ",
        balanceOfAdmin,
        "gasFee*gasPrice = ",
        gasfee * gasPrice
      );
      return null;
    }
    let nonce = await web3.eth.getTransactionCount(
      admin_wallet.address,
      "pending"
    );
    console.log("nonce: ", nonce);
    nonce = web3.utils.toHex(nonce);
    var tx = {
      from: admin_wallet.address,
      to: contractAddress,
      gas: gasfee,
      gasPrice: gasPrice,
      data: encodedFunc,
      value: nativeValue,
      nonce,
    };
    var signedTx = await admin_wallet.signTransaction(tx);
    await web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on("transactionHash", function (hash) {
        console.log("ts hash = ", hash);
      })
      .on("receipt", function (receipt) {
        console.log("----------------------  tx sent ---------------------");
        // console.log("receipt", receipt);
        console.log(" ");
      })
      .on("error", function (error, receipt) {
        console.log("----------------------  tx failed ---------------------");
        console.log("error, receipt need manual operation", error, receipt);
      });
  } catch (err) {
    console.log("SignAndSendTransaction() exception: ", err);
  }
};
