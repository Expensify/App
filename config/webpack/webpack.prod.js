const path = require('path');
const {merge} = require('webpack-merge');
const dotenv = require('dotenv');
const common = require('./webpack.common.js');
const getProductionConfig = require('./productionConfig');

const env = dotenv.config({path: path.resolve(__dirname, '../../.env.production')}).parsed;

module.exports = merge(common, getProductionConfig(env));
