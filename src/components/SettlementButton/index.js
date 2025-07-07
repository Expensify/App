"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var KYCWall_1 = require("@components/KYCWall");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePaymentOptions_1 = require("@hooks/usePaymentOptions");
var PaymentUtils_1 = require("@libs/PaymentUtils");
var PolicyEmployeeListUtils_1 = require("@libs/PolicyEmployeeListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function SettlementButton(_a) {
    var _b = _a.addDebitCardRoute, addDebitCardRoute = _b === void 0 ? ROUTES_1.default.IOU_SEND_ADD_DEBIT_CARD : _b, _c = _a.addBankAccountRoute, addBankAccountRoute = _c === void 0 ? '' : _c, _d = _a.kycWallAnchorAlignment, kycWallAnchorAlignment = _d === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    } : _d, _e = _a.paymentMethodDropdownAnchorAlignment, paymentMethodDropdownAnchorAlignment = _e === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, // caret for dropdown is at right, so horizontal anchor is at RIGHT
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    } : _e, _f = _a.buttonSize, buttonSize = _f === void 0 ? CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM : _f, _g = _a.chatReportID, chatReportID = _g === void 0 ? '' : _g, _h = _a.currency, currency = _h === void 0 ? CONST_1.default.CURRENCY.USD : _h, enablePaymentsRoute = _a.enablePaymentsRoute, iouReport = _a.iouReport, _j = _a.isDisabled, isDisabled = _j === void 0 ? false : _j, _k = _a.isLoading, isLoading = _k === void 0 ? false : _k, _l = _a.formattedAmount, formattedAmount = _l === void 0 ? '' : _l, onPress = _a.onPress, _m = _a.pressOnEnter, pressOnEnter = _m === void 0 ? false : _m, _o = _a.policyID, policyID = _o === void 0 ? '-1' : _o, _p = _a.shouldHidePaymentOptions, shouldHidePaymentOptions = _p === void 0 ? false : _p, _q = _a.shouldShowApproveButton, shouldShowApproveButton = _q === void 0 ? false : _q, _r = _a.shouldDisableApproveButton, shouldDisableApproveButton = _r === void 0 ? false : _r, style = _a.style, disabledStyle = _a.disabledStyle, _s = _a.shouldShowPersonalBankAccountOption, shouldShowPersonalBankAccountOption = _s === void 0 ? false : _s, _t = _a.enterKeyEventListenerPriority, enterKeyEventListenerPriority = _t === void 0 ? 0 : _t, confirmApproval = _a.confirmApproval, _u = _a.useKeyboardShortcuts, useKeyboardShortcuts = _u === void 0 ? false : _u, onPaymentOptionsShow = _a.onPaymentOptionsShow, onPaymentOptionsHide = _a.onPaymentOptionsHide, onlyShowPayElsewhere = _a.onlyShowPayElsewhere, wrapperStyle = _a.wrapperStyle;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line rulesdir/no-default-id-values
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReportID || CONST_1.default.DEFAULT_NUMBER_ID), { canBeMissing: true })[0];
    var isUserValidated = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.validated; }, canBeMissing: true })[0];
    var policyEmployeeAccountIDs = policyID ? (0, PolicyEmployeeListUtils_1.default)(policyID) : [];
    var reportBelongsToWorkspace = policyID ? (0, ReportUtils_1.doesReportBelongToWorkspace)(chatReport, policyEmployeeAccountIDs, policyID) : false;
    var policyIDKey = reportBelongsToWorkspace ? policyID : CONST_1.default.POLICY.ID_FAKE;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var isInvoiceReport = (!(0, EmptyObject_1.isEmptyObject)(iouReport) && (0, ReportUtils_1.isInvoiceReport)(iouReport)) || false;
    var _v = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _v.isAccountLocked, showLockedAccountModal = _v.showLockedAccountModal;
    var paymentButtonOptions = (0, usePaymentOptions_1.default)({
        addBankAccountRoute: addBankAccountRoute,
        currency: currency,
        iouReport: iouReport,
        chatReportID: chatReportID,
        formattedAmount: formattedAmount,
        policyID: policyID,
        onPress: onPress,
        shouldHidePaymentOptions: shouldHidePaymentOptions,
        shouldShowApproveButton: shouldShowApproveButton,
        shouldDisableApproveButton: shouldDisableApproveButton,
        onlyShowPayElsewhere: onlyShowPayElsewhere,
    });
    var filteredPaymentOptions = paymentButtonOptions.filter(function (option) { return option.value !== undefined; });
    var onPaymentSelect = function (event, iouPaymentType, triggerKYCFlow) {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        (0, PaymentUtils_1.selectPaymentType)(event, iouPaymentType, triggerKYCFlow, policy, onPress, isUserValidated, confirmApproval, iouReport);
    };
    var savePreferredPaymentMethod = function (id, value) {
        (0, IOU_1.savePreferredPaymentMethod)(id, value, undefined);
    };
    return (<KYCWall_1.default onSuccessfulKYC={function (paymentType) { return onPress(paymentType); }} enablePaymentsRoute={enablePaymentsRoute} addBankAccountRoute={addBankAccountRoute} addDebitCardRoute={addDebitCardRoute} isDisabled={isOffline} source={CONST_1.default.KYC_WALL_SOURCE.REPORT} chatReportID={chatReportID} iouReport={iouReport} anchorAlignment={kycWallAnchorAlignment} shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}>
            {function (triggerKYCFlow, buttonRef) { return (<ButtonWithDropdownMenu_1.default onOptionsMenuShow={onPaymentOptionsShow} onOptionsMenuHide={onPaymentOptionsHide} buttonRef={buttonRef} shouldAlwaysShowDropdownMenu={isInvoiceReport && !onlyShowPayElsewhere} customText={isInvoiceReport ? translate('iou.settlePayment', { formattedAmount: formattedAmount }) : undefined} menuHeaderText={isInvoiceReport ? translate('workspace.invoices.paymentMethods.chooseInvoiceMethod') : undefined} isSplitButton={!isInvoiceReport} isDisabled={isDisabled} isLoading={isLoading} onPress={function (event, iouPaymentType) {
                onPaymentSelect(event, iouPaymentType, triggerKYCFlow);
            }} pressOnEnter={pressOnEnter} options={filteredPaymentOptions} onOptionSelected={function (option) {
                if (policyID === '-1') {
                    return;
                }
                savePreferredPaymentMethod(policyIDKey, option.value);
            }} style={style} wrapperStyle={wrapperStyle} disabledStyle={disabledStyle} buttonSize={buttonSize} anchorAlignment={paymentMethodDropdownAnchorAlignment} enterKeyEventListenerPriority={enterKeyEventListenerPriority} useKeyboardShortcuts={useKeyboardShortcuts}/>); }}
        </KYCWall_1.default>);
}
SettlementButton.displayName = 'SettlementButton';
exports.default = SettlementButton;
