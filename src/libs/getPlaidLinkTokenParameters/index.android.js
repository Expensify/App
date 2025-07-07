"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_device_info_1 = require("react-native-device-info");
var getPlaidLinkTokenParameters = function () { return ({
    androidPackage: react_native_device_info_1.default.getBundleId(),
}); };
exports.default = getPlaidLinkTokenParameters;
