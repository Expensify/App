"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
function TaxCell(_a) {
    var transactionItem = _a.transactionItem, shouldShowTooltip = _a.shouldShowTooltip;
    var styles = (0, useThemeStyles_1.default)();
    var taxAmount = (0, TransactionUtils_1.getTaxAmount)(transactionItem, true);
    var currency = (0, TransactionUtils_1.getCurrency)(transactionItem);
    return (<TextWithTooltip_1.default shouldShowTooltip={shouldShowTooltip} text={(0, CurrencyUtils_1.convertToDisplayString)(taxAmount, currency)} style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, styles.textAlignRight]}/>);
}
TaxCell.displayName = 'TaxCell';
exports.default = TaxCell;
