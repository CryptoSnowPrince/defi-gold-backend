const Collection = require('../../models/collection');
const {
  SUCCESS,
  FAIL,
  isValidBitcoinAddress,
} = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    console.log('addCollection: ', req_.body);
    const { file } = req_;
    let filePath = file.path;
    let image = file.filename;
    console.log(filePath, file);
    // return res_.send({result: true, status: SUCCESS, message: 'collection created'});
    const title = String(req_.body.title);
    const symbol = String(req_.body.symbol);
    const description = String(req_.body.description);
    const icon = String(req_.body.icon);
    const derivated = Boolean(req_.body.derivated);
    const artLink = String(req_.body.artLink);
    const originalName = String(req_.body.originalName);
    const primaryCategory = String(req_.body.primaryCategory);
    const secondCategory = String(req_.body.secondaryCategory);
    const twitter = String(req_.body.twitter);
    const discord = String(req_.body.discord);
    const website = String(req_.body.website);
    const depositAddress = String(req_.body.deposit);
    const tipAddress = String(req_.body.artLink);
    const ownerAddress = String(req_.body.ownerAddress);
    const ownerEmail = String(req_.body.ownerEmail);
    const inscriptionList = req_.body.hashList;
    const collection = new Collection({title, symbol, description, icon, image, derivated, artLink, originalName, primaryCategory, secondCategory, twitter, discord, website, tipAddress, ownerAddress, ownerEmail, depositAddress, inscriptionList});
    try {
      await collection.save();
    } catch (error) {
      console.log('Error saving item:', error);
      return res_.send({ result: false, status: FAIL, message: 'fail' });
    }
    return res_.send({ result: true, status: SUCCESS, message: 'ok' });
  } catch (error) {
    console.log('addCollection catch error: ', error);
    return res_.send({ result: false, status: FAIL, message: 'fail' });
  }
};