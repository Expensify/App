"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
var navigateFromNotification = function (reportID) {
    Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
};
exports.default = navigateFromNotification;
