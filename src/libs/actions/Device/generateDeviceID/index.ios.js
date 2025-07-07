"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_device_info_1 = require("react-native-device-info");
var deviceID = react_native_device_info_1.default.getDeviceId();
/**
 * Get the unique ID of the current device. This should remain the same even if the user uninstalls and reinstalls the app.
 */
var generateDeviceID = function () { return react_native_device_info_1.default.getUniqueId().then(function (uniqueID) { return "".concat(deviceID, "_").concat(uniqueID); }); };
exports.default = generateDeviceID;
