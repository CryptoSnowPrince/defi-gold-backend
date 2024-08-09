const { default: axios } = require('axios');
const Collection = require('../../models/collection');
const List = require('../../models/list');

const {
  SUCCESS,
  FAIL,
  SORT_BY_DEFAULT,
  SORT_BY_DATE_ASCENDING,
  SORT_BY_DATE_DISASCENDING,
  SORT_BY_PRICE_ASCENDING,
  SORT_BY_PRICE_DISASCENDING,
  isValidBitcoinAddress,
  UNISAT_API_KEY_4,
  UNISAT_API,
  UNISAT_API_KEY_0,
} = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    console.log('getCollections: ', req_.body);
    const matchQuery = {};
    const sortQuery = {};
    sortQuery.timestamp = -1;
    try {
      let collectionList = await Collection.aggregate([
        {
          $sort: sortQuery,
        }
      ]);
      let collections = [];
      for (let i = 0; i < collectionList.length; i ++) {
        let inscriptionRes, inscriptionSummary;
        try {
          let options = {
            method: 'GET',
            url: `${UNISAT_API}/v1/indexer/address/${collectionList[i].ownerAddress}/balance`,
            headers: {
              Authorization: `Bearer ${UNISAT_API_KEY_0}`,
            },
          };
          inscriptionSummary = await axios.request(options);
          let cursor = 0;
          if (inscriptionSummary.data.code === 0) {
            let options2 = {
              method: 'GET',
              url: `${UNISAT_API}/v1/indexer/address/${collectionList[i].ownerAddress}/inscription-data?cursor=${cursor}&size=${inscriptionSummary.data.data.inscriptionUtxoCount}`,
              headers: {
                Authorization: `Bearer ${UNISAT_API_KEY_4}`,
              },
            };
      
            inscriptionRes = await axios.request(options2);
          }
        } catch (error) {
          console.error('Error:', error);
        }
        const listedItems = await List.find({inscriptionId: { $in: collectionList[i].inscriptionList }});
        collections[i] = {...collectionList[i], total: collectionList[i].inscriptionList.length, listed: listedItems.length}
      }
      return res_.send({ result: collections, status: SUCCESS, message: 'ok' });
    } catch (error) {
      console.log('getCollections aggregate error:', error);
      return res_.send({ result: false, status: FAIL, message: 'fail' });
    }
  } catch (error) {
    console.log('getCollections catch error: ', error);
    return res_.send({ result: false, status: FAIL, message: 'fail' });
  }
};