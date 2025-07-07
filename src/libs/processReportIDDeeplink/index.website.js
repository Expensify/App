"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = processReportIDDeeplink;
var CONST_1 = require("@src/CONST");
var getReportIDFromUrl_1 = require("./getReportIDFromUrl");
function processReportIDDeeplink(url) {
    var prevUrl = sessionStorage.getItem(CONST_1.default.SESSION_STORAGE_KEYS.INITIAL_URL);
    var prevReportID = (0, getReportIDFromUrl_1.default)(prevUrl !== null && prevUrl !== void 0 ? prevUrl : '');
    var currentReportID = (0, getReportIDFromUrl_1.default)(url);
    if (currentReportID && url) {
        sessionStorage.setItem(CONST_1.default.SESSION_STORAGE_KEYS.INITIAL_URL, url);
    }
    return currentReportID || prevReportID;
}
