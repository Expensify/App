"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geolocation_1 = require("@react-native-community/geolocation");
geolocation_1.default.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    locationProvider: 'auto',
});
var getCurrentPosition = function (success, error, config) {
    geolocation_1.default.getCurrentPosition(success, error, config);
};
exports.default = getCurrentPosition;
