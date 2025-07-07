"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = processReportIDDeeplink;
var getReportIDFromUrl_1 = require("./getReportIDFromUrl");
function processReportIDDeeplink(url) {
    return (0, getReportIDFromUrl_1.default)(url);
}
