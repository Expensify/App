"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
// If the transaction is cash, it has the type CONST.EXPENSE.TYPE.CASH_CARD_NAME.
// If there is no credit card name, it means it couldn't be a card transaction,
// so we assume it's cash. Any other type is treated as a card transaction.
// same in getTypeText
var getType = function (cardName) {
    if (!cardName || cardName.includes(CONST_1.default.EXPENSE.TYPE.CASH_CARD_NAME)) {
        return CONST_1.default.SEARCH.TRANSACTION_TYPE.CASH;
    }
    return CONST_1.default.SEARCH.TRANSACTION_TYPE.CARD;
};
var getTypeIcon = function (type) {
    switch (type) {
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.CARD:
            return Expensicons.CreditCard;
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return Expensicons.Car;
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.CASH:
        default:
            return Expensicons.Cash;
    }
};
var getTypeText = function (type) {
    switch (type) {
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.CARD:
            return 'iou.card';
        case CONST_1.default.SEARCH.TRANSACTION_TYPE.CASH:
        default:
            return 'iou.cash';
    }
};
function TypeCell(_a) {
    var _b;
    var transactionItem = _a.transactionItem, shouldUseNarrowLayout = _a.shouldUseNarrowLayout, shouldShowTooltip = _a.shouldShowTooltip;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var type = (_b = transactionItem.transactionType) !== null && _b !== void 0 ? _b : getType(transactionItem.cardName);
    var isPendingExpensifyCardTransaction = (0, TransactionUtils_1.isExpensifyCardTransaction)(transactionItem) && (0, TransactionUtils_1.isPending)(transactionItem);
    var typeIcon = isPendingExpensifyCardTransaction ? Expensicons.CreditCardHourglass : getTypeIcon(type);
    var typeText = isPendingExpensifyCardTransaction ? 'iou.pending' : getTypeText(type);
    var styles = (0, useThemeStyles_1.default)();
    return shouldUseNarrowLayout ? (<TextWithTooltip_1.default shouldShowTooltip={shouldShowTooltip} text={translate(typeText)} style={[styles.textMicroSupporting, styles.pre, styles.justifyContentCenter]}/>) : (<Icon_1.default src={typeIcon} fill={theme.icon} height={20} width={20}/>);
}
TypeCell.displayName = 'TypeCell';
exports.default = TypeCell;
