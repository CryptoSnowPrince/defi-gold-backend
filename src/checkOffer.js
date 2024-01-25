const axios = require("axios");
const { exec } = require('child_process');
const ABI = require("./abi.json");
const { offer } = require('./db');
const {
    PRIK,
    ADDRESS,
    CHAINID_ETH,
    CHAINID_BSC,
    CHAINID_GOERLI,
    NETWORK,
    OFFER_NOT_STARTED,
    OFFER_CREATED,
    OFFER_ALLOWED,
    OFFER_CANCELED,
    OFFER_COMPLETED,
    writeOfferCheckLog,
    web3,
    ETH,
    USDT,
    USDC,
    oBTC,
    OFI,
    oDOGE,
    getCurrentGasPrices,
    addNotify,
    getDisplayString,
    ORD_CMD,
    FEE_RECOMMAND_API,
} = require('./utils')

const admin = web3.eth.accounts.privateKeyToAccount(PRIK);;
const OrdinalBTCMarket = new web3.eth.Contract(ABI, ADDRESS);

const getTokenAmountFromWei = (token, amount) => {
    switch (token) {
        case ETH:
            return web3.utils.fromWei(amount, "ether"); // decimals 18
        case oBTC:
            return web3.utils.fromWei(amount, "ether"); // decimals 18
        case USDT:
            return web3.utils.fromWei(amount, "mwei"); // decimals 6
        case USDC:
            return web3.utils.fromWei(amount, "mwei"); // decimals 6
        case OFI:
            return web3.utils.fromWei(amount, "gwei"); // decimals 9
        case oDOGE:
            return web3.utils.fromWei(amount, "ether"); // decimals 18
        default:
            return web3.utils.fromWei(amount, "ether"); // decimals 18
    }
}

let counter = 0
let isRunning = false;

