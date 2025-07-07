"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLocationPermission = requestLocationPermission;
exports.getLocationPermission = getLocationPermission;
var react_native_permissions_1 = require("react-native-permissions");
var CONST_1 = require("@src/CONST");
function requestLocationPermission() {
    return new Promise(function (resolve) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function () { return resolve(react_native_permissions_1.RESULTS.GRANTED); }, function (error) { return resolve(error.TIMEOUT || error.POSITION_UNAVAILABLE ? react_native_permissions_1.RESULTS.BLOCKED : react_native_permissions_1.RESULTS.DENIED); }, {
                timeout: CONST_1.default.GPS.TIMEOUT,
                enableHighAccuracy: true,
            });
        }
        else {
            resolve(react_native_permissions_1.RESULTS.UNAVAILABLE);
        }
    });
}
function getLocationPermission() {
    return new Promise(function (resolve) {
        if (navigator.geolocation) {
            navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
                if (result.state === 'prompt') {
                    resolve(react_native_permissions_1.RESULTS.DENIED);
                    return;
                }
                resolve(result.state === 'granted' ? react_native_permissions_1.RESULTS.GRANTED : react_native_permissions_1.RESULTS.BLOCKED);
            });
        }
        else {
            resolve(react_native_permissions_1.RESULTS.UNAVAILABLE);
        }
    });
}
