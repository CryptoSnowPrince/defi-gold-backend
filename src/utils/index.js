const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const sign = require("../models/sign");

dotenv.config();

const EXPORT_OBJECT = {};

const UNISAT_API_KEY_0 = '6231ea23b9fbb7a17dd49df9d88ba6686cbbd639a73160cf358bf2e1fdc07b1a' // cryptosnowprince
const UNISAT_API_KEY_1 = '9118ac95edcd8840388dbc696405ce25166f3bd56a672fc58d3bb01a14e45e33' // topdirector2017
const UNISAT_API_KEY_4 = 'af86509f50d854685beb01b004e4a1eab801164d5a9109643b57428666340b05'; // cavelionhunter

const NETWORK = 'testnet'
const MEMPOOL_URL = `https://mempool.space${NETWORK === 'testnet' ? '/testnet' : ''}`
const UNISAT_API = `https://open-api${NETWORK === 'testnet' ? '-testnet' : ''}.unisat.io`
const ORD_CMD = `ord ${NETWORK === 'testnet' ? '-t' : ''} wallet --server-url ${NETWORK === 'testnet' ? 'http://127.0.0.1:8888' : 'http://127.0.0.1:9999'}`
const ORD_RECEIVE_CMD = `ord ${NETWORK === 'testnet' ? '-t' : ''} wallet receive --server-url ${NETWORK === 'testnet' ? 'http://127.0.0.1:8888' : 'http://127.0.0.1:9999'}`

EXPORT_OBJECT.UNISAT_API_KEY_0 = UNISAT_API_KEY_0
EXPORT_OBJECT.UNISAT_API_KEY_4 = UNISAT_API_KEY_4
EXPORT_OBJECT.MEMPOOL_URL = MEMPOOL_URL
EXPORT_OBJECT.UNISAT_API = UNISAT_API
EXPORT_OBJECT.ORD_CMD = ORD_CMD
EXPORT_OBJECT.ORD_RECEIVE_CMD = ORD_RECEIVE_CMD
EXPORT_OBJECT.OUTPUT_UTXO = 546

