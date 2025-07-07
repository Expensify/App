"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleFileRetry;
var IOU = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
function handleFileRetry(message, file, dismissError, setShouldShowErrorModal) {
    var retryParams = typeof message.retryParams === 'string'
        ? JSON.parse(message.retryParams)
        : message.retryParams;
    switch (message.action) {
        case CONST_1.default.IOU.ACTION_PARAMS.REPLACE_RECEIPT: {
            dismissError();
            var replaceReceiptParams = __assign({}, retryParams);
            replaceReceiptParams.file = file;
            IOU.replaceReceipt(replaceReceiptParams);
            break;
        }
        case CONST_1.default.IOU.ACTION_PARAMS.START_SPLIT_BILL: {
            dismissError();
            var startSplitBillParams = __assign({}, retryParams);
            startSplitBillParams.receipt = file;
            startSplitBillParams.shouldPlaySound = false;
            IOU.startSplitBill(startSplitBillParams);
            break;
        }
        case CONST_1.default.IOU.ACTION_PARAMS.TRACK_EXPENSE: {
            dismissError();
            var trackExpenseParams = __assign({}, retryParams);
            trackExpenseParams.transactionParams.receipt = file;
            trackExpenseParams.isRetry = true;
            trackExpenseParams.shouldPlaySound = false;
            IOU.trackExpense(trackExpenseParams);
            break;
        }
        case CONST_1.default.IOU.ACTION_PARAMS.MONEY_REQUEST: {
            dismissError();
            var requestMoneyParams = __assign({}, retryParams);
            requestMoneyParams.transactionParams.receipt = file;
            requestMoneyParams.isRetry = true;
            requestMoneyParams.shouldPlaySound = false;
            IOU.requestMoney(requestMoneyParams);
            break;
        }
        default:
            setShouldShowErrorModal(true);
            break;
    }
}
