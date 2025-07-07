"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@react-navigation/core");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BigNumberPad_1 = require("@components/BigNumberPad");
var Button_1 = require("@components/Button");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var Expensicons = require("@components/Icon/Expensicons");
var MoneyRequestAmountInput_1 = require("@components/MoneyRequestAmountInput");
var ScrollView_1 = require("@components/ScrollView");
var SettlementButton_1 = require("@components/SettlementButton");
var isTextInputFocused_1 = require("@components/TextInput/BaseTextInput/isTextInputFocused");
var useLocalize_1 = require("@hooks/useLocalize");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var MoneyRequestUtils_1 = require("@libs/MoneyRequestUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var isAmountInvalid = function (amount) { return !amount.length || parseFloat(amount) < 0.01; };
var isTaxAmountInvalid = function (currentAmount, taxAmount, isTaxAmountForm, currency) {
    return isTaxAmountForm && Number.parseFloat(currentAmount) > (0, CurrencyUtils_1.convertToFrontendAmountAsInteger)(Math.abs(taxAmount), currency);
};
var AMOUNT_VIEW_ID = 'amountView';
var NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
var NUM_PAD_VIEW_ID = 'numPadView';
function MoneyRequestAmountForm(_a, forwardedRef) {
    var _b = _a.amount, amount = _b === void 0 ? 0 : _b, _c = _a.taxAmount, taxAmount = _c === void 0 ? 0 : _c, _d = _a.currency, currency = _d === void 0 ? CONST_1.default.CURRENCY.USD : _d, _e = _a.isCurrencyPressable, isCurrencyPressable = _e === void 0 ? true : _e, _f = _a.isEditing, isEditing = _f === void 0 ? false : _f, _g = _a.skipConfirmation, skipConfirmation = _g === void 0 ? false : _g, _h = _a.iouType, iouType = _h === void 0 ? CONST_1.default.IOU.TYPE.SUBMIT : _h, _j = _a.policyID, policyID = _j === void 0 ? '' : _j, _k = _a.bankAccountRoute, bankAccountRoute = _k === void 0 ? '' : _k, onCurrencyButtonPress = _a.onCurrencyButtonPress, onSubmitButtonPress = _a.onSubmitButtonPress, _l = _a.selectedTab, selectedTab = _l === void 0 ? CONST_1.default.TAB_REQUEST.MANUAL : _l, _m = _a.shouldKeepUserInput, shouldKeepUserInput = _m === void 0 ? false : _m, _o = _a.allowFlippingAmount, allowFlippingAmount = _o === void 0 ? false : _o;
    var styles = (0, useThemeStyles_1.default)();
    var isExtraSmallScreenHeight = (0, useResponsiveLayout_1.default)().isExtraSmallScreenHeight;
    var translate = (0, useLocalize_1.default)().translate;
    var textInput = (0, react_1.useRef)(null);
    var moneyRequestAmountInput = (0, react_1.useRef)(null);
    var _p = (0, react_1.useState)(false), isNegative = _p[0], setIsNegative = _p[1];
    var _q = (0, react_1.useState)(''), formError = _q[0], setFormError = _q[1];
    var _r = (0, react_1.useState)(true), shouldUpdateSelection = _r[0], setShouldUpdateSelection = _r[1];
    var isFocused = (0, core_1.useIsFocused)();
    var wasFocused = (0, usePrevious_1.default)(isFocused);
    var formattedTaxAmount = (0, CurrencyUtils_1.convertToDisplayString)(Math.abs(taxAmount), currency);
    var absoluteAmount = Math.abs(amount);
    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     */
    var onMouseDown = function (event, ids) {
        var _a, _b, _c, _d, _e;
        var relatedTargetId = (_b = (_a = event.nativeEvent) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.id;
        if (!ids.includes(relatedTargetId)) {
            return;
        }
        var selection = (_d = (_c = moneyRequestAmountInput.current) === null || _c === void 0 ? void 0 : _c.getSelection()) !== null && _d !== void 0 ? _d : { start: 0, end: 0 };
        event.preventDefault();
        (_e = moneyRequestAmountInput.current) === null || _e === void 0 ? void 0 : _e.changeSelection({
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
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        if (!isFocused || wasFocused) {
            return;
        }
        var selection = (_b = (_a = moneyRequestAmountInput.current) === null || _a === void 0 ? void 0 : _a.getSelection()) !== null && _b !== void 0 ? _b : { start: 0, end: 0 };
        (_c = moneyRequestAmountInput.current) === null || _c === void 0 ? void 0 : _c.changeSelection({
            start: selection.end,
            end: selection.end,
        });
    }, [isFocused, wasFocused]);
    var initializeAmount = (0, react_1.useCallback)(function (newAmount) {
        var _a, _b;
        var frontendAmount = newAmount ? (0, CurrencyUtils_1.convertToFrontendAmountAsString)(newAmount, currency) : '';
        (_a = moneyRequestAmountInput.current) === null || _a === void 0 ? void 0 : _a.changeAmount(frontendAmount);
        (_b = moneyRequestAmountInput.current) === null || _b === void 0 ? void 0 : _b.changeSelection({
            start: frontendAmount.length,
            end: frontendAmount.length,
        });
    }, [currency]);
    (0, react_1.useEffect)(function () {
        if (amount >= 0) {
            return;
        }
        setIsNegative(true);
    }, [amount]);
    (0, react_1.useEffect)(function () {
        if (!currency || typeof absoluteAmount !== 'number') {
            return;
        }
        initializeAmount(absoluteAmount);
        // we want to re-initialize the state only when the selected tab
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [selectedTab]);
    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     */
    var updateAmountNumberPad = (0, react_1.useCallback)(function (key) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (shouldUpdateSelection && !(0, isTextInputFocused_1.default)(textInput)) {
            (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
        var currentAmount = (_c = (_b = moneyRequestAmountInput.current) === null || _b === void 0 ? void 0 : _b.getAmount()) !== null && _c !== void 0 ? _c : '';
        var selection = (_e = (_d = moneyRequestAmountInput.current) === null || _d === void 0 ? void 0 : _d.getSelection()) !== null && _e !== void 0 ? _e : { start: 0, end: 0 };
        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (currentAmount.length > 0) {
                var selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                var newAmount_1 = "".concat(currentAmount.substring(0, selectionStart)).concat(currentAmount.substring(selection.end));
                (_f = moneyRequestAmountInput.current) === null || _f === void 0 ? void 0 : _f.setNewAmount((0, MoneyRequestUtils_1.addLeadingZero)(newAmount_1));
            }
            return;
        }
        var newAmount = (0, MoneyRequestUtils_1.addLeadingZero)("".concat(currentAmount.substring(0, selection.start)).concat(key).concat(currentAmount.substring(selection.end)));
        (_g = moneyRequestAmountInput.current) === null || _g === void 0 ? void 0 : _g.setNewAmount(newAmount);
    }, [shouldUpdateSelection]);
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
     * Submit amount and navigate to a proper page
     */
    var submitAndNavigateToNextPage = (0, react_1.useCallback)(function (iouPaymentType) {
        var _a, _b;
        var isTaxAmountForm = Navigation_1.default.getActiveRoute().includes('taxAmount');
        // Skip the check for tax amount form as 0 is a valid input
        var currentAmount = (_b = (_a = moneyRequestAmountInput.current) === null || _a === void 0 ? void 0 : _a.getAmount()) !== null && _b !== void 0 ? _b : '';
        if (!currentAmount.length || (!isTaxAmountForm && isAmountInvalid(currentAmount))) {
            setFormError(translate('iou.error.invalidAmount'));
            return;
        }
        if (isTaxAmountInvalid(currentAmount, taxAmount, isTaxAmountForm, currency)) {
            setFormError(translate('iou.error.invalidTaxAmount', { amount: formattedTaxAmount }));
            return;
        }
        var newAmount = isNegative ? "-".concat(currentAmount) : currentAmount;
        onSubmitButtonPress({ amount: newAmount, currency: currency, paymentMethod: iouPaymentType });
    }, [taxAmount, currency, isNegative, onSubmitButtonPress, translate, formattedTaxAmount]);
    var buttonText = (0, react_1.useMemo)(function () {
        if (skipConfirmation) {
            if (iouType === CONST_1.default.IOU.TYPE.SPLIT) {
                return translate('iou.splitExpense');
            }
            return translate('iou.createExpense');
        }
        return isEditing ? translate('common.save') : translate('common.next');
    }, [skipConfirmation, iouType, isEditing, translate]);
    var canUseTouchScreen = (0, DeviceCapabilities_1.canUseTouchScreen)();
    (0, react_1.useEffect)(function () {
        setFormError('');
    }, [selectedTab]);
    var toggleNegative = (0, react_1.useCallback)(function () {
        setIsNegative(function (prevIsNegative) { return !prevIsNegative; });
    }, []);
    var clearNegative = (0, react_1.useCallback)(function () {
        setIsNegative(false);
    }, []);
    return (<ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
            <react_native_1.View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <react_native_1.View id={AMOUNT_VIEW_ID} onMouseDown={function (event) { return onMouseDown(event, [AMOUNT_VIEW_ID]); }} style={[styles.moneyRequestAmountContainer, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <MoneyRequestAmountInput_1.default amount={absoluteAmount} autoGrowExtraSpace={variables_1.default.w80} currency={currency} isCurrencyPressable={false} onCurrencyButtonPress={onCurrencyButtonPress} onAmountChange={function () {
            if (!formError) {
                return;
            }
            setFormError('');
        }} shouldUpdateSelection={shouldUpdateSelection} ref={function (ref) {
            if (typeof forwardedRef === 'function') {
                forwardedRef(ref);
            }
            else if (forwardedRef === null || forwardedRef === void 0 ? void 0 : forwardedRef.current) {
                // eslint-disable-next-line no-param-reassign
                forwardedRef.current = ref;
            }
            textInput.current = ref;
        }} shouldKeepUserInput={shouldKeepUserInput} moneyRequestAmountInputRef={moneyRequestAmountInput} inputStyle={[styles.iouAmountTextInput]} containerStyle={[styles.iouAmountTextInputContainer]} toggleNegative={toggleNegative} clearNegative={clearNegative} isNegative={isNegative} allowFlippingAmount={allowFlippingAmount}/>
                    {!!formError && (<FormHelpMessage_1.default style={[styles.pAbsolute, styles.b0, styles.mb0, styles.ph5, styles.w100]} isError message={formError}/>)}
                </react_native_1.View>
                {isCurrencyPressable && !canUseTouchScreen && (<Button_1.default shouldShowRightIcon small iconRight={Expensicons.DownArrow} onPress={onCurrencyButtonPress} style={styles.minWidth18} isContentCentered text={currency}/>)}
            </react_native_1.View>
            <react_native_1.View>
                <react_native_1.View style={[styles.flexRow, styles.justifyContentCenter, styles.mb2, styles.gap2]}>
                    {isCurrencyPressable && canUseTouchScreen && (<Button_1.default shouldShowRightIcon small iconRight={Expensicons.DownArrow} onPress={onCurrencyButtonPress} style={styles.minWidth18} isContentCentered text={currency}/>)}
                    {allowFlippingAmount && canUseTouchScreen && (<Button_1.default shouldShowRightIcon small iconRight={Expensicons.PlusMinus} onPress={toggleNegative} style={styles.minWidth18} isContentCentered text={translate('iou.flip')}/>)}
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View onMouseDown={function (event) { return onMouseDown(event, [NUM_PAD_CONTAINER_VIEW_ID, NUM_PAD_VIEW_ID]); }} style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pt0]} id={NUM_PAD_CONTAINER_VIEW_ID}>
                {canUseTouchScreen ? (<BigNumberPad_1.default id={NUM_PAD_VIEW_ID} numberPressed={updateAmountNumberPad} longPressHandlerStateChanged={updateLongPressHandlerState}/>) : null}
                <react_native_1.View style={styles.w100}>
                    {iouType === CONST_1.default.IOU.TYPE.PAY && skipConfirmation ? (<SettlementButton_1.default pressOnEnter onPress={submitAndNavigateToNextPage} enablePaymentsRoute={ROUTES_1.default.IOU_SEND_ENABLE_PAYMENTS} addBankAccountRoute={bankAccountRoute} addDebitCardRoute={ROUTES_1.default.IOU_SEND_ADD_DEBIT_CARD} currency={currency !== null && currency !== void 0 ? currency : CONST_1.default.CURRENCY.USD} policyID={policyID} style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt3]} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.LARGE} kycWallAnchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }} paymentMethodDropdownAnchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }} shouldShowPersonalBankAccountOption enterKeyEventListenerPriority={1}/>) : (<Button_1.default success 
        // Prevent bubbling on edit amount Page to prevent double page submission when two CTA are stacked.
        allowBubble={!isEditing} pressOnEnter medium={isExtraSmallScreenHeight} large={!isExtraSmallScreenHeight} style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt3]} onPress={function () { return submitAndNavigateToNextPage(); }} text={buttonText} testID="next-button"/>)}
                </react_native_1.View>
            </react_native_1.View>
        </ScrollView_1.default>);
}
MoneyRequestAmountForm.displayName = 'MoneyRequestAmountForm';
exports.default = react_1.default.forwardRef(MoneyRequestAmountForm);
