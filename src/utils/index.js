const axios = require("axios");
const Web3 = require("web3");
const dotenv = require("dotenv");
const ethereumUtil = require("ethereumjs-util");
const fs = require("fs");
const notify = require("../db/notify");
const sign = require("../db/sign");

dotenv.config();

const CHAINID_ETH = 1;
const CHAINID_BSC = 56;
const CHAINID_GOERLI = 5;

const EXPORT_OBJECT = {};

// TODO
EXPORT_OBJECT.ORD_CMD = 'ord wallet --name milo' // Bitcoin Mainnet
EXPORT_OBJECT.FEE_RECOMMAND_API = "https://mempool.space/api/v1/fees/recommended"
const UTXO_API = "https://mempool.space/api/address/"
// EXPORT_OBJECT.ORD_CMD = 'ord -t wallet --name milo' // Bitcoin Testnet
// EXPORT_OBJECT.FEE_RECOMMAND_API = "https://mempool.space/testnet/api/v1/fees/recommended"
// const UTXO_API = "https://mempool.space/testnet/api/address/"

/********************************************************************************************/
// Goerli Testnet
EXPORT_OBJECT.ETH = "0x0000000000000000000000000000000000000Eee";
EXPORT_OBJECT.USDT = "0x5c4773F833E6C135aAC582b3EF62176809da226c";
EXPORT_OBJECT.USDC = "0x26a24Ed2a666D181e37E1Dd0dF97257b3F4B214E";
EXPORT_OBJECT.oBTC = "0x30163F5CbfDe7007a3CEE0a117eF8eAb4Db36726";
EXPORT_OBJECT.OFI = "0x419E35E3515c2fDB652C898bF7A0B21FB20497dC";
EXPORT_OBJECT.oDOGE = "0x796a4503b444A71b331c9556bEF0815237ddEaBC";
EXPORT_OBJECT.WBTC = "0x6f034EfD11f0b5b5322A5C8aB9e72547438a13c3";
EXPORT_OBJECT.WETH = "0x47693bCC8B81f108D8d809ed73aC6D4897908805";

EXPORT_OBJECT.ADDRESS = "0x4eef20eB413Ab25aAfD6bBc57ec742A393D710c3";
EXPORT_OBJECT.ISNCRIBE_ADDRESS = "0xCe11e6E40bea0A0F361a81d50d52555AB710b503";
EXPORT_OBJECT.NETWORK = CHAINID_GOERLI;
const RPC = "https://goerli.blockpi.network/v1/rpc/public";

// MAINNET
// EXPORT_OBJECT.ETH = "0x0000000000000000000000000000000000000Eee";
// EXPORT_OBJECT.USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
// EXPORT_OBJECT.USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// EXPORT_OBJECT.oBTC = "0xfF770E4c68e35DB85c6e0E89a43750eC02bDB2AC";
// EXPORT_OBJECT.OFI = "0x419E35E3515c2fDB652C898bF7A0B21FB20497dC";
// EXPORT_OBJECT.oDOGE = "0x796a4503b444A71b331c9556bEF0815237ddEaBC";
// EXPORT_OBJECT.WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
// EXPORT_OBJECT.WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// EXPORT_OBJECT.ADDRESS = "0xBC6f4694ED22E7F8Fb9976000DabC9CB570d146b";
// EXPORT_OBJECT.ISNCRIBE_ADDRESS = "0x46DbfbB5bD1d357609B8123845Ae85904Db780Aa";
// EXPORT_OBJECT.NETWORK = CHAINID_ETH;
// const RPC = "https://https.eth.metabest.tech";
/********************************************************************************************/

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

