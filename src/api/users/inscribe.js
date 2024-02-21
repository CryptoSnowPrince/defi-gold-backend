const axios = require("axios");
const awaitExec = require("util").promisify(require("child_process").exec);
const {
  SUCCESS,
  FAIL,
  ORD_CMD,
  INSCRIBE_UNKONWN,
  getAddressInfoByUnisat,
  OUTPUT_UTXO,
  INSCRIBE_ERR,
  INSCRIBE_COMPLETED,
  INSCRIBE_CREATED,
  MEMPOOL_URL,
  delay,
} = require("../../utils");
const Inscribe = require("../../models/inscribe");

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    // console.log("inscribe: ");
    const { file } = req_;
    filePath = file.path;
    // console.log("File uploaded successfully");
    // console.log(file);

    const ordinal = String(req_.body.ordinal);
    const deposit = String(req_.body.deposit);
    const feeRate = Number(req_.body.feeRate);
    const depositTx = String(req_.body.depositTx);
    const order = Number(req_.body.order);
    const satoshi = Number(req_.body.satoshi);

    // console.log("ordinal: ", ordinal, !ordinal);
    console.log("deposit: ", deposit, !deposit);
    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("depositTx: ", depositTx, !depositTx);
    // console.log("order: ", order, !order);
    // console.log("satoshi: ", satoshi, !satoshi);

    if (!ordinal || !deposit || !feeRate || !order || !satoshi) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "request params fail",
      });
    }

    const inscribeItem = await Inscribe.findOne({ order })
    if (
      !inscribeItem ||
      inscribeItem.ordinal !== ordinal ||
      inscribeItem.deposit !== deposit ||
      inscribeItem.satoshi !== satoshi ||
      inscribeItem.feeRate !== feeRate ||
      inscribeItem.state !== INSCRIBE_UNKONWN
    ) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "request params match fail",
      });
    }

    // balance check
    await delay(1000)
    const options = {
      method: 'GET',
      url: `${MEMPOOL_URL}/api/address/${deposit}`,
      headers: {
        Accept: '*/*',
      }
    };
    const response = await axios.request(options)
    const chargeSats =
      response.data.chain_stats.funded_txo_sum +
      response.data.mempool_stats.funded_txo_sum -
      response.data.chain_stats.spent_txo_count -
      response.data.mempool_stats.spent_txo_count;

    console.log('chargeSats: ', chargeSats)
    if (chargeSats < satoshi) {
      const newPath = `/work/taproot/taproot-marketplace-backend/uploads/${order}`
      await awaitExec(`mv ${filePath} ${newPath}`);
      Inscribe.updateOne({ order }, {
        filePath: newPath,
        depositTx,
        state: INSCRIBE_CREATED
      })
      return res_.send({
        result: false,
        status: FAIL,
        message: "Order has created but Insufficient payment!",
      });
    }

    // inscribe
    const { stdout, stderr } = await awaitExec(
      `${ORD_CMD} inscribe --postage ${OUTPUT_UTXO}sats --compress --fee-rate ${feeRate} --file ${filePath} --destination ${ordinal}`
    );

    if (stderr) {
      await awaitExec(`rm ${filePath}`);
      Inscribe.updateOne({ order }, { filePath, depositTx, state: INSCRIBE_ERR })
      return res_.send({
        result: false,
        status: FAIL,
        message: "inscribe stderr",
      });
    }
    console.log(`${ORD_CMD} inscribe stdout: `, stdout);
    const data = JSON.parse(stdout)

    await awaitExec(`rm ${filePath}`);
    Inscribe.updateOne({ order }, {
      filePath,
      depositTx,
      inscribeTx: data.reveal,
      state: INSCRIBE_COMPLETED
    })
    return res_.send({
      result: data,
      status: SUCCESS,
      message: "ok",
    });
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
