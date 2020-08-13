Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.ReactWebConfig = undefined;

const webpack = require('webpack');

// eslint-disable-next-line no-underscore-dangle
function interopRequireDefault(obj) { return obj && obj.__esModule ? obj : {default: obj}; }

const webpack2 = interopRequireDefault(webpack);
const dotenv = require('dotenv');

const ReactWebConfig = exports.ReactWebConfig = function ReactWebConfig(path) {
    const env = (0, dotenv.config)({path}).parsed;
    return new webpack2.default.DefinePlugin({
        __REACT_WEB_CONFIG__: JSON.stringify(env)
    });
};