const fetchContracts = async () => {
    try {
        if (isRunning) {
            return;
        }

        console.log("===========start===========");
        isRunning = true;
        counter++;
        writeOfferCheckLog(`===========counter===========${counter}`);
        try {
            const orderNumber = parseInt(await OrdinalBTCMarket.methods.orderNumber().call());
            const checkedOrderNumber = parseInt(await OrdinalBTCMarket.methods.checkedOrderNumber().call());
            const withdrawNumber = parseInt(await OrdinalBTCMarket.methods.withdrawNumber().call());

            writeOfferCheckLog(`[===orderNumber===]: ${orderNumber}`)
            writeOfferCheckLog(`[===checkedOrderNumber===]: ${checkedOrderNumber}`)
            writeOfferCheckLog(`[===withdrawNumber===]: ${withdrawNumber}`)

            if (orderNumber > checkedOrderNumber) {
                for (let index = checkedOrderNumber; index <= orderNumber; index++) {
                    const OfferInfo = await OrdinalBTCMarket.methods.offerInfo(index).call();
                    console.log(`[===checkedOrder part===]: ${JSON.stringify(OfferInfo)}`)
                    if (parseInt(OfferInfo.state) === OFFER_CREATED) {
                        writeOfferCheckLog(`OfferInfo.state: OFFER_CREATED: ${OfferInfo.state} ${OFFER_CREATED}`);
                        // change offer state to created, and check offer
                        var state = OFFER_CANCELED
                        const fetchItem = await offer.findOne({ inscriptionNumber: parseInt(OfferInfo.btcNFTId), state: OFFER_NOT_STARTED, active: true });
                        console.log(`fetchItem: ${fetchItem} ${OfferInfo.btcNFTId}`);
                        if (fetchItem) {
                            const tokenAmount = getTokenAmountFromWei(fetchItem.tokenAddress, OfferInfo.amount);
                            const cond = fetchItem.inscriptionNumber === parseInt(OfferInfo.btcNFTId) &&
                                fetchItem.btcSeller.toString() === OfferInfo.nft_owner.toString() &&
                                fetchItem.erc20Seller.toString().toLowerCase() === OfferInfo.seller.toString().toLowerCase() &&
                                fetchItem.tokenAddress.toLowerCase() === OfferInfo.token.toString().toLowerCase() &&
                                fetchItem.inscriptionID.toString() === OfferInfo.inscriptionID.toString() &&
                                fetchItem.tokenAmount.toString() === tokenAmount.toString();

                            console.log(`[===cond0===] ${fetchItem.inscriptionNumber} ${OfferInfo.btcNFTId} ${fetchItem.inscriptionNumber === parseInt(OfferInfo.btcNFTId)}`)
                            console.log(`[===cond1===] ${fetchItem.btcSeller} ${OfferInfo.nft_owner} ${fetchItem.btcSeller.toString() === OfferInfo.nft_owner.toString()}`)
                            console.log(`[===cond2===] ${fetchItem.erc20Seller} ${fetchItem.erc20Seller.toString().toLowerCase() === OfferInfo.seller.toString().toLowerCase()}`)
                            console.log(`[===cond3===] ${fetchItem.tokenAddress} ${fetchItem.tokenAddress.toLowerCase() === OfferInfo.token.toString().toLowerCase()}`)
                            console.log(`[===cond4===] ${fetchItem.inscriptionID} ${OfferInfo.inscriptionID, fetchItem.inscriptionID.toString() === OfferInfo.inscriptionID.toString()}`)
                            console.log(`[===cond5===] ${fetchItem.tokenAmount} ${tokenAmount} ${fetchItem.tokenAmount.toString() === tokenAmount.toString()}`)
                            writeOfferCheckLog(`[===cond6===] ${cond}`)
                            console.log(`[===fetchItem===] ${JSON.stringify(fetchItem)}`)
                            console.log(`[===OfferInfo===] ${JSON.stringify(OfferInfo)}`)

                            const _updateResult = await offer.updateOne({ inscriptionNumber: parseInt(OfferInfo.btcNFTId), state: OFFER_NOT_STARTED, active: true }, {
                                orderNumber: index,
                                active: false
                            });

                            if (!_updateResult) {
                                console.log("change state inactive to OFFER_NOT_STARTED err! need manual operation");
                            }

                            console.log("new offer list(OFFER_CREATED): ");
                            const offerItem = new offer({
                                inscriptionNumber: fetchItem.inscriptionNumber,
                                inscriptionID: fetchItem.inscriptionID,
                                name: fetchItem.name,
                                category: fetchItem.category,
                                orderNumber: index,
                                btcSeller: fetchItem.btcSeller,
                                btcBuyer: OfferInfo.nft_receiver,
                                erc20Seller: fetchItem.erc20Seller,
                                erc20Buyer: OfferInfo.buyer,
                                tokenAddress: fetchItem.tokenAddress,
                                tokenAmount: fetchItem.tokenAmount,
                                description: fetchItem.description,
                                state: OFFER_CREATED,
                                actionDate: Date.now(),
                                lockTime: 0,
                                active: true
                            })
                            console.log(`offerItem: ${JSON.stringify(offerItem)}`);

                            try {
                                const savedItem = await offerItem.save();
                                console.log("save savedItem: ", savedItem);
                            } catch (error) {
                                console.log('Error saving item:', error);
                            }

                            if (cond) {
                                writeOfferCheckLog("change state to OFFER_ALLOWED!");
                                state = OFFER_ALLOWED
                            }
                        }

                        const offerCheck = OrdinalBTCMarket.methods.offerCheck(index, state);
                        const encodedTx = offerCheck.encodeABI();
                        const gasFee = await offerCheck.estimateGas({ from: admin.address });
                        console.log("offerCheck gasFee: ", gasFee)
                        await SignAndSendTransaction(web3, admin, encodedTx, gasFee, ADDRESS, 0, NETWORK, state, OfferInfo, fetchItem, index);
                    }
                }
            }

            const completedOfferAll = await offer.find({ state: OFFER_COMPLETED });
            const completedOfferAllLength = completedOfferAll.length;
            writeOfferCheckLog(`[===completedOfferAllLength===] ${completedOfferAllLength}`)

            if (withdrawNumber > completedOfferAllLength) {
                for (let index = completedOfferAllLength + 1; index <= withdrawNumber; index++) {
                    writeOfferCheckLog(`[===withdraw part index===] ${index}`)
                    const withdrawHistory = await OrdinalBTCMarket.methods.withdrawHistory(index).call();
                    const OfferInfo = await OrdinalBTCMarket.methods.offerInfo(withdrawHistory).call();
                    console.log("[===withdraw part===]", OfferInfo)
                    if (parseInt(OfferInfo.state) === OFFER_COMPLETED) {
                        console.log("[===withdraw withdrawHistory===]", withdrawHistory, parseInt(OfferInfo.btcNFTId), OFFER_ALLOWED)
                        writeOfferCheckLog(`OfferInfo.state: OFFER_COMPLETED: ${OfferInfo.state} ${OFFER_COMPLETED}`);

                        // change offer state to completed, and remove offer and add offer
                        const fetchItem = await offer.findOne({ orderNumber: withdrawHistory, inscriptionNumber: parseInt(OfferInfo.btcNFTId), state: OFFER_ALLOWED, active: true });
                        console.log("fetchItem: ", fetchItem);
                        if (fetchItem) {
                            const _updateResult = await offer.updateOne({ orderNumber: withdrawHistory, inscriptionNumber: parseInt(OfferInfo.btcNFTId), state: OFFER_ALLOWED, active: true }, {
                                active: false
                            });

                            if (!_updateResult) {
                                writeOfferCheckLog("change state inactive to OFFER_ALLOWED err! need manual operation");
                            }

                            writeOfferCheckLog("new offer list(OFFER_COMPLETED): ");
                            const offerItem = new offer({
                                inscriptionNumber: fetchItem.inscriptionNumber,
                                inscriptionID: fetchItem.inscriptionID,
                                name: fetchItem.name,
                                category: fetchItem.category,
                                orderNumber: index,
                                btcSeller: fetchItem.btcSeller,
                                btcBuyer: OfferInfo.nft_receiver,
                                erc20Seller: fetchItem.erc20Seller,
                                erc20Buyer: OfferInfo.buyer,
                                tokenAddress: fetchItem.tokenAddress,
                                tokenAmount: fetchItem.tokenAmount,
                                description: fetchItem.description,
                                state: OFFER_COMPLETED,
                                actionDate: Date.now(),
                                lockTime: 0,
                                active: false
                            })
                            console.log("offerItem: ", offerItem);

                            try {
                                const savedItem = await offerItem.save();
                                console.log("save savedItem: ", savedItem);
                            } catch (error) {
                                console.log('Error saving item:', error);
                            }
                        } else {
                            writeOfferCheckLog("Already logWithdrawn")
                        }
                    }
                }
            }
        } catch (error) {
            writeOfferCheckLog(`error catch`);
            console.log(error);
        } finally {
            isRunning = false;
        }
        console.log("===========end===========");
    } catch (error) {
        console.log('fetchContracts catch error: ', error)
    }
}

