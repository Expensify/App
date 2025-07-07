"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewSubscriptionRenewalDate = getNewSubscriptionRenewalDate;
exports.formatSubscriptionEndDate = formatSubscriptionEndDate;
var date_fns_1 = require("date-fns");
var CONST_1 = require("@src/CONST");
function appendMidnightTime(date) {
    return "".concat(date, "T00:00:00");
}
function formatSubscriptionEndDate(date) {
    if (!date) {
        return '';
    }
    var dateWithMidnightTime = appendMidnightTime(date);
    return (0, date_fns_1.format)(new Date(dateWithMidnightTime), CONST_1.default.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);
}
function getNewSubscriptionRenewalDate() {
    return (0, date_fns_1.format)((0, date_fns_1.startOfMonth)((0, date_fns_1.addMonths)(new Date(), 12)), CONST_1.default.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);
}
