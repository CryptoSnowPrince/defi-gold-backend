const awaitExec = require("util").promisify(require("child_process").exec);
const axios = require("axios");
const { SUCCESS, FAIL, ORD_CMD } = require("../../utils");

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    // console.log("estimateInscribe: ");
    const { file } = req_;
    filePath = file.path;
    // console.log("File uploaded successfully");
    // console.log(file);

    let feeRate = req_.body.feeRate;
    const btcAccount = req_.body.btcAccount;

    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("btcAccount: ", btcAccount, !btcAccount);

    if (!feeRate || !btcAccount) {
      console.log("request params fail");
      if (filePath) {
        await awaitExec(`rm ${filePath}`);
      }
      return res_.send({
        result: false,
        status: FAIL,
        message: "request params fail",
      });
    }

    const fastestFee = await axios.get(FEE_RECOMMAND_API).data.fastestFee
    if (Number(fastestFee) < Number(feeRate)) {
      feeRate = fastestFee
    }

    const { stdout, stderr } = await awaitExec(
      `${ORD_CMD} inscribe --postage 546sats --compress --fee-rate ${feeRate} --file ${filePath} --destination ${btcAccount} --dry-run`
    );
    if (stderr) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "estimateInscribe stderr",
      });
    }
    // console.log(`${ORD_CMD} inscriptions stdout: `, stdout);
    await awaitExec(`rm ${filePath}`);
    return res_.send({
      result: JSON.parse(stdout).fees,
      status: SUCCESS,
      message: "estimateInscribe success",
    });
  } catch (error) {
    console.log("estimateInscribe catch error: ", error);
    if (filePath) {
      try {
        await awaitExec(`rm ${filePath}`);
      } catch (error) { }
    }
    return res_.send({
      result: false,
      status: FAIL,
      message: "estimateInscribe Catch Error",
    });
  }
};
