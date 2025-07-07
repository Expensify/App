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
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var getOperatingSystem_1 = require("@libs/getOperatingSystem");
var MoneyRequestUtils_1 = require("@libs/MoneyRequestUtils");
var CONST_1 = require("@src/CONST");
var BigNumberPad_1 = require("./BigNumberPad");
var FormHelpMessage_1 = require("./FormHelpMessage");
var TextInput_1 = require("./TextInput");
var isTextInputFocused_1 = require("./TextInput/BaseTextInput/isTextInputFocused");
var TextInputWithCurrencySymbol_1 = require("./TextInputWithCurrencySymbol");
/**
 * Returns the new selection object based on the updated amount's length
 */
var getNewSelection = function (oldSelection, prevLength, newLength) {
    var cursorPosition = oldSelection.end + (newLength - prevLength);
    return { start: cursorPosition, end: cursorPosition };
};
var AMOUNT_VIEW_ID = 'amountView';
var NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
var NUM_PAD_VIEW_ID = 'numPadView';
function AmountForm(_a, forwardedRef) {
    var amount = _a.value, _b = _a.currency, currency = _b === void 0 ? CONST_1.default.CURRENCY.USD : _b, _c = _a.extraDecimals, extraDecimals = _c === void 0 ? 0 : _c, amountMaxLength = _a.amountMaxLength, errorText = _a.errorText, onInputChange = _a.onInputChange, onCurrencyButtonPress = _a.onCurrencyButtonPress, _d = _a.displayAsTextInput, displayAsTextInput = _d === void 0 ? false : _d, _e = _a.isCurrencyPressable, isCurrencyPressable = _e === void 0 ? true : _e, label = _a.label, fixedDecimals = _a.fixedDecimals, rest = __rest(_a, ["value", "currency", "extraDecimals", "amountMaxLength", "errorText", "onInputChange", "onCurrencyButtonPress", "displayAsTextInput", "isCurrencyPressable", "label", "fixedDecimals"]);
    var styles = (0, useThemeStyles_1.default)();
    var _f = (0, useLocalize_1.default)(), toLocaleDigit = _f.toLocaleDigit, numberFormat = _f.numberFormat;
    var textInput = (0, react_1.useRef)(null);
    var decimals = fixedDecimals !== null && fixedDecimals !== void 0 ? fixedDecimals : (0, CurrencyUtils_1.getCurrencyDecimals)(currency) + extraDecimals;
    var currentAmount = (0, react_1.useMemo)(function () { return (typeof amount === 'string' ? amount : ''); }, [amount]);
    var _g = (0, react_1.useState)(true), shouldUpdateSelection = _g[0], setShouldUpdateSelection = _g[1];
    var _h = (0, react_1.useState)({
        start: currentAmount.length,
        end: currentAmount.length,
    }), selection = _h[0], setSelection = _h[1];
    var forwardDeletePressedRef = (0, react_1.useRef)(false);
    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     */
    var focusTextInput = function (event, ids) {
        var _a, _b;
        var relatedTargetId = (_b = (_a = event.nativeEvent) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.id;
        if (!ids.includes(relatedTargetId)) {
            return;
        }
        event.preventDefault();
        setSelection({
            start: selection.end,
            end: selection.end,
        });
        if (!textInput.current) {
            return;
        }
        if (!(0, isTextInputFocused_1.default)(textInput)) {
            textInput.current.focus();
        }
    };
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
        if (!(0, MoneyRequestUtils_1.validateAmount)(newAmountWithoutSpaces, decimals, amountMaxLength)) {
            setSelection(function (prevSelection) { return (__assign({}, prevSelection)); });
            return;
        }
        var strippedAmount = (0, MoneyRequestUtils_1.stripCommaFromAmount)(newAmountWithoutSpaces);
        var isForwardDelete = currentAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
        setSelection(getNewSelection(selection, isForwardDelete ? strippedAmount.length : currentAmount.length, strippedAmount.length));
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(strippedAmount);
    }, [amountMaxLength, currentAmount, decimals, onInputChange, selection]);
    /**
     * Set a new amount value properly formatted
     *
     * @param text - Changed text from user input
     */
    var setFormattedAmount = function (text) {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        var newAmountWithoutSpaces = (0, MoneyRequestUtils_1.stripSpacesFromAmount)(text);
        var replacedCommasAmount = (0, MoneyRequestUtils_1.replaceCommasWithPeriod)(newAmountWithoutSpaces);
        var withLeadingZero = (0, MoneyRequestUtils_1.addLeadingZero)(replacedCommasAmount);
        if (!(0, MoneyRequestUtils_1.validateAmount)(withLeadingZero, decimals, amountMaxLength)) {
            setSelection(function (prevSelection) { return (__assign({}, prevSelection)); });
            return;
        }
        var strippedAmount = (0, MoneyRequestUtils_1.stripCommaFromAmount)(withLeadingZero);
        var isForwardDelete = currentAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
        setSelection(getNewSelection(selection, isForwardDelete ? strippedAmount.length : currentAmount.length, strippedAmount.length));
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(strippedAmount);
    };
    // Modifies the amount to match the decimals for changed currency.
    (0, react_1.useEffect)(function () {
        // If the changed currency supports decimals, we can return
        if ((0, MoneyRequestUtils_1.validateAmount)(currentAmount, decimals, amountMaxLength)) {
            return;
        }
        // If the changed currency doesn't support decimals, we can strip the decimals
        setNewAmount((0, MoneyRequestUtils_1.stripDecimalsFromAmount)(currentAmount));
        // we want to update only when decimals change (setNewAmount also changes when decimals change).
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [decimals]);
    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     */
    var updateAmountNumberPad = (0, react_1.useCallback)(function (key) {
        var _a;
        if (shouldUpdateSelection && !(0, isTextInputFocused_1.default)(textInput)) {
            (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (currentAmount.length > 0) {
                var selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                var newAmount_1 = "".concat(currentAmount.substring(0, selectionStart)).concat(currentAmount.substring(selection.end));
                setNewAmount((0, MoneyRequestUtils_1.addLeadingZero)(newAmount_1));
            }
            return;
        }
        var newAmount = (0, MoneyRequestUtils_1.addLeadingZero)("".concat(currentAmount.substring(0, selection.start)).concat(key).concat(currentAmount.substring(selection.end)));
        setNewAmount(newAmount);
    }, [currentAmount, selection, shouldUpdateSelection, setNewAmount]);
    /**
     * Update long press value, to remove items pressing on <
     *
     * @param value - Changed text from user input
     */
    var updateLongPressHandlerState = (0, react_1.useCallback)(function (value) {
        var _a;
        setShouldUpdateSelection(!value);
        if (!value && !(0, isTextInputFocused_1.default)(textInput)) {
            (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }, []);
    /**
     * Input handler to check for a forward-delete key (or keyboard shortcut) press.
     */
    var textInputKeyPress = function (event) {
        var key = event.nativeEvent.key.toLowerCase();
        if ((0, Browser_1.isMobileSafari)() && key === CONST_1.default.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac Accessibility keyboard is being
            // used for input). If the Control-D shortcut doesn't get sent, the ref will still be reset on the next key press.
            forwardDeletePressedRef.current = true;
            return;
        }
        // Control-D on Mac is a keyboard shortcut for forward-delete. See https://support.apple.com/en-us/HT201236 for Mac keyboard shortcuts.
        // Also check for the keyboard shortcut on iOS in cases where a hardware keyboard may be connected to the device.
        var operatingSystem = (0, getOperatingSystem_1.default)();
        var allowedOS = [CONST_1.default.OS.MAC_OS, CONST_1.default.OS.IOS];
        forwardDeletePressedRef.current = key === 'delete' || (allowedOS.includes(operatingSystem !== null && operatingSystem !== void 0 ? operatingSystem : '') && event.nativeEvent.ctrlKey && key === 'd');
    };
    var formattedAmount = (0, MoneyRequestUtils_1.replaceAllDigits)(currentAmount, toLocaleDigit);
    var canUseTouchScreen = (0, DeviceCapabilities_1.canUseTouchScreen)();
    if (displayAsTextInput) {
        return (<TextInput_1.default label={label} value={formattedAmount} onChangeText={setFormattedAmount} ref={function (ref) {
                if (typeof forwardedRef === 'function') {
                    forwardedRef(ref);
                }
                else if (forwardedRef && 'current' in forwardedRef) {
                    // eslint-disable-next-line no-param-reassign
                    forwardedRef.current = ref;
                }
                textInput.current = ref;
            }} prefixCharacter={currency} prefixStyle={styles.colorMuted} keyboardType={CONST_1.default.KEYBOARD_TYPE.DECIMAL_PAD} 
        // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
        // See https://github.com/Expensify/App/issues/51868 for more information
        autoCapitalize="words" inputMode={CONST_1.default.INPUT_MODE.DECIMAL} errorText={errorText} 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}/>);
    }
    return (<>
            <react_native_1.View id={AMOUNT_VIEW_ID} onMouseDown={function (event) { return focusTextInput(event, [AMOUNT_VIEW_ID]); }} style={[styles.moneyRequestAmountContainer, styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <TextInputWithCurrencySymbol_1.default formattedAmount={formattedAmount} onChangeAmount={setNewAmount} onCurrencyButtonPress={onCurrencyButtonPress} placeholder={numberFormat(0)} ref={function (ref) {
            if (typeof forwardedRef === 'function') {
                forwardedRef(ref);
            }
            else if (forwardedRef && 'current' in forwardedRef) {
                // eslint-disable-next-line no-param-reassign
                forwardedRef.current = ref;
            }
            textInput.current = ref;
        }} selectedCurrencyCode={currency} selection={selection} onSelectionChange={function (start, end) {
            if (!shouldUpdateSelection) {
                return;
            }
            setSelection({ start: start, end: end });
        }} onKeyPress={textInputKeyPress} isCurrencyPressable={isCurrencyPressable} style={[styles.iouAmountTextInput]} containerStyle={[styles.iouAmountTextInputContainer]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>
                {!!errorText && (<FormHelpMessage_1.default style={[styles.pAbsolute, styles.b0, canUseTouchScreen ? styles.mb0 : styles.mb3, styles.ph5, styles.w100]} isError message={errorText}/>)}
            </react_native_1.View>
            {canUseTouchScreen ? (<react_native_1.View onMouseDown={function (event) { return focusTextInput(event, [NUM_PAD_CONTAINER_VIEW_ID, NUM_PAD_VIEW_ID]); }} style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pt0]} id={NUM_PAD_CONTAINER_VIEW_ID}>
                    <BigNumberPad_1.default id={NUM_PAD_VIEW_ID} numberPressed={updateAmountNumberPad} longPressHandlerStateChanged={updateLongPressHandlerState}/>
                </react_native_1.View>) : null}
        </>);
}
AmountForm.displayName = 'AmountForm';
exports.default = (0, react_1.forwardRef)(AmountForm);
