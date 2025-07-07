"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useTransactionViolations(transactionID) {
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), {
        canBeMissing: true,
    })[0];
    var _a = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID), {
        canBeMissing: true,
    })[0], transactionViolations = _a === void 0 ? [] : _a;
    return (0, react_1.useMemo)(function () { return transactionViolations.filter(function (violation) { return !(0, TransactionUtils_1.isViolationDismissed)(transaction, violation); }); }, [transaction, transactionViolations]);
}
exports.default = useTransactionViolations;