EXPORT_OBJECT.resetLog = () => {
  fs.writeFile("ordlog.log", content, (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

EXPORT_OBJECT.writeLog = (contentString) => {
  fs.appendFile("ordlog.log", contentString + "\n", (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

EXPORT_OBJECT.resetOfferCheckLog = () => {
  fs.writeFile("offerCheckLog.log", content, (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

EXPORT_OBJECT.writeOfferCheckLog = (contentString) => {
  fs.appendFile("offerCheckLog.log", contentString + "\n", (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

EXPORT_OBJECT.PATH = '/work/dgold/defi-gold-backend';

// Action Type
EXPORT_OBJECT.ACTION_UNKNOWN = 0;
EXPORT_OBJECT.ACTION_TRANSFER = 1;
EXPORT_OBJECT.ACTION_LIST = 2;
EXPORT_OBJECT.ACTION_EDIT = 3;
EXPORT_OBJECT.ACTION_DELIST = 3;
EXPORT_OBJECT.ACTION_BUY = 4;
EXPORT_OBJECT.ACTION_CREATED = 5;

// Offer State
EXPORT_OBJECT.OFFER_UNLIST = -1;
EXPORT_OBJECT.OFFER_NOT_STARTED = 0;
EXPORT_OBJECT.OFFER_CREATED = 1;
EXPORT_OBJECT.OFFER_ALLOWED = 2;
EXPORT_OBJECT.OFFER_CANCELED = 3;
EXPORT_OBJECT.OFFER_COMPLETED = 4;

// Inscribe State
EXPORT_OBJECT.INSCRIBE_UNKONWN = -1;
EXPORT_OBJECT.INSCRIBE_CREATED = 0;
EXPORT_OBJECT.INSCRIBE_COMPLETED = 1;
EXPORT_OBJECT.INSCRIBE_ERR = 2;

// Artifact Type
EXPORT_OBJECT.ARTIFACT_UNKONWN = -1;
EXPORT_OBJECT.ARTIFACT_APNG = 0;
EXPORT_OBJECT.ARTIFACT_ASC = 1;
EXPORT_OBJECT.ARTIFACT_FLAC = 2;
EXPORT_OBJECT.ARTIFACT_GIF = 3;
EXPORT_OBJECT.ARTIFACT_GLB = 4;
EXPORT_OBJECT.ARTIFACT_HTML = 5;
EXPORT_OBJECT.ARTIFACT_JPG = 6;
EXPORT_OBJECT.ARTIFACT_JSON = 7;
EXPORT_OBJECT.ARTIFACT_MP3 = 8;
EXPORT_OBJECT.ARTIFACT_MP4 = 9;
EXPORT_OBJECT.ARTIFACT_PDF = 10;
EXPORT_OBJECT.ARTIFACT_PNG = 11;
EXPORT_OBJECT.ARTIFACT_STL = 12;
EXPORT_OBJECT.ARTIFACT_SVG = 13;
EXPORT_OBJECT.ARTIFACT_TXT = 14;
EXPORT_OBJECT.ARTIFACT_WAV = 15;
EXPORT_OBJECT.ARTIFACT_WEBM = 16;
EXPORT_OBJECT.ARTIFACT_WEBP = 17;
EXPORT_OBJECT.ARTIFACT_YAML = 18;

EXPORT_OBJECT.SERVICE_FEE = 10000;
EXPORT_OBJECT.OUTPUT_UTXO = 546;

// Categories
EXPORT_OBJECT.CATEGORY_UNKONWN = 0;
EXPORT_OBJECT.CATEGORY_ART = 1;
EXPORT_OBJECT.CATEGORY_COLLECTIBLES = 2;
EXPORT_OBJECT.CATEGORY_DOMAINNAME = 3;
EXPORT_OBJECT.CATEGORY_MUSIC = 4;
EXPORT_OBJECT.CATEGORY_PHOTOGRAPHY = 5;

// Avatar
EXPORT_OBJECT.AVATAR_UNKONWN = 0;

// Background
EXPORT_OBJECT.BACKGROUND_UNKONWN = 0;

EXPORT_OBJECT.PRIK = process.env.PRIK || "";
EXPORT_OBJECT.PRIK_INSCRIBE = process.env.PRIK_INSCRIBE || "";

// EXPORT_OBJECT.filterArray = async (inscriptionsData, btcAccount, asyncCallback) => {
//     const filtered = await Promise.all(inscriptionsData.map(async (item) => {
//         if (await asyncCallback(item.inscription, btcAccount)) {
//             return item;
//         }
//     }));
//     return filtered.filter(item => item !== undefined);
// }

EXPORT_OBJECT.SUCCESS = "SUCCESS";
EXPORT_OBJECT.FAIL = "FAIL";

EXPORT_OBJECT.SORT_BY_DEFAULT = 0;
EXPORT_OBJECT.SORT_BY_DATE_ASCENDING = 1;
EXPORT_OBJECT.SORT_BY_DATE_DISASCENDING = 2;
EXPORT_OBJECT.SORT_BY_PRICE_ASCENDING = 3;
EXPORT_OBJECT.SORT_BY_PRICE_DISASCENDING = 4;

const addSignData = async (signData) => {
  const signItem = new sign({
    signData: signData,
  });

  try {
    const savedItem = await signItem.save();
    // console.log("new signItem object saved: ", savedItem);
    console.log("new signItem object saved: ");
  } catch (error) {
    // console.log('Error saving item:', error);
    console.log("Error saving item:");
  }
};

const isDoubleSignData = async (signData) => {
  const findSignData = await sign.findOne({ signData: signData });
  // console.log("findSignData: ", findSignData);
  if (findSignData) {
    // console.log("reason: double sign");
    return true;
  } else {
    await addSignData(signData);
    return false;
  }
};

EXPORT_OBJECT.isDoubleSignData = isDoubleSignData;

EXPORT_OBJECT.getDisplayString = (str, subLength1 = 8, subLength2 = 8) => {
  return `${str.toString().substr(0, subLength1)}...${str
    .toString()
    .substr(str.length - subLength2, str.length)}`;
};

EXPORT_OBJECT.timeEstimate = (feeRate, feeData) => {
  const feeRateValue = parseFloat(feeRate);
  try {
    if (feeRateValue < feeData?.minimumFee) {
      return ">1 hour";
    } else if (feeRateValue < feeData?.hourFee) {
      return "~1 hour";
    } else if (feeRateValue < feeData?.halfHourFee) {
      return "~half hour";
    } else if (feeRateValue >= feeData?.fastestFee) {
      return "~15 minutes";
    }
    return "Can't Estimate";
  } catch (error) {
    return "Can't Estimate";
  }
};

EXPORT_OBJECT.delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

EXPORT_OBJECT.getInscriptionInfo = async (inscriptionId) => {
  if (inscriptionId) {
    try {
      const options = {
        method: 'GET',
        url: `${UNISAT_API}/v1/indexer/inscription/info/${inscriptionId}`,
        headers: {
          Authorization: `Bearer ${UNISAT_API_KEY_0}`
        }
      };

      const response = await axios.request(options)
      if (response.data.code === 0) {
        return response.data.data
      }
      return false
    } catch (error) {
      console.log(error)
      return null
    }
  }
  return null
}

EXPORT_OBJECT.isValidBitcoinAddress = (address) => {
  const p2shRegex = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const p2wpkhRegex = /^bc1[q][a-z0-9]{39,59}$/;
  const p2trRegex = /^bc1[p][a-z0-9]{59}$/;

  if (p2shRegex.test(address)) {
    return 'P2SH';
  } else if (p2wpkhRegex.test(address)) {
    return 'P2WPKH';
  } else if (p2trRegex.test(address)) {
    return 'P2TR';
  } else {
    return 'Invalid';
  }
}

// unused
EXPORT_OBJECT.getAddressInfoByUnisat = async (address) => {
  if (address) {
    try {
      const options = {
        method: 'GET',
        url: `${UNISAT_API}/v1/indexer/address/${address}/balance`,
        headers: {
          Authorization: `Bearer ${UNISAT_API_KEY_1}`
        }
      };

      const response = await axios.request(options)
      if (response.data.msg === "ok") {
        return response.data.data
      }
      return false
    } catch (error) {
      console.log(error)
      return null
    }
  }
  return null
}

module.exports = EXPORT_OBJECT;
