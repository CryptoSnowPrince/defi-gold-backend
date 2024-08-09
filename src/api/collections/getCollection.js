const { default: axios } = require('axios');
const Collection = require('../../models/collection');
const {
  SUCCESS,
  FAIL,
  SORT_BY_DEFAULT,
  SORT_BY_DATE_ASCENDING,
  SORT_BY_DATE_DISASCENDING,
  SORT_BY_PRICE_ASCENDING,
  SORT_BY_PRICE_DISASCENDING,
  isValidBitcoinAddress,
  UNISAT_API,
  UNISAT_API_KEY_0,
  UNISAT_API_KEY_4,
} = require('../../utils');
const { response } = require('../../app');
const List = require('../../models/list');

module.exports = async (req_, res_) => {
  try {
    console.log('getCollection: ', req_.query);
    try {
      let collection = await Collection.findOne({ symbol: req_.query.symbol });
      let inscriptions;
      if (collection) {
        try {
          let options = {
            method: 'GET',
            url: `${UNISAT_API}/v1/indexer/address/${collection.ownerAddress}/balance`,
            headers: {
              Authorization: `Bearer ${UNISAT_API_KEY_0}`,
            },
          };
          const inscriptionSummary = await axios.request(options);
          let cursor = 0;
          let inscripts;
          if (inscriptionSummary.data.code === 0) {
            let options2 = {
              method: 'GET',
              url: `${UNISAT_API}/v1/indexer/address/${collection.ownerAddress}/inscription-data?cursor=${cursor}&size=${inscriptionSummary.data.data.inscriptionUtxoCount}`,
              headers: {
                Authorization: `Bearer ${UNISAT_API_KEY_4}`,
              },
            };
      
            const inscriptionRes = await axios.request(options2);
            if (inscriptionRes.data.code === 0) {
              inscripts = inscriptionRes.data.data.inscription;
              inscripts = inscripts.filter((item) => collection.inscriptionList.includes(item.inscriptionId));
              const listedItems = await List.find({address: collection.ownerAddress});
              inscriptions = inscripts.map((item) => {
                return {...item, isListed: listedItems.findIndex(it => it.inscriptionId === item.inscriptionId) >= 0 ? true : false}
              });
            }
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
      console.log
      return res_.send({ result: {collection: collection, inscriptions: inscriptions}, status: SUCCESS, message: 'ok' });
    } catch (error) {
      console.log('getCollections aggregate error:', error);
      return res_.send({ result: false, status: FAIL, message: 'fail' });
    }
  } catch (error) {
    console.log('getCollections catch error: ', error);
    return res_.send({ result: false, status: FAIL, message: 'fail' });
  }
};