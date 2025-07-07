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
var useLocalize_1 = require("@hooks/useLocalize");
var useMouseContext_1 = require("@hooks/useMouseContext");
var Browser_1 = require("@libs/Browser");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var getOperatingSystem_1 = require("@libs/getOperatingSystem");
var MoneyRequestUtils_1 = require("@libs/MoneyRequestUtils");
var shouldIgnoreSelectionWhenUpdatedManually_1 = require("@libs/shouldIgnoreSelectionWhenUpdatedManually");
var CONST_1 = require("@src/CONST");
var isTextInputFocused_1 = require("./TextInput/BaseTextInput/isTextInputFocused");
var TextInputWithCurrencySymbol_1 = require("./TextInputWithCurrencySymbol");
/**
 * Returns the new selection object based on the updated amount's length
 */
var getNewSelection = function (oldSelection, prevLength, newLength) {
    var cursorPosition = oldSelection.end + (newLength - prevLength);
    return { start: cursorPosition, end: cursorPosition };
};
var defaultOnFormatAmount = function (amount, currency) { return (0, CurrencyUtils_1.convertToFrontendAmountAsString)(amount, currency !== null && currency !== void 0 ? currency : CONST_1.default.CURRENCY.USD); };
function MoneyRequestAmountInput(_a, forwardedRef) {
    var _b = _a.amount, amount = _b === void 0 ? 0 : _b, _c = _a.currency, currency = _c === void 0 ? CONST_1.default.CURRENCY.USD : _c, _d = _a.isCurrencyPressable, isCurrencyPressable = _d === void 0 ? true : _d, onCurrencyButtonPress = _a.onCurrencyButtonPress, onAmountChange = _a.onAmountChange, _e = _a.prefixCharacter, prefixCharacter = _e === void 0 ? '' : _e, _f = _a.hideCurrencySymbol, hideCurrencySymbol = _f === void 0 ? false : _f, _g = _a.shouldUpdateSelection, shouldUpdateSelection = _g === void 0 ? true : _g, moneyRequestAmountInputRef = _a.moneyRequestAmountInputRef, _h = _a.disableKeyboard, disableKeyboard = _h === void 0 ? true : _h, _j = _a.onFormatAmount, onFormatAmount = _j === void 0 ? defaultOnFormatAmount : _j, formatAmountOnBlur = _a.formatAmountOnBlur, maxLength = _a.maxLength, _k = _a.hideFocusedState, hideFocusedState = _k === void 0 ? true : _k, _l = _a.shouldKeepUserInput, shouldKeepUserInput = _l === void 0 ? false : _l, _m = _a.autoGrow, autoGrow = _m === void 0 ? true : _m, autoGrowExtraSpace = _a.autoGrowExtraSpace, contentWidth = _a.contentWidth, _o = _a.isNegative, isNegative = _o === void 0 ? false : _o, _p = _a.allowFlippingAmount, allowFlippingAmount = _p === void 0 ? false : _p, toggleNegative = _a.toggleNegative, clearNegative = _a.clearNegative, testID = _a.testID, submitBehavior = _a.submitBehavior, _q = _a.shouldApplyPaddingToContainer, shouldApplyPaddingToContainer = _q === void 0 ? false : _q, props = __rest(_a, ["amount", "currency", "isCurrencyPressable", "onCurrencyButtonPress", "onAmountChange", "prefixCharacter", "hideCurrencySymbol", "shouldUpdateSelection", "moneyRequestAmountInputRef", "disableKeyboard", "onFormatAmount", "formatAmountOnBlur", "maxLength", "hideFocusedState", "shouldKeepUserInput", "autoGrow", "autoGrowExtraSpace", "contentWidth", "isNegative", "allowFlippingAmount", "toggleNegative", "clearNegative", "testID", "submitBehavior", "shouldApplyPaddingToContainer"]);
    var _r = (0, useLocalize_1.default)(), toLocaleDigit = _r.toLocaleDigit, numberFormat = _r.numberFormat;
    var textInput = (0, react_1.useRef)(null);
    var amountRef = (0, react_1.useRef)(undefined);
    var decimals = (0, CurrencyUtils_1.getCurrencyDecimals)(currency);
    var selectedAmountAsString = amount ? onFormatAmount(amount, currency) : '';
    var _s = (0, react_1.useState)(selectedAmountAsString), currentAmount = _s[0], setCurrentAmount = _s[1];
    var _t = (0, react_1.useState)({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    }), selection = _t[0], setSelection = _t[1];
    var forwardDeletePressedRef = (0, react_1.useRef)(false);
    // The ref is used to ignore any onSelectionChange event that happens while we are updating the selection manually in setNewAmount
    var willSelectionBeUpdatedManually = (0, react_1.useRef)(false);
    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param {String} newAmount - Changed amount from user input
     */
    var setNewAmount = (0, react_1.useCallback)(function (newAmount) {
        if (allowFlippingAmount && newAmount.startsWith('-') && toggleNegative) {
            toggleNegative();
        }
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        var newAmountWithoutSpaces = (0, MoneyRequestUtils_1.stripSpacesFromAmount)(newAmount);
        var finalAmount = newAmountWithoutSpaces.includes('.') ? (0, MoneyRequestUtils_1.stripCommaFromAmount)(newAmountWithoutSpaces) : (0, MoneyRequestUtils_1.replaceCommasWithPeriod)(newAmountWithoutSpaces);
        // Use a shallow copy of selection to trigger setSelection
        // More info: https://github.com/Expensify/App/issues/16385
        if (!(0, MoneyRequestUtils_1.validateAmount)(finalAmount, decimals)) {
            setSelection(function (prevSelection) { return (__assign({}, prevSelection)); });
            return;
        }
        // setCurrentAmount contains another setState(setSelection) making it error-prone since it is leading to setSelection being called twice for a single setCurrentAmount call. This solution introducing the hasSelectionBeenSet flag was chosen for its simplicity and lower risk of future errors https://github.com/Expensify/App/issues/23300#issuecomment-1766314724.
        willSelectionBeUpdatedManually.current = true;
        var hasSelectionBeenSet = false;
        var strippedAmount = (0, MoneyRequestUtils_1.stripCommaFromAmount)(finalAmount);
        amountRef.current = strippedAmount;
        setCurrentAmount(function (prevAmount) {
            var isForwardDelete = prevAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
            if (!hasSelectionBeenSet) {
                hasSelectionBeenSet = true;
                setSelection(function (prevSelection) { return getNewSelection(prevSelection, isForwardDelete ? strippedAmount.length : prevAmount.length, strippedAmount.length); });
                willSelectionBeUpdatedManually.current = false;
            }
            onAmountChange === null || onAmountChange === void 0 ? void 0 : onAmountChange(strippedAmount);
            return strippedAmount;
        });
    }, [allowFlippingAmount, decimals, onAmountChange, toggleNegative]);
    (0, react_1.useImperativeHandle)(moneyRequestAmountInputRef, function () { return ({
        setNewAmount: function (amountValue) {
            setNewAmount(amountValue);
        },
        changeSelection: function (newSelection) {
            setSelection(newSelection);
        },
        changeAmount: function (newAmount) {
            setCurrentAmount(newAmount);
        },
        getAmount: function () {
            return currentAmount;
        },
        getSelection: function () {
            return selection;
        },
    }); });
    (0, react_1.useEffect)(function () {
        var _a;
        if ((_a = (!currency || typeof amount !== 'number' || (formatAmountOnBlur && (0, isTextInputFocused_1.default)(textInput)))) !== null && _a !== void 0 ? _a : shouldKeepUserInput) {
            return;
        }
        var frontendAmount = onFormatAmount(amount, currency);
        setCurrentAmount(frontendAmount);
        // Only update selection if the amount prop was changed from the outside and is not the same as the current amount we just computed
        // In the line below the currentAmount is not immediately updated, it should still hold the previous value.
        if (frontendAmount !== currentAmount) {
            setSelection({
                start: frontendAmount.length,
                end: frontendAmount.length,
            });
        }
        // we want to re-initialize the state only when the amount changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [amount, shouldKeepUserInput]);
    // Modifies the amount to match the decimals for changed currency.
    (0, react_1.useEffect)(function () {
        // If the changed currency supports decimals, we can return
        if ((0, MoneyRequestUtils_1.validateAmount)(currentAmount, decimals)) {
            return;
        }
        // If the changed currency doesn't support decimals, we can strip the decimals
        setNewAmount((0, MoneyRequestUtils_1.stripDecimalsFromAmount)(currentAmount));
        // we want to update only when decimals change (setNewAmount also changes when decimals change).
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [setNewAmount]);
    /**
     * Input handler to check for a forward-delete key (or keyboard shortcut) press.
     */
    var textInputKeyPress = function (_a) {
        var _b;
        var nativeEvent = _a.nativeEvent;
        var key = nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.key.toLowerCase();
        if (!((_b = textInput.current) === null || _b === void 0 ? void 0 : _b.value) && key === 'backspace' && isNegative) {
            clearNegative === null || clearNegative === void 0 ? void 0 : clearNegative();
        }
        if ((0, Browser_1.isMobileSafari)() && key === CONST_1.default.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac accessibility keyboard is being
            // used for input). If the Control-D shortcut doesn't get sent, the ref will still be reset on the next key press.
            forwardDeletePressedRef.current = true;
            return;
        }
        // Control-D on Mac is a keyboard shortcut for forward-delete. See https://support.apple.com/en-us/HT201236 for Mac keyboard shortcuts.
        // Also check for the keyboard shortcut on iOS in cases where a hardware keyboard may be connected to the device.
        var operatingSystem = (0, getOperatingSystem_1.default)();
        forwardDeletePressedRef.current = key === 'delete' || ((operatingSystem === CONST_1.default.OS.MAC_OS || operatingSystem === CONST_1.default.OS.IOS) && (nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.ctrlKey) && key === 'd');
    };
    var formatAmount = (0, react_1.useCallback)(function () {
        if (!formatAmountOnBlur) {
            return;
        }
        var formattedAmount = onFormatAmount(amount, currency);
        if (maxLength && formattedAmount.length > maxLength) {
            return;
        }
        setCurrentAmount(formattedAmount);
        setSelection({
            start: formattedAmount.length,
            end: formattedAmount.length,
        });
    }, [amount, currency, onFormatAmount, formatAmountOnBlur, maxLength]);
    var formattedAmount = (0, MoneyRequestUtils_1.replaceAllDigits)(currentAmount, toLocaleDigit);
    var _u = (0, useMouseContext_1.useMouseContext)(), setMouseDown = _u.setMouseDown, setMouseUp = _u.setMouseUp;
    var handleMouseDown = function (e) {
        e.stopPropagation();
        setMouseDown();
    };
    var handleMouseUp = function (e) {
        e.stopPropagation();
        setMouseUp();
    };
    return (<TextInputWithCurrencySymbol_1.default autoGrow={autoGrow} autoGrowExtraSpace={autoGrowExtraSpace} disableKeyboard={disableKeyboard} formattedAmount={formattedAmount} onChangeAmount={setNewAmount} onCurrencyButtonPress={onCurrencyButtonPress} onBlur={formatAmount} placeholder={numberFormat(0)} ref={function (ref) {
            if (typeof forwardedRef === 'function') {
                forwardedRef(ref);
            }
            else if (forwardedRef === null || forwardedRef === void 0 ? void 0 : forwardedRef.current) {
                // eslint-disable-next-line no-param-reassign
                forwardedRef.current = ref;
            }
            // eslint-disable-next-line react-compiler/react-compiler
            textInput.current = ref;
        }} selectedCurrencyCode={currency} selection={selection} onSelectionChange={function (selectionStart, selectionEnd) {
            var _a, _b;
            if (shouldIgnoreSelectionWhenUpdatedManually_1.default && willSelectionBeUpdatedManually.current) {
                willSelectionBeUpdatedManually.current = false;
                return;
            }
            if (!shouldUpdateSelection) {
                return;
            }
            // When the amount is updated in setNewAmount on iOS, in onSelectionChange formattedAmount stores the value before the update. Using amountRef allows us to read the updated value
            var maxSelection = (_b = (_a = amountRef.current) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : formattedAmount.length;
            amountRef.current = undefined;
            var start = Math.min(selectionStart, maxSelection);
            var end = Math.min(selectionEnd, maxSelection);
            setSelection({ start: start, end: end });
        }} onKeyPress={textInputKeyPress} hideCurrencySymbol={hideCurrencySymbol} prefixCharacter={prefixCharacter} isCurrencyPressable={isCurrencyPressable} style={props.inputStyle} containerStyle={props.containerStyle} prefixStyle={props.prefixStyle} prefixContainerStyle={props.prefixContainerStyle} touchableInputWrapperStyle={props.touchableInputWrapperStyle} maxLength={maxLength} hideFocusedState={hideFocusedState} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} contentWidth={contentWidth} isNegative={isNegative} testID={testID} submitBehavior={submitBehavior} shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}/>);
}
MoneyRequestAmountInput.displayName = 'MoneyRequestAmountInput';
exports.default = react_1.default.forwardRef(MoneyRequestAmountInput);
