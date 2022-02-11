const {merge} = require('webpack-merge');
const dotenv = require('dotenv');
const common = require('./webpack.common');
const getProductionConfig = require('./productionConfig');

/**
 * Builds a production grade web bundle
 * @param {String} envFile path to the env file to be used
 * @returns {Configuration}
 */
module.exports = ({envFile}) => {
    const envConfig = dotenv.config({path: envFile});
    return merge(common, getProductionConfig(envConfig.parsed));
};
