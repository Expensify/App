"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var webpack_1 = require("webpack");
// eslint-disable-next-line @dword-design/import-alias/prefer-alias, import/no-relative-packages -- alias imports don't work for webpack
var package_json_1 = require("../../desktop/package.json");
var webpack_common_1 = require("./webpack.common");
/**
 * Desktop creates 2 configurations in parallel
 * 1. electron-main - the core that serves the app content
 * 2. web - the app content that would be rendered in electron
 * Everything is placed in desktop/dist and ready for packaging
 */
var getConfiguration = function (environment) {
    var _a, _b;
    var rendererConfig = (0, webpack_common_1.default)(__assign(__assign({}, environment), { platform: 'desktop' }));
    var outputPath = path_1.default.resolve(__dirname, '../../desktop/dist');
    rendererConfig.name = 'renderer';
    ((_a = rendererConfig.output) !== null && _a !== void 0 ? _a : (rendererConfig.output = {})).path = path_1.default.join(outputPath, 'www');
    // Expose react-native-config to desktop-main
    var definePlugin = (_b = rendererConfig.plugins) === null || _b === void 0 ? void 0 : _b.find(function (plugin) { return (plugin === null || plugin === void 0 ? void 0 : plugin.constructor) === webpack_1.default.DefinePlugin; });
    var mainProcessConfig = {
        mode: 'production',
        name: 'desktop-main',
        target: 'electron-main',
        entry: {
            main: './desktop/main.ts',
            contextBridge: './desktop/contextBridge.ts',
        },
        output: {
            filename: '[name].js',
            path: outputPath,
            libraryTarget: 'commonjs2',
        },
        resolve: rendererConfig.resolve,
        plugins: [definePlugin],
        externals: __spreadArray(__spreadArray([], Object.keys(package_json_1.dependencies), true), ['fsevents'], false),
        node: {
            /**
             * Disables webpack processing of __dirname and __filename, so it works like in node
             * https://github.com/webpack/webpack/issues/2010
             */
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __dirname: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __filename: false,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
            ],
        },
    };
    return [mainProcessConfig, rendererConfig];
};
exports.default = getConfiguration;
