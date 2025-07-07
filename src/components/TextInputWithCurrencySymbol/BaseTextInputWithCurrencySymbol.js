"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AmountTextInput_1 = require("@components/AmountTextInput");
var CurrencySymbolButton_1 = require("@components/CurrencySymbolButton");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var MoneyRequestUtils_1 = require("@libs/MoneyRequestUtils");
function BaseTextInputWithCurrencySymbol(_a, ref) {
    var selectedCurrencyCode = _a.selectedCurrencyCode, _b = _a.onCurrencyButtonPress, onCurrencyButtonPress = _b === void 0 ? function () { } : _b, _c = _a.onChangeAmount, onChangeAmount = _c === void 0 ? function () { } : _c, formattedAmount = _a.formattedAmount, placeholder = _a.placeholder, selection = _a.selection, _d = _a.onSelectionChange, onSelectionChange = _d === void 0 ? function () { } : _d, _e = _a.onKeyPress, onKeyPress = _e === void 0 ? function () { } : _e, _f = _a.isCurrencyPressable, isCurrencyPressable = _f === void 0 ? true : _f, _g = _a.hideCurrencySymbol, hideCurrencySymbol = _g === void 0 ? false : _g, extraSymbol = _a.extraSymbol, _h = _a.isNegative, isNegative = _h === void 0 ? false : _h, style = _a.style, rest = __rest(_a, ["selectedCurrencyCode", "onCurrencyButtonPress", "onChangeAmount", "formattedAmount", "placeholder", "selection", "onSelectionChange", "onKeyPress", "isCurrencyPressable", "hideCurrencySymbol", "extraSymbol", "isNegative", "style"]);
    var fromLocaleDigit = (0, useLocalize_1.default)().fromLocaleDigit;
    var currencySymbol = (0, CurrencyUtils_1.getLocalizedCurrencySymbol)(selectedCurrencyCode);
    var styles = (0, useThemeStyles_1.default)();
    /**
     * Set a new amount value properly formatted
     *
     * @param text - Changed text from user input
     */
    var setFormattedAmount = function (text) {
        var newAmount = (0, MoneyRequestUtils_1.addLeadingZero)((0, MoneyRequestUtils_1.replaceAllDigits)(text, fromLocaleDigit));
        onChangeAmount(newAmount);
    };
    var negativeSymbol = <Text_1.default style={[styles.iouAmountText]}>-</Text_1.default>;
    return (<>
            {isNegative && negativeSymbol}
            {!hideCurrencySymbol && (<CurrencySymbolButton_1.default currencySymbol={currencySymbol !== null && currencySymbol !== void 0 ? currencySymbol : ''} onCurrencyButtonPress={onCurrencyButtonPress} isCurrencyPressable={isCurrencyPressable}/>)}
            <AmountTextInput_1.default formattedAmount={formattedAmount} onChangeAmount={setFormattedAmount} placeholder={placeholder} ref={ref} selection={selection} onSelectionChange={function (event) {
            onSelectionChange(event);
        }} onKeyPress={onKeyPress} style={[styles.pr1, style]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>
            {extraSymbol}
        </>);
}
BaseTextInputWithCurrencySymbol.displayName = 'BaseTextInputWithCurrencySymbol';
exports.default = react_1.default.forwardRef(BaseTextInputWithCurrencySymbol);
