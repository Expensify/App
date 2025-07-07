"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Expensicons = require("@components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var getIconForAction = function (actionType) {
    switch (actionType) {
        case CONST_1.default.IOU.TYPE.TRACK:
            return Expensicons.Coins;
        case CONST_1.default.IOU.TYPE.REQUEST:
            return Expensicons.Receipt;
        case CONST_1.default.IOU.TYPE.SEND:
            return Expensicons.Cash;
        case CONST_1.default.IOU.TYPE.SPLIT:
            return Expensicons.Transfer;
        case CONST_1.default.IOU.TYPE.CREATE:
            return Expensicons.Receipt;
        default:
            return Expensicons.MoneyCircle;
    }
};
exports.default = getIconForAction;
