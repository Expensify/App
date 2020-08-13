'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactWebConfig = undefined;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _dotenv = require('dotenv');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReactWebConfig = exports.ReactWebConfig = function ReactWebConfig(path) {
  var env = (0, _dotenv.config)({ path: path }).parsed;
  return new _webpack2.default.DefinePlugin({
    '__REACT_WEB_CONFIG__': JSON.stringify(env)
  });
};