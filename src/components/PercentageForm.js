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
function PercentageForm(_a, forwardedRef) {
    var amount = _a.value, errorText = _a.errorText, onInputChange = _a.onInputChange, label = _a.label, rest = __rest(_a, ["value", "errorText", "onInputChange", "label"]);
    var _b = (0, useLocalize_1.default)(), toLocaleDigit = _b.toLocaleDigit, numberFormat = _b.numberFormat;
    var textInput = (0, react_1.useRef)(null);
    var currentAmount = (0, react_1.useMemo)(function () { return (typeof amount === 'string' ? amount : ''); }, [amount]);
    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param newAmount - Changed amount from user input
     */
    var setNewAmount = (0, react_1.useCallback)(function (newAmount) {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        var newAmountWithoutSpaces = (0, MoneyRequestUtils_1.stripSpacesFromAmount)(newAmount);
        // Use a shallow copy of selection to trigger setSelection
        // More info: https://github.com/Expensify/App/issues/16385
        if (!(0, MoneyRequestUtils_1.validatePercentage)(newAmountWithoutSpaces)) {
            return;
        }
        var strippedAmount = (0, MoneyRequestUtils_1.stripCommaFromAmount)(newAmountWithoutSpaces);
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(strippedAmount);
    }, [onInputChange]);
    var formattedAmount = (0, MoneyRequestUtils_1.replaceAllDigits)(currentAmount, toLocaleDigit);
    return (<TextInput_1.default label={label} value={formattedAmount} onChangeText={setNewAmount} placeholder={numberFormat(0)} ref={function (ref) {
            if (typeof forwardedRef === 'function') {
                forwardedRef(ref);
            }
            else if (forwardedRef && 'current' in forwardedRef) {
                // eslint-disable-next-line no-param-reassign
                forwardedRef.current = ref;
            }
            textInput.current = ref;
        }} suffixCharacter="%" keyboardType={CONST_1.default.KEYBOARD_TYPE.DECIMAL_PAD} 
    // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
    // See https://github.com/Expensify/App/issues/51868 for more information
    autoCapitalize="words" 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>);
}
PercentageForm.displayName = 'PercentageForm';
exports.default = (0, react_1.forwardRef)(PercentageForm);
