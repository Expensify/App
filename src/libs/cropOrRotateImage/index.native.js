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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_manipulator_1 = require("expo-image-manipulator");
var react_native_blob_util_1 = require("react-native-blob-util");
var getSaveFormat_1 = require("./getSaveFormat");
/**
 * Crops and rotates the image on ios/android
 */
var cropOrRotateImage = function (uri, actions, options) {
    return new Promise(function (resolve) {
        var format = (0, getSaveFormat_1.default)(options.type);
        // We need to remove the base64 value from the result, as it is causing crashes on Release builds.
        // More info: https://github.com/Expensify/App/issues/37963#issuecomment-1989260033
        (0, expo_image_manipulator_1.manipulateAsync)(uri, actions, { compress: options.compress, format: format }).then(function (_a) {
            var base64 = _a.base64, result = __rest(_a, ["base64"]);
            react_native_blob_util_1.default.fs.stat(result.uri.replace('file://', '')).then(function (_a) {
                var size = _a.size;
                resolve(__assign(__assign({}, result), { size: size, type: options.type || 'image/jpeg', name: options.name || 'fileName.jpg' }));
            });
        });
    });
};
exports.default = cropOrRotateImage;
