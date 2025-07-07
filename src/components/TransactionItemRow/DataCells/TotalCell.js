"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
function TotalCell(_a) {
    var _b;
    var shouldShowTooltip = _a.shouldShowTooltip, transactionItem = _a.transactionItem;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currency = (0, TransactionUtils_1.getCurrency)(transactionItem);
    var amount = (_b = (0, ReportUtils_1.getTransactionDetails)(transactionItem)) === null || _b === void 0 ? void 0 : _b.amount;
    var amountToDisplay = (0, CurrencyUtils_1.convertToDisplayString)(amount, currency);
    if ((0, TransactionUtils_1.isScanning)(transactionItem)) {
        amountToDisplay = translate('iou.receiptStatusTitle');
    }
    return (<TextWithTooltip_1.default shouldShowTooltip={shouldShowTooltip} text={amountToDisplay} style={[styles.optionDisplayName, styles.justifyContentCenter, styles.flexShrink0]}/>);
}
TotalCell.displayName = 'TotalCell';
exports.default = TotalCell;
