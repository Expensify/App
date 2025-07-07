"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var IOU_1 = require("@libs/actions/IOU");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Expensicons = require("./Icon/Expensicons");
var PopoverMenu_1 = require("./PopoverMenu");
function AddPaymentMethodMenu(_a) {
    var _b;
    var isVisible = _a.isVisible, onClose = _a.onClose, anchorPosition = _a.anchorPosition, _c = _a.anchorAlignment, anchorAlignment = _c === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    } : _c, anchorRef = _a.anchorRef, iouReport = _a.iouReport, onItemSelected = _a.onItemSelected, _d = _a.shouldShowPersonalBankAccountOption, shouldShowPersonalBankAccountOption = _d === void 0 ? false : _d;
    var translate = (0, useLocalize_1.default)().translate;
    var _e = (0, react_1.useState)(), restoreFocusType = _e[0], setRestoreFocusType = _e[1];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    // Users can choose to pay with business bank account in case of Expense reports or in case of P2P IOU report
    // which then starts a bottom up flow and creates a Collect workspace where the payer is an admin and payee is an employee.
    var isIOU = (0, ReportUtils_1.isIOUReport)(iouReport);
    var canUseBusinessBankAccount = (0, ReportUtils_1.isExpenseReport)(iouReport) || (isIOU && !(0, ReportActionsUtils_1.hasRequestFromCurrentAccount)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID, (_b = session === null || session === void 0 ? void 0 : session.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID));
    var canUsePersonalBankAccount = shouldShowPersonalBankAccountOption || isIOU;
    var isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;
    // We temporarily disabled P2P debit cards so we will automatically select the personal bank account option if there is no other option to select.
    (0, react_1.useEffect)(function () {
        if (!isVisible || !isPersonalOnlyOption) {
            return;
        }
        (0, IOU_1.completePaymentOnboarding)(CONST_1.default.PAYMENT_SELECTED.PBA);
        onItemSelected(CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
    }, [isPersonalOnlyOption, isVisible, onItemSelected]);
    if (isPersonalOnlyOption) {
        return null;
    }
    return (<PopoverMenu_1.default isVisible={isVisible} onClose={function () {
            setRestoreFocusType(undefined);
            onClose();
        }} anchorPosition={anchorPosition} anchorAlignment={anchorAlignment} anchorRef={anchorRef} onItemSelected={function () {
            setRestoreFocusType(CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DELETE);
            onClose();
        }} menuItems={__spreadArray(__spreadArray([], (canUsePersonalBankAccount
            ? [
                {
                    text: translate('common.personalBankAccount'),
                    icon: Expensicons.Bank,
                    onSelected: function () {
                        (0, IOU_1.completePaymentOnboarding)(CONST_1.default.PAYMENT_SELECTED.PBA);
                        onItemSelected(CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
                    },
                },
            ]
            : []), true), (canUseBusinessBankAccount
            ? [
                {
                    text: translate('common.businessBankAccount'),
                    icon: Expensicons.Building,
                    onSelected: function () {
                        onItemSelected(CONST_1.default.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
                    },
                },
            ]
            : []), true)} shouldEnableNewFocusManagement restoreFocusType={restoreFocusType}/>);
}
AddPaymentMethodMenu.displayName = 'AddPaymentMethodMenu';
exports.default = AddPaymentMethodMenu;
