const axios = require('axios');
const Replicate = require('replicate');
const { SUCCESS, FAIL, MEMPOOL_URL } = require('../../utils');

module.exports = async (req_, res_) => {
  try {
    console.log('generateAIImage: ', req_.body);
    const prompt = req_.body.prompt;

    if (!prompt) {
      return res_.send({ result: null, status: FAIL, message: 'fail' });
    }

    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
      const model =
        'stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478';
      const input = {
        prompt: prompt,
      };
      const output = await replicate.run(model, { input });
      console.log(output);
      return res_.send({
        result: output,
        status: SUCCESS,
        message: 'ok',
      });
    } catch (error) {
      console.log(error);
      return res_.send({ result: null, status: FAIL, message: 'fail' });
    }
  } catch (error) {
    console.log('getAddressInfo: ', error);
    return res_.send({ result: null, status: FAIL, message: 'fail' });
  }
};
