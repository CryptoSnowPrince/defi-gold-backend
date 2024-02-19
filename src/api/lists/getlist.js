const List = require('../../models/list');
const {
    SUCCESS,
    FAIL,
    SORT_BY_DEFAULT,
    SORT_BY_DATE_ASCENDING,
    SORT_BY_DATE_DISASCENDING,
    SORT_BY_PRICE_ASCENDING,
    SORT_BY_PRICE_DISASCENDING,
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        console.log("getList: ", req_.body);

        const categories = req_.body.categories;
        const inscriptionIds = req_.body.inscriptionIds;
        const inscriptionNumbers = req_.body.inscriptionNumbers;
        const addresses = req_.body.addresses;
        const minPrice = req_.body.minPrice;
        const maxPrice = req_.body.maxPrice;
        const sortBy = req_.body.sortBy;

        // console.log("req_: ", req_)

        // console.log("categories: ", categories);
        // console.log("inscriptionIds: ", inscriptionIds);
        // console.log("inscriptionNumbers: ", inscriptionNumbers);
        // console.log("addresss: ", addresss);
        // console.log("minPrice: ", minPrice);
        // console.log("maxPrice: ", maxPrice);
        // console.log("sortBy: ", sortBy);

        const matchQuery = {};

        if (categories && categories.length > 0) {
            matchQuery.category = { $in: categories }
        }

        if (inscriptionIds && inscriptionIds.length > 0) {
            matchQuery.inscriptionId = { $in: inscriptionIds }
        }

        if (inscriptionNumbers && inscriptionNumbers.length > 0) {
            matchQuery.inscriptionNumber = { $in: inscriptionNumbers }
        }

        if (addresses && addresses.length > 0) {
            matchQuery.address = { $in: addresses }
        }

        // console.log("matchQuery: ", matchQuery)

        const sortQuery = {};

        switch (sortBy) {
            case SORT_BY_DATE_ASCENDING:
                sortQuery.timestamps = 1;
                break;
            case SORT_BY_DATE_DISASCENDING:
                sortQuery.timestamps = -1;
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
                fetchItems = await List.aggregate([
                    {
                        $match: matchQuery
                    },
                    {
                        $sort: sortQuery
                    }
                ]);
            } else {
                fetchItems = await List.aggregate([
                    {
                        $match: matchQuery
                    }
                ]);
            }
            // console.log("getList fetchItems: ", fetchItems)
            return res_.send({ result: fetchItems, status: SUCCESS, message: "ok" });
        } catch (error) {
            console.log("getList aggregate error: ", error)
            return res_.send({ result: false, status: FAIL, message: "fail" });
        }
    } catch (error) {
        console.log('getList catch error: ', error)
        return res_.send({ result: false, status: FAIL, message: "fail" });
    }
}