const SignAndSendTransaction = async (web3WS, admin_wallet, encodedFunc, gasfee, contractAddress, nativeValue, chainId, state, OfferInfo, fetchItem, orderNumber) => {
    if (chainId != CHAINID_ETH && chainId != CHAINID_GOERLI && chainId != CHAINID_BSC) return;
    try {
        const gasPrice = (await getCurrentGasPrices(chainId)).medium;
        var balanceOfAdmin = await web3WS.eth.getBalance(admin_wallet.address);
        if (balanceOfAdmin <= gasfee * gasPrice) {
            console.log("Insufficient balance. balanceOfAdmin = ", balanceOfAdmin, "gasFee*gasPrice = ", gasfee * gasPrice)
            return null;
        }
        let nonce = await web3WS.eth.getTransactionCount(admin_wallet.address, "pending");
        console.log("nonce: ", nonce)
        nonce = web3WS.utils.toHex(nonce);
        var tx = {
            from: admin_wallet.address,
            to: contractAddress,
            gas: gasfee,
            gasPrice: gasPrice,
            data: encodedFunc,
            value: nativeValue,
            nonce
        };
        var signedTx = await admin_wallet.signTransaction(tx);
        await web3WS.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('transactionHash', async function (hash) {
                console.log("ts hash = ", hash);
                if (state === OFFER_CANCELED) {
                    await addNotify(OfferInfo.buyer.toString().toLowerCase(), {
                        type: 0,
                        title: 'Purchase Inscription Fail!',
                        link: `https://etherscan.io/tx/${hash}`,
                        content: `Unfortunately, your order cancelled! Please contact to support team with your tx hash.`
                    })
                } else if (state === OFFER_ALLOWED) {
                    await addNotify(OfferInfo.buyer.toString().toLowerCase(), {
                        type: 0,
                        title: 'Purchase Inscription allowed!',
                        link: `https://etherscan.io/tx/${hash}`,
                        content: `Congratulation! your order allowed! You will see your inscrition in your wallet soon!`
                    })
                }
            })
            .on('receipt', async function (receipt) {
                writeOfferCheckLog("")
                writeOfferCheckLog('----------------------  tx sent ---------------------')
                console.log('receipt', receipt)
                // change offerState to "allowed" or "cancelled"
                // state
                const response = await axios.get(FEE_RECOMMAND_API)
                const feeRate = response.data.fastestFee
                writeOfferCheckLog(`${ORD_CMD} send --fee-rate ${feeRate} ${OfferInfo.nft_receiver} ${OfferInfo.inscriptionID}`)
                const _updateResult = await offer.updateOne({ orderNumber: orderNumber, inscriptionID: OfferInfo.inscriptionID, state: OFFER_CREATED, active: true }, {
                    active: false
                });

                if (!_updateResult) {
                    writeOfferCheckLog("change state inactive to OFFER_ALLOWED err! need manual operation");
                }

                if (state === OFFER_CANCELED) {
                    writeOfferCheckLog("new offer list(OFFER_CANCELED): ");
                    const offerItem = new offer({
                        inscriptionNumber: fetchItem.inscriptionNumber,
                        inscriptionID: fetchItem.inscriptionID,
                        name: fetchItem.name,
                        category: fetchItem.category,
                        orderNumber: orderNumber,
                        btcSeller: fetchItem.btcSeller,
                        btcBuyer: OfferInfo.nft_receiver,
                        erc20Seller: fetchItem.erc20Seller,
                        erc20Buyer: OfferInfo.buyer,
                        tokenAddress: fetchItem.tokenAddress,
                        tokenAmount: fetchItem.tokenAmount,
                        description: fetchItem.description,
                        state: OFFER_CANCELED,
                        actionDate: Date.now(),
                        lockTime: 0,
                        active: false
                    })
                    console.log("offerItem: ", offerItem);

                    try {
                        const savedItem = await offerItem.save();
                        console.log("save savedItem: ", savedItem);
                    } catch (error) {
                        console.log('Error saving item:', error);
                    }
                } else if (state === OFFER_ALLOWED) {
                    writeOfferCheckLog("SUCCESS: update offer state from OFFER_CREATED to OFFER_ALLOWED!");
                    // send inscription
                    exec(`${ORD_CMD} send --fee-rate ${feeRate} ${OfferInfo.nft_receiver} ${OfferInfo.inscriptionID}`, async (error, stdout, stderr) => {
                        if (error) {
                            writeOfferCheckLog(`exec error: ${error}`);
                            console.log("sendInscription err: ", error, 'need manual ord send operation');
                        } else if (stderr) {
                            writeOfferCheckLog(`exec stderr: ${stderr}`);
                            writeOfferCheckLog(`sendInscription stderr: ${stderr}`, 'need manual ord send operation');
                        } else {
                            writeOfferCheckLog(`stdout: ${stdout}`);
                            writeOfferCheckLog(`sendInscription success stdout: ${stdout}`);
                            await addNotify(OfferInfo.buyer.toString().toLowerCase(), {
                                type: 0,
                                title: 'Purchase Inscription Success!',
                                link: `https://mempool.space/tx/${stdout}`,
                                content: `Congratulation! Your inscription ${getDisplayString(OfferInfo.inscriptionID)} will arrive to your wallet in 30 mins`
                            })

                            await addNotify(OfferInfo.seller.toString().toLowerCase(), {
                                type: 0,
                                title: 'Your Inscription sold!',
                                link: `https://mempool.space/tx/${stdout}`,
                                content: `Congratulation! Your inscription ${getDisplayString(OfferInfo.inscriptionID)} sold successfully! Please withdraw your funds on your inscription page.`
                            })

                            writeOfferCheckLog("new offer list(OFFER_ALLOWED): ");
                            const offerItem = new offer({
                                inscriptionNumber: fetchItem.inscriptionNumber,
                                inscriptionID: fetchItem.inscriptionID,
                                name: fetchItem.name,
                                category: fetchItem.category,
                                orderNumber: orderNumber,
                                btcSeller: fetchItem.btcSeller,
                                btcBuyer: OfferInfo.nft_receiver,
                                erc20Seller: fetchItem.erc20Seller,
                                erc20Buyer: OfferInfo.buyer,
                                tokenAddress: fetchItem.tokenAddress,
                                tokenAmount: fetchItem.tokenAmount,
                                description: fetchItem.description,
                                state: OFFER_ALLOWED,
                                actionDate: Date.now(),
                                lockTime: 0,
                                txHash: stdout,
                                active: true
                            })
                            console.log("offerItem: ", offerItem);

                            try {
                                const savedItem = await offerItem.save();
                                console.log("save savedItem: ", savedItem);
                            } catch (error) {
                                console.log('Error saving item:', error);
                            }
                        }
                    });
                }
                writeOfferCheckLog(" ")
            })
            .on('error', function (error, receipt) {
                writeOfferCheckLog("")
                writeOfferCheckLog('----------------------  tx failed ---------------------')
                console.log('error, receipt', error, receipt, 'need manual operation')
                writeOfferCheckLog('error, receipt need manual operation')
                writeOfferCheckLog(" ")
            });
    } catch (err) {
        console.log("SignAndSendTransaction() exception: ", err);
    }
}

module.exports = async () => {
    try {
        writeOfferCheckLog("start init");
        setInterval(async () => { await fetchContracts() }, 10000);
    } catch (error) {
        console.log('checkOffer catch error: ', error);
    }
}
