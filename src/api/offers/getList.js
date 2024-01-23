const { offer } = require('../../db');
const {
    SUCCESS,
    FAIL,
    SORT_BY_DEFAULT,
    SORT_BY_DATE_ASCENDING,
    SORT_BY_DATE_DISASCENDING,
    SORT_BY_PRICE_ASCENDING,
    SORT_BY_PRICE_DISASCENDING,
    getTokenPriceInUSDByMoralise
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getList: ", req_.body);

        const categories = req_.body.categories;
        const tokenAddresses = req_.body.tokenAddresses;
        const btcSellers = req_.body.btcSellers;
        const btcBuyers = req_.body.btcBuyers;
        const inscriptionIDs = req_.body.inscriptionIDs;
        const inscriptionNumbers = req_.body.inscriptionNumbers;
        const states = req_.body.states;
        const minPrice = req_.body.minPrice;
        const maxPrice = req_.body.maxPrice;
        const sortBy = req_.body.sortBy;
        const active = req_.body.active;

        // await getTokenPriceInUSDByMoralise("0xff770e4c68e35db85c6e0e89a43750ec02bdb2ac")
        // await getTokenPriceInUSDByMoralise("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")

        // console.log("req_: ", req_)

        // console.log("categories: ", categories);
        // console.log("tokenAddresses: ", tokenAddresses);
        // console.log("btcSellers: ", btcSellers);
        // console.log("btcBuyers: ", btcBuyers);
        // console.log("inscriptionIDs: ", inscriptionIDs);
        // console.log("inscriptionNumbers: ", inscriptionNumbers);
        // console.log("states: ", states);
        // console.log("minPrice: ", minPrice);
        // console.log("maxPrice: ", maxPrice);
        // console.log("sortBy: ", sortBy);
        // console.log("active: ", active);

        const matchQuery = {};

        if (categories && categories.length > 0) {
            matchQuery.category = { $in: categories }
        }

        if (tokenAddresses && tokenAddresses.length > 0) {
            matchQuery.tokenAddress = { $in: tokenAddresses }
        }

        if (btcSellers && btcSellers.length > 0) {
            matchQuery.btcSeller = { $in: btcSellers }
        }

        if (btcBuyers && btcBuyers.length > 0) {
            matchQuery.btcBuyer = { $in: btcBuyers }
        }

        if (inscriptionIDs && inscriptionIDs.length > 0) {
            matchQuery.inscriptionID = { $in: inscriptionIDs }
        }

        if (inscriptionNumbers && inscriptionNumbers.length > 0) {
            matchQuery.inscriptionNumber = { $in: inscriptionNumbers }
        }

        if (states && states.length > 0) {
            matchQuery.state = { $in: states }
        }

        if (active !== undefined) {
            matchQuery.active = active
        }

        // console.log("matchQuery: ", matchQuery)

        const sortQuery = {};

        switch (sortBy) {
            case SORT_BY_DATE_ASCENDING:
                sortQuery.actionDate = 1;
                break;
            case SORT_BY_DATE_DISASCENDING:
                sortQuery.actionDate = -1;
                break;
            case SORT_BY_PRICE_ASCENDING:
            case SORT_BY_PRICE_DISASCENDING:
            case SORT_BY_DEFAULT:
            default:
                break;
        }

        // TODO Price Range Filter

        // const groupByQuery = {
        //     category: "$category"
        // }

        try {
            let fetchItems
            if (sortQuery && Object.keys(sortQuery).length > 0) {
                fetchItems = await offer.aggregate([
                    {
                        $match: matchQuery
                    },
                    {
                        $sort: sortQuery
                    }
                ]);
            } else {
                fetchItems = await offer.aggregate([
                    {
                        $match: matchQuery
                    }
                ]);
            }
            // console.log("getList fetchItems: ", fetchItems)
            return res_.send({ result: fetchItems, status: SUCCESS, message: "get list success" });
        } catch (error) {
            console.log("getList aggregate error: ", error)
            return res_.send({ result: false, status: FAIL, message: "get list fail" });
        }
    } catch (error) {
        console.log('getList catch error: ', error)
        return res_.send({ result: false, status: FAIL, message: "Catch Error" });
    }
}
