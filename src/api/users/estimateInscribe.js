const awaitExec = require('util').promisify(require('child_process').exec);
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {
  SUCCESS,
  FAIL,
  ORD_CMD,
  MEMPOOL_URL,
  OUTPUT_UTXO,
  SERVICE_FEE,
} = require('../../utils');
const Inscribe = require('../../models/inscribe');

let pending = 0;

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })
      .then((response) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        writer.on('finish', () => {
          resolve();
        });

        writer.on('error', (err) => {
          fs.unlinkSync(filepath); // Delete the file
          reject(err);
        });

        response.data.on('error', (err) => {
          writer.close();
          fs.unlinkSync(filepath); // Delete the file
          reject(err);
        });
        console.log('Image downloaded successfully.');
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    console.log('estimateInscribe: ');
    console.log(req_.body);
    if (req_.body.type === 'AI') {
      const filepath = path.join(__dirname, '../../../uploads', 'image0.png');
      try {
        await downloadImage(req_.body.path, filepath);
        console.log('Image1 downloaded successfully.');
        filePath = filepath;
      } catch (error) {
        console.error(`Failed to download image: ${error}`);
      }
      // filePath = req_.body.path;
    } else {
      const { file } = req_;
      console.log(file);
      filePath = file.path;
    }
    console.log('file path', filePath);
    // console.log("File uploaded successfully");
    // console.log(file);

    let feeRate = Number(req_.body.feeRate);
    const ordinal = String(req_.body.ordinal);

    console.log('filePath: ', filePath, !filePath);
    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("ordinal: ", ordinal, !ordinal);

    if (!feeRate || !ordinal) {
      console.log('request params fail');
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: 'request params fail',
      });
    }

    // const options = {
    //   method: 'GET',
    //   url: `${MEMPOOL_URL}/api/v1/fees/recommended`,
    //   headers: {
    //     Accept: '*/*',
    //   }
    // };
    // const response = await axios.request(options)
    // const fastestFee = response.data.fastestFee
    // if (fastestFee < feeRate) {
    //   feeRate = fastestFee
    // }

    // const date = Date.now()
    // const newPath = `/work/dgold/defi-gold-backend/uploads/_test_${date}`
    // await awaitExec(`mv ${filePath} ${newPath}`);

    const { stdout, stderr } = await awaitExec(
      `${ORD_CMD} inscribe --postage ${OUTPUT_UTXO}sats --compress --fee-rate ${feeRate} --file ${filePath} --destination ${ordinal} --dry-run`
    );
    if (stderr) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: 'estimateInscribe stderr',
      });
    }
    // console.log(`${ORD_CMD} inscriptions stdout: `, stdout);
    const satoshi = JSON.parse(stdout).total_fees;

    const { stdout: out, stderr: err } = await awaitExec(`${ORD_CMD} receive`);
    if (err) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: 'estimateInscribe stderr',
      });
    }
    const deposit = JSON.parse(out).addresses[0];
    console.log(`deposit: `, deposit);

    if (pending !== 0) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: 'estimateInscribe stderr',
      });
    }
    pending = 1;
    const lastOrder = await Inscribe.find().sort({ order: -1 });
    const order =
      lastOrder && lastOrder.length > 0 ? lastOrder[0].order + 1 : 1;
    const inscribe = new Inscribe({
      order,
      ordinal,
      deposit,
      satoshi,
      feeRate,
    });

    try {
      await inscribe.save();
    } catch (error) {
      console.log('error', error);
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: 'estimateInscribe stderr',
      });
    }
    pending = 0;

    await awaitExec(`rm ${filePath}`);
    return res_.send({
      result: {
        satoshi,
        deposit,
        order,
      },
      status: SUCCESS,
      message: 'estimateInscribe success',
    });
  } catch (error) {
    console.log('estimateInscribe catch error: ', error);
    try {
      await awaitExec(`rm ${filePath}`);
    } catch (error) {
      console.log('error again', error);
    }
    return res_.send({
      result: false,
      status: FAIL,
      message: 'estimateInscribe Catch Error',
    });
  }
};
