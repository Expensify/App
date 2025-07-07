"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function getListOptionsFromCorpayPicklist(corpayPicklist) {
    if (!corpayPicklist) {
        return {};
    }
    return corpayPicklist.reduce(function (accumulator, currentValue) {
        if (currentValue.stringValue === CONST_1.default.NON_USD_BANK_ACCOUNT.CORPAY_UNDEFINED_OPTION_VALUE) {
            return accumulator;
        }
        accumulator[currentValue.name] = currentValue.stringValue;
        return accumulator;
    }, {});
}
exports.default = getListOptionsFromCorpayPicklist;
