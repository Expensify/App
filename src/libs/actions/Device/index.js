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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDeviceID = setDeviceID;
exports.getDeviceInfoWithID = getDeviceInfoWithID;
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var generateDeviceID_1 = require("./generateDeviceID");
var getDeviceInfo_1 = require("./getDeviceInfo");
var deviceID = null;
/**
 * @returns - device ID string or null in case of failure
 */
function getDeviceID() {
    return new Promise(function (resolve) {
        if (deviceID) {
            resolve(deviceID);
            return;
        }
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.DEVICE_ID,
            callback: function (id) {
                react_native_onyx_1.default.disconnect(connection);
                deviceID = id !== null && id !== void 0 ? id : null;
                return resolve(id !== null && id !== void 0 ? id : null);
            },
        });
    });
}
/**
 * Saves a unique deviceID into Onyx.
 */
function setDeviceID() {
    getDeviceID()
        .then(function (existingDeviceID) {
        if (!existingDeviceID) {
            return Promise.resolve();
        }
        throw new Error(existingDeviceID);
    })
        .then(generateDeviceID_1.default)
        .then(function (uniqueID) {
        Log_1.default.info('Got new deviceID', false, uniqueID);
        react_native_onyx_1.default.set(ONYXKEYS_1.default.DEVICE_ID, uniqueID);
    })
        .catch(function (error) { return Log_1.default.info('Found existing deviceID', false, error.message); });
}
/**
 * Returns a string object with device info and uniqueID
 * @returns - device info with ID
 */
function getDeviceInfoWithID() {
    return new Promise(function (resolve) {
        getDeviceID().then(function (currentDeviceID) {
            return resolve(JSON.stringify(__assign(__assign({}, (0, getDeviceInfo_1.default)()), { deviceID: currentDeviceID })));
        });
    });
}
