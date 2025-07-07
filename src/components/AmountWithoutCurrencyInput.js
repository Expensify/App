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
var useLocalize_1 = require("@hooks/useLocalize");
var MoneyRequestUtils_1 = require("@libs/MoneyRequestUtils");
var CONST_1 = require("@src/CONST");
var TextInput_1 = require("./TextInput");
function AmountWithoutCurrencyInput(_a, ref) {
    var amount = _a.value, _b = _a.shouldAllowNegative, shouldAllowNegative = _b === void 0 ? false : _b, inputID = _a.inputID, name = _a.name, defaultValue = _a.defaultValue, accessibilityLabel = _a.accessibilityLabel, role = _a.role, label = _a.label, onInputChange = _a.onInputChange, rest = __rest(_a, ["value", "shouldAllowNegative", "inputID", "name", "defaultValue", "accessibilityLabel", "role", "label", "onInputChange"]);
    var toLocaleDigit = (0, useLocalize_1.default)().toLocaleDigit;
    var separator = (0, react_1.useMemo)(function () {
        return (0, MoneyRequestUtils_1.replaceAllDigits)('1.1', toLocaleDigit)
            .split('')
            .filter(function (char) { return char !== '1'; })
            .join('');
    }, [toLocaleDigit]);
    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param newAmount - Changed amount from user input
     */
    var setNewAmount = (0, react_1.useCallback)(function (newAmount) {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        var newAmountWithoutSpaces = (0, MoneyRequestUtils_1.stripSpacesFromAmount)(newAmount);
        var replacedCommasAmount = (0, MoneyRequestUtils_1.replaceCommasWithPeriod)(newAmountWithoutSpaces);
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(replacedCommasAmount);
    }, [onInputChange]);
    return (<TextInput_1.default inputID={inputID} name={name} label={label} onChangeText={setNewAmount} defaultValue={defaultValue} accessibilityLabel={accessibilityLabel} role={role} ref={ref} keyboardType={!shouldAllowNegative ? CONST_1.default.KEYBOARD_TYPE.DECIMAL_PAD : undefined} type="mask" mask={"[09999999]".concat(separator, "[09]")} allowedKeys="0123456789.," validationRegex={'^(?!.*[.,].*[.,])\\d{0,8}(?:[.,]\\d{0,2})?$'} 
    // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
    // See https://github.com/Expensify/App/issues/51868 for more information
    autoCapitalize="words" 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>);
}
AmountWithoutCurrencyInput.displayName = 'AmountWithoutCurrencyForm';
exports.default = react_1.default.forwardRef(AmountWithoutCurrencyInput);
