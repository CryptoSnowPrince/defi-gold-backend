const utils = require('./db/utils');
const {
    CHAINID_ETH,
    CHAINID_BSC,
    CHAINID_GOERLI,
    getCurrentGasPrices,
    ORD_CMD
} = require('./utils')
const awaitExec = require('util').promisify(require('child_process').exec);

let counter = 0
let isRunning = false;

const fetchGasPrice = async () => {
    try {
        if (isRunning) {
            return;
        }

        isRunning = true;
        counter++;
        console.log(`===========fetchGasPrice counter===========${counter}`);
        // sync ord
        const { stdout, stderr } = await awaitExec(`${ORD_CMD} balance`)
        console.log(`${ORD_CMD} balance stdout: `, stdout)
        console.log(`${ORD_CMD} balance stderr: `, stderr)
        await updateCurrentGasPrices(CHAINID_ETH);
        await updateCurrentGasPrices(CHAINID_GOERLI);
        await updateCurrentGasPrices(CHAINID_BSC);
        isRunning = false;
    } catch (error) {
        console.log('fetchGasPrice catch error: ', error)
    }
}

const updateCurrentGasPrices = async (chainID = CHAINID_ETH) => {
    try {
        const gasPrices = await getCurrentGasPrices(chainID)
        const fetchItem = await utils.findOne({ 'gas.chainID': chainID })
        if (fetchItem) {
            const _updateResult = await utils.updateOne({ 'gas.chainID': chainID }, { 'gas.gasPrices': gasPrices });

            if (!_updateResult) {
                // console.log("updateOne fail!", _updateResult);
                console.log("updateOne fail!");
            }
        } else {
            const utilsItem = new utils({
                gas: {
                    chainID: chainID,
                    gasPrices: gasPrices
                }
            })

            try {
                const savedItem = await utilsItem.save();
                // console.log("new utils object saved: ", savedItem);
                console.log("new utils object saved: ");
            } catch (error) {
                // console.log('Error saving item:', error);
                console.log('Error saving item:');
            }
        }
    } catch (error) {
        console.log("error:");
    }
}

module.exports = async () => {
    try {
        console.log("start fetchGasPrice");
        setInterval(async () => { await fetchGasPrice() }, 20000);
    } catch (error) {
        console.log('checkOffer catch error: ', error);
    }
}
