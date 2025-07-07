"use strict";
/* eslint-disable no-underscore-dangle */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var webpack_1 = require("webpack");
var webpackMockPaths_1 = require("./webpackMockPaths");
var envFile;
switch (process.env.ENV) {
    case 'production':
        envFile = '.env.production';
        break;
    case 'staging':
        envFile = '.env.staging';
        break;
    default:
        envFile = '.env';
}
var env = dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../".concat(envFile)) });
var customFunction = require('../config/webpack/webpack.common').default;
var custom = customFunction({ file: envFile });
var webpackConfig = function (_a) {
    var _b, _c, _d, _e, _f;
    var config = _a.config;
    if (!config.resolve) {
        config.resolve = {};
    }
    if (!config.plugins) {
        config.plugins = [];
    }
    if (!config.module) {
        config.module = {};
    }
    config.resolve.alias = __assign(__assign({}, webpackMockPaths_1.default), custom.resolve.alias);
    // We can ignore the "module not installed" warning from lottie-react-native
    // because we are not using the library for JSON format of Lottie animations.
    config.ignoreWarnings = [{ module: new RegExp('node_modules/lottie-react-native/lib/module/LottieView/index.web.js') }];
    // Necessary to overwrite the values in the existing DefinePlugin hardcoded to the Config staging values
    var definePluginIndex = config.plugins.findIndex(function (plugin) { return plugin instanceof webpack_1.DefinePlugin; });
    if (definePluginIndex !== -1 && config.plugins.at(definePluginIndex) instanceof webpack_1.DefinePlugin) {
        var definePlugin = config.plugins.at(definePluginIndex);
        if (definePlugin.definitions) {
            definePlugin.definitions.__REACT_WEB_CONFIG__ = JSON.stringify(env);
        }
    }
    config.resolve.extensions = custom.resolve.extensions;
    var babelRulesIndex = custom.module.rules.findIndex(function (rule) { return rule.loader === 'babel-loader'; });
    var babelRule = custom.module.rules.at(babelRulesIndex);
    if (babelRulesIndex !== -1 && babelRule) {
        (_b = config.module.rules) === null || _b === void 0 ? void 0 : _b.push(babelRule);
    }
    var fileLoaderRule = (_c = config.module.rules) === null || _c === void 0 ? void 0 : _c.find(function (rule) {
        return typeof rule !== 'boolean' && typeof rule !== 'string' && typeof rule !== 'number' && !!(rule === null || rule === void 0 ? void 0 : rule.test) && rule.test instanceof RegExp && rule.test.test('.svg');
    });
    if (fileLoaderRule) {
        fileLoaderRule.exclude = /\.svg$/;
    }
    (_d = config.module.rules) === null || _d === void 0 ? void 0 : _d.push({
        test: /\.svg$/,
        enforce: 'pre',
        loader: require.resolve('@svgr/webpack'),
    });
    (_e = config.module.rules) === null || _e === void 0 ? void 0 : _e.push({
        test: /pdf\.worker\.min\.mjs$/,
        type: 'asset/source',
    });
    config.plugins.push(new webpack_1.DefinePlugin({
        __DEV__: process.env.NODE_ENV === 'development',
    }));
    (_f = config.module.rules) === null || _f === void 0 ? void 0 : _f.push({
        test: /\.lottie$/,
        type: 'asset/resource',
    });
    return config;
};
exports.default = webpackConfig;
