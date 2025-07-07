"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DateUtils_1 = require("@libs/DateUtils");
var index_1 = require("./index");
function shouldShowTransactionYear(transaction) {
    var date = (0, index_1.getCreated)(transaction);
    return DateUtils_1.default.doesDateBelongToAPastYear(date);
}
exports.default = shouldShowTransactionYear;
