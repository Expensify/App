"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crashlytics_1 = require("@react-native-firebase/crashlytics");
var testCrash = function () {
    (0, crashlytics_1.default)().crash();
};
exports.default = testCrash;
