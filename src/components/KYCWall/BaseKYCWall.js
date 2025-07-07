"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable react-compiler/react-compiler */
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddPaymentMethodMenu_1 = require("@components/AddPaymentMethodMenu");
var useOnyx_1 = require("@hooks/useOnyx");
var BankAccounts_1 = require("@libs/actions/BankAccounts");
var IOU_1 = require("@libs/actions/IOU");
var getClickedTargetLocation_1 = require("@libs/getClickedTargetLocation");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PaymentUtils_1 = require("@libs/PaymentUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var Policy_1 = require("@userActions/Policy/Policy");
var Wallet_1 = require("@userActions/Wallet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var viewRef_1 = require("@src/types/utils/viewRef");
// This sets the Horizontal anchor position offset for POPOVER MENU.
var POPOVER_MENU_ANCHOR_POSITION_HORIZONTAL_OFFSET = 20;
// This component allows us to block various actions by forcing the user to first add a default payment method and successfully make it through our Know Your Customer flow
// before continuing to take whatever action they originally intended to take. It requires a button as a child and a native event so we can get the coordinates and use it
// to render the AddPaymentMethodMenu in the correct location.
function KYCWall(_a) {
    var _b;
    var addBankAccountRoute = _a.addBankAccountRoute, addDebitCardRoute = _a.addDebitCardRoute, _c = _a.anchorAlignment, anchorAlignment = _c === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    } : _c, _d = _a.chatReportID, chatReportID = _d === void 0 ? '' : _d, children = _a.children, enablePaymentsRoute = _a.enablePaymentsRoute, iouReport = _a.iouReport, _e = _a.onSelectPaymentMethod, onSelectPaymentMethod = _e === void 0 ? function () { } : _e, onSuccessfulKYC = _a.onSuccessfulKYC, _f = _a.shouldIncludeDebitCard, shouldIncludeDebitCard = _f === void 0 ? true : _f, _g = _a.shouldListenForResize, shouldListenForResize = _g === void 0 ? false : _g, source = _a.source, _h = _a.shouldShowPersonalBankAccountOption, shouldShowPersonalBankAccountOption = _h === void 0 ? false : _h;
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET, { canBeMissing: true })[0];
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS, { canBeMissing: true })[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST, { canBeMissing: true })[0];
    var _j = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: true })[0], bankAccountList = _j === void 0 ? {} : _j;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true })[0];
    var anchorRef = (0, react_1.useRef)(null);
    var transferBalanceButtonRef = (0, react_1.useRef)(null);
    var _k = (0, react_1.useState)(false), shouldShowAddPaymentMenu = _k[0], setShouldShowAddPaymentMenu = _k[1];
    var _l = (0, react_1.useState)({
        anchorPositionVertical: 0,
        anchorPositionHorizontal: 0,
    }), anchorPosition = _l[0], setAnchorPosition = _l[1];
    var getAnchorPosition = (0, react_1.useCallback)(function (domRect) {
        if (anchorAlignment.vertical === CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP) {
            return {
                anchorPositionVertical: domRect.top + domRect.height + CONST_1.default.MODAL.POPOVER_MENU_PADDING,
                anchorPositionHorizontal: domRect.left + POPOVER_MENU_ANCHOR_POSITION_HORIZONTAL_OFFSET,
            };
        }
        return {
            anchorPositionVertical: domRect.top - CONST_1.default.MODAL.POPOVER_MENU_PADDING,
            anchorPositionHorizontal: domRect.left,
        };
    }, [anchorAlignment.vertical]);
    /**
     * Set position of the transfer payment menu
     */
    var setPositionAddPaymentMenu = function (_a) {
        var anchorPositionVertical = _a.anchorPositionVertical, anchorPositionHorizontal = _a.anchorPositionHorizontal;
        setAnchorPosition({
            anchorPositionVertical: anchorPositionVertical,
            anchorPositionHorizontal: anchorPositionHorizontal,
        });
    };
    var setMenuPosition = (0, react_1.useCallback)(function () {
        if (!transferBalanceButtonRef.current) {
            return;
        }
        var buttonPosition = (0, getClickedTargetLocation_1.default)(transferBalanceButtonRef.current);
        var position = getAnchorPosition(buttonPosition);
        setPositionAddPaymentMenu(position);
    }, [getAnchorPosition]);
    var selectPaymentMethod = (0, react_1.useCallback)(function (paymentMethod) {
        var _a;
        onSelectPaymentMethod(paymentMethod);
        if (paymentMethod === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            (0, BankAccounts_1.openPersonalBankAccountSetupView)();
        }
        else if (paymentMethod === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation_1.default.navigate(addDebitCardRoute !== null && addDebitCardRoute !== void 0 ? addDebitCardRoute : ROUTES_1.default.HOME);
        }
        else if (paymentMethod === CONST_1.default.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT) {
            if (iouReport && (0, ReportUtils_1.isIOUReport)(iouReport)) {
                var _b = (_a = (0, Policy_1.createWorkspaceFromIOUPayment)(iouReport)) !== null && _a !== void 0 ? _a : {}, policyID = _b.policyID, workspaceChatReportID = _b.workspaceChatReportID, reportPreviewReportActionID = _b.reportPreviewReportActionID, adminsChatReportID = _b.adminsChatReportID;
                (0, IOU_1.completePaymentOnboarding)(CONST_1.default.PAYMENT_SELECTED.BBA, adminsChatReportID, policyID);
                if (workspaceChatReportID) {
                    Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(workspaceChatReportID, reportPreviewReportActionID));
                }
                // Navigate to the bank account set up flow for this specific policy
                Navigation_1.default.navigate(ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID));
                return;
            }
            Navigation_1.default.navigate(addBankAccountRoute);
        }
    }, [addBankAccountRoute, addDebitCardRoute, iouReport, onSelectPaymentMethod]);
    /**
     * Take the position of the button that calls this method and show the Add Payment method menu when the user has no valid payment method.
     * If they do have a valid payment method they are navigated to the "enable payments" route to complete KYC checks.
     * If they are already KYC'd we will continue whatever action is gated behind the KYC wall.
     *
     */
    var continueAction = (0, react_1.useCallback)(function (event, iouPaymentType) {
        var _a, _b, _c;
        var currentSource = (_a = walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.source) !== null && _a !== void 0 ? _a : source;
        /**
         * Set the source, so we can tailor the process according to how we got here.
         * We do not want to set this on mount, as the source can change upon completing the flow, e.g. when upgrading the wallet to Gold.
         */
        (0, Wallet_1.setKYCWallSource)(source, chatReportID);
        if (shouldShowAddPaymentMenu) {
            setShouldShowAddPaymentMenu(false);
            return;
        }
        // Use event target as fallback if anchorRef is null for safety
        var targetElement = (_b = anchorRef.current) !== null && _b !== void 0 ? _b : event === null || event === void 0 ? void 0 : event.currentTarget;
        transferBalanceButtonRef.current = targetElement;
        var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(iouReport);
        var paymentCardList = fundList !== null && fundList !== void 0 ? fundList : {};
        // Check to see if user has a valid payment method on file and display the add payment popover if they don't
        if ((isExpenseReport && ((_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.state) !== CONST_1.default.BANK_ACCOUNT.STATE.OPEN) ||
            (!isExpenseReport && bankAccountList !== null && !(0, PaymentUtils_1.hasExpensifyPaymentMethod)(paymentCardList, bankAccountList, shouldIncludeDebitCard))) {
            Log_1.default.info('[KYC Wallet] User does not have valid payment method');
            if (!shouldIncludeDebitCard) {
                selectPaymentMethod(CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
                return;
            }
            var clickedElementLocation = (0, getClickedTargetLocation_1.default)(targetElement);
            var position = getAnchorPosition(clickedElementLocation);
            setPositionAddPaymentMenu(position);
            setShouldShowAddPaymentMenu(true);
            return;
        }
        if (!isExpenseReport) {
            // Ask the user to upgrade to a gold wallet as this means they have not yet gone through our Know Your Customer (KYC) checks
            var hasActivatedWallet = (userWallet === null || userWallet === void 0 ? void 0 : userWallet.tierName) && [CONST_1.default.WALLET.TIER_NAME.GOLD, CONST_1.default.WALLET.TIER_NAME.PLATINUM].some(function (name) { return name === userWallet.tierName; });
            if (!hasActivatedWallet) {
                Log_1.default.info('[KYC Wallet] User does not have active wallet');
                Navigation_1.default.navigate(enablePaymentsRoute);
                return;
            }
        }
        Log_1.default.info('[KYC Wallet] User has valid payment method and passed KYC checks or did not need them');
        onSuccessfulKYC(iouPaymentType, currentSource);
    }, [
        bankAccountList,
        chatReportID,
        enablePaymentsRoute,
        fundList,
        getAnchorPosition,
        iouReport,
        onSuccessfulKYC,
        (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.state,
        selectPaymentMethod,
        shouldIncludeDebitCard,
        shouldShowAddPaymentMenu,
        source,
        userWallet === null || userWallet === void 0 ? void 0 : userWallet.tierName,
        walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.source,
    ]);
    (0, react_1.useEffect)(function () {
        var dimensionsSubscription = null;
        PaymentMethods_1.kycWallRef.current = { continueAction: continueAction };
        if (shouldListenForResize) {
            dimensionsSubscription = react_native_1.Dimensions.addEventListener('change', setMenuPosition);
        }
        return function () {
            if (shouldListenForResize && dimensionsSubscription) {
                dimensionsSubscription.remove();
            }
            PaymentMethods_1.kycWallRef.current = null;
        };
    }, [chatReportID, setMenuPosition, shouldListenForResize, continueAction]);
    return (<>
            <AddPaymentMethodMenu_1.default isVisible={shouldShowAddPaymentMenu} iouReport={iouReport} onClose={function () { return setShouldShowAddPaymentMenu(false); }} anchorRef={anchorRef} anchorPosition={{
            vertical: anchorPosition.anchorPositionVertical,
            horizontal: anchorPosition.anchorPositionHorizontal,
        }} anchorAlignment={anchorAlignment} onItemSelected={function (item) {
            setShouldShowAddPaymentMenu(false);
            selectPaymentMethod(item);
        }} shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}/>
            {children(continueAction, (0, viewRef_1.default)(anchorRef))}
        </>);
}
KYCWall.displayName = 'BaseKYCWall';
exports.default = KYCWall;
