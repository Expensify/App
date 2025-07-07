"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils = require("@libs/CurrencyUtils");
var Text_1 = require("./Text");
function Balance(_a) {
    var textStyles = _a.textStyles, balance = _a.balance;
    var styles = (0, useThemeStyles_1.default)();
    var formattedBalance = CurrencyUtils.convertToDisplayString(balance);
    return <Text_1.default style={[styles.textHeadline, styles.textXXXLarge, textStyles]}>{formattedBalance}</Text_1.default>;
}
Balance.displayName = 'Balance';
exports.default = Balance;
