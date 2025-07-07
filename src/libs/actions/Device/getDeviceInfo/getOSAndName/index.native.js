"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_native_device_info_1 = require("react-native-device-info");
var getOSAndName = function () {
    var deviceName = react_native_device_info_1.default.getDeviceNameSync();
    var prettyName = "".concat(expensify_common_1.Str.UCFirst(react_native_device_info_1.default.getManufacturerSync() || ''), " ").concat(deviceName);
    return {
        deviceName: react_native_device_info_1.default.isEmulatorSync() ? "Emulator - ".concat(prettyName) : prettyName,
        osVersion: react_native_device_info_1.default.getSystemVersion(),
    };
};
exports.default = getOSAndName;
