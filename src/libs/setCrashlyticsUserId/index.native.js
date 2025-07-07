"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crashlytics_1 = require("@react-native-firebase/crashlytics");
var setCrashlyticsUserId = function (accountID) {
    (0, crashlytics_1.default)().setUserId(accountID.toString());
};
exports.default = setCrashlyticsUserId;
