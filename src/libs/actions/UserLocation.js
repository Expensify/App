"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserLocation = setUserLocation;
exports.clearUserLocation = clearUserLocation;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Sets the longitude and latitude of user's current location
 */
function setUserLocation(_a) {
    var longitude = _a.longitude, latitude = _a.latitude;
    react_native_onyx_1.default.set(ONYXKEYS_1.default.USER_LOCATION, { longitude: longitude, latitude: latitude });
}
function clearUserLocation() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.USER_LOCATION, null);
}