EXPORT_OBJECT.getTokenPriceInUSDByMoralise = async (token) => {
  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2/erc20/${token}/price?chain=eth&exchange=uniswap-v2`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key":
            "uyKibkyh4ljytsSBlA0VYcpsPH6ji8CXjqSZDm70J4gsiJuvaTnt1WkwAp9fH5L3",
        },
      }
    );
    EXPORT_OBJECT.writeLog(response?.data.usdPrice);
  } catch (e) {
    EXPORT_OBJECT.writeLog(e);
  }
};

EXPORT_OBJECT.CHAINID_ETH = CHAINID_ETH;
EXPORT_OBJECT.CHAINID_BSC = CHAINID_BSC;
EXPORT_OBJECT.CHAINID_GOERLI = CHAINID_GOERLI;

EXPORT_OBJECT.RPC = RPC;

EXPORT_OBJECT.PATH = '/taproot_nft/taproot-marketplace-backend';

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
EXPORT_OBJECT.INSCRIBE_CANCELED = 2;
EXPORT_OBJECT.INSCRIBE_WITHDRAW = 3;

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

EXPORT_OBJECT.SERVICE_FEE = 40000;
EXPORT_OBJECT.OUTPUT_UTXO = 10000;

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

const GAS_STATION = {
  [CHAINID_ETH]:
    "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=3TEWVV2EK19S1Y6SV8EECZAGQ7W3362RCN",
  [CHAINID_BSC]:
    "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice&apikey=HDCD9C44C7YRZGHE48WGHGUZW5DU1R2WKT",
  [CHAINID_GOERLI]:
    "https://api-goerli.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=3TEWVV2EK19S1Y6SV8EECZAGQ7W3362RCN",
};

EXPORT_OBJECT.GAS_STATION = GAS_STATION;

EXPORT_OBJECT.PRIK = process.env.PRIK || "";
EXPORT_OBJECT.PRIK_INSCRIBE = process.env.PRIK_INSCRIBE || "";

const web3 = new Web3(RPC);

EXPORT_OBJECT.web3 = web3;
EXPORT_OBJECT.isAccount = web3.utils.isAddress;

EXPORT_OBJECT.signString = async (
  web3Obj,
  erc20Account,
  plainString = "Ordinal BTC Escrow"
) => {
  var msgHash = web3Obj.utils.keccak256(plainString);
  var signedString = "";
  try {
    await web3Obj.eth.personal.sign(
      web3Obj.utils.toHex(msgHash),
      erc20Account,
      function (err, result) {
        if (err) {
          EXPORT_OBJECT.writeLog(err);
          return {
            success: false,
            message: err,
          };
        }
        signedString = result;
        //console.log('SIGNED:' + result)
      }
    );
    return {
      success: true,
      message: signedString,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

EXPORT_OBJECT.getRecoverAddress = (plainData, signData) => {
  const messageHash = ethereumUtil.hashPersonalMessage(
    ethereumUtil.toBuffer(web3.utils.toHex(plainData))
  );
  const signatureBuffer = ethereumUtil.toBuffer(signData);
  const signatureParams = ethereumUtil.fromRpcSig(signatureBuffer);
  const publicKey = ethereumUtil.ecrecover(
    messageHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  );
  const recoveredAddress = ethereumUtil.pubToAddress(publicKey).toString("hex");
  return `0x${recoveredAddress}`;
};

EXPORT_OBJECT.isMine = async (inscriptionID, btcAccount) => {
  try {
    const response = await axios.get(
      `https://ordapi.ordinalnovus.com/api/inscription/${inscriptionID}`
    );
    // console.log(response.data);
    if (response.data && response.data.address === btcAccount) {
      return true;
    }
    return false;
  } catch (error) {
    EXPORT_OBJECT.writeLog(error);
    return false;
  }
};

const getInscriptionData = async (inscriptionID) => {
  try {
    const response = await axios.get(
      `https://ordapi.ordinalnovus.com/api/inscription/${inscriptionID}`
    );
    // console.log(response.data);
    return { result: true, inscriptionData: response.data };
  } catch (error) {
    // console.log(error);
    EXPORT_OBJECT.writeLog("getInscriptionData error");
    return { result: false, inscriptionData: null };
  }
};

EXPORT_OBJECT.getInscriptionData = getInscriptionData

EXPORT_OBJECT.getInscriptions = async (btcAccount) => {
  try {
    const response = await axios.get(
      `${UTXO_API}/${btcAccount}/utxo`
    );
    let inscriptions = []
    for (let idx = 0; idx < response.data.length; idx++) {
      let output = response.data[idx]
      try {
        const isInscription = await axios.get(`https://ordinals.com/inscription/${output.txid}i${output.vout}`)
        if (isInscription?.data) {
          const inscriptionData = await getInscriptionData(`${output.txid}i${output.vout}`)
          inscriptions.push(inscriptionData.inscriptionData)
        }
      } catch (error) { }
    }
    return { result: true, data: inscriptions };
  } catch (error) {
    console.log(error);
    EXPORT_OBJECT.writeLog("getInscriptions error");
    return { result: false, data: [] };
  }
};

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

EXPORT_OBJECT.MIN_LOCKTIME = 7 * 24 * 3600 * 1000;

EXPORT_OBJECT.getCurrentGasPrices = async (chainID = CHAINID_ETH) => {
  try {
    const response = await axios.get(GAS_STATION[chainID]);
    const gasPrices = {
      low: web3.utils.hexToNumberString(response.data.result),
      medium: web3.utils
        .toBN(web3.utils.hexToNumber(response.data.result))
        .muln(1.2)
        .toString(),
      high: web3.utils
        .toBN(web3.utils.hexToNumber(response.data.result))
        .muln(1.5)
        .toString(),
    };
    // console.log("chainID", chainID, gasPrices)
    return gasPrices;
  } catch (error) {
    console.log("error:");
    throw error;
  }
};

EXPORT_OBJECT.addNotify = async (erc20Account, item) => {
  const notifyItem = new notify({
    erc20Account: erc20Account,
    type: item.type,
    title: item.title,
    link: item.link,
    content: item.content,
    notifyDate: Date.now(),
    active: true,
  });

  try {
    const savedItem = await notifyItem.save();
    // console.log("new notifyItem object saved: ", savedItem);
    console.log("new notifyItem object saved: ");
  } catch (error) {
    // console.log('Error saving item:', error);
    console.log("Error saving item:");
  }
};

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

module.exports = EXPORT_OBJECT;
