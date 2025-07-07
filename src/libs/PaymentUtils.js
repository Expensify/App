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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSecondaryActionAPaymentOption = exports.selectPaymentType = void 0;
exports.hasExpensifyPaymentMethod = hasExpensifyPaymentMethod;
exports.getPaymentMethodDescription = getPaymentMethodDescription;
exports.formatPaymentMethods = formatPaymentMethods;
exports.calculateWalletTransferBalanceFee = calculateWalletTransferBalanceFee;
var BankIcons_1 = require("@components/Icon/BankIcons");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var BankAccounts_1 = require("./actions/BankAccounts");
var IOU_1 = require("./actions/IOU");
var Localize_1 = require("./Localize");
var BankAccount_1 = require("./models/BankAccount");
var Navigation_1 = require("./Navigation/Navigation");
var SubscriptionUtils_1 = require("./SubscriptionUtils");
/**
 * Check to see if user has either a debit card or personal bank account added that can be used with a wallet.
 */
function hasExpensifyPaymentMethod(fundList, bankAccountList, shouldIncludeDebitCard) {
    if (shouldIncludeDebitCard === void 0) { shouldIncludeDebitCard = true; }
    var validBankAccount = Object.values(bankAccountList).some(function (bankAccountJSON) {
        var bankAccount = new BankAccount_1.default(bankAccountJSON);
        return bankAccount.getPendingAction() !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && bankAccount.isOpen() && bankAccount.getType() === CONST_1.default.BANK_ACCOUNT.TYPE.PERSONAL;
    });
    // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
    var validDebitCard = Object.values(fundList).some(function (card) { var _a, _b, _c; return (_c = (_b = (_a = card === null || card === void 0 ? void 0 : card.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.isP2PDebitCard) !== null && _c !== void 0 ? _c : false; });
    return validBankAccount || (shouldIncludeDebitCard && validDebitCard);
}
function getPaymentMethodDescription(accountType, account, bankCurrency) {
    var _a, _b, _c;
    if (account) {
        if (accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && 'accountNumber' in account) {
            return "".concat(bankCurrency ? "".concat(bankCurrency, " ").concat(CONST_1.default.DOT_SEPARATOR, " ") : '').concat((0, Localize_1.translateLocal)('paymentMethodList.accountLastFour'), " ").concat((_a = account.accountNumber) === null || _a === void 0 ? void 0 : _a.slice(-4));
        }
        if (accountType === CONST_1.default.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT && 'accountNumber' in account) {
            return "".concat((0, Localize_1.translateLocal)('paymentMethodList.accountLastFour'), " ").concat((_b = account.accountNumber) === null || _b === void 0 ? void 0 : _b.slice(-4));
        }
        if (accountType === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD && 'cardNumber' in account) {
            return "".concat((0, Localize_1.translateLocal)('paymentMethodList.cardLastFour'), " ").concat((_c = account.cardNumber) === null || _c === void 0 ? void 0 : _c.slice(-4));
        }
    }
    return '';
}
/**
 * Get the PaymentMethods list
 */
function formatPaymentMethods(bankAccountList, fundList, styles) {
    var combinedPaymentMethods = [];
    Object.values(bankAccountList).forEach(function (bankAccount) {
        var _a, _b, _c;
        // Add all bank accounts besides the wallet
        if (((_a = bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.accountData) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.BANK_ACCOUNT_TYPES.WALLET) {
            return;
        }
        var _d = (0, BankIcons_1.default)({
            bankName: (_c = (_b = bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.accountData) === null || _b === void 0 ? void 0 : _b.additionalData) === null || _c === void 0 ? void 0 : _c.bankName,
            isCard: false,
            styles: styles,
        }), icon = _d.icon, iconSize = _d.iconSize, iconHeight = _d.iconHeight, iconWidth = _d.iconWidth, iconStyles = _d.iconStyles;
        combinedPaymentMethods.push(__assign(__assign({}, bankAccount), { description: getPaymentMethodDescription(bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.accountType, bankAccount.accountData, bankAccount.bankCurrency), icon: icon, iconSize: iconSize, iconHeight: iconHeight, iconWidth: iconWidth, iconStyles: iconStyles }));
    });
    Object.values(fundList).forEach(function (card) {
        var _a;
        var _b = (0, BankIcons_1.default)({ bankName: (_a = card === null || card === void 0 ? void 0 : card.accountData) === null || _a === void 0 ? void 0 : _a.bank, isCard: true, styles: styles }), icon = _b.icon, iconSize = _b.iconSize, iconHeight = _b.iconHeight, iconWidth = _b.iconWidth, iconStyles = _b.iconStyles;
        combinedPaymentMethods.push(__assign(__assign({}, card), { description: getPaymentMethodDescription(card === null || card === void 0 ? void 0 : card.accountType, card.accountData), icon: icon, iconSize: iconSize, iconHeight: iconHeight, iconWidth: iconWidth, iconStyles: iconStyles }));
    });
    return combinedPaymentMethods;
}
function calculateWalletTransferBalanceFee(currentBalance, methodType) {
    var transferMethodTypeFeeStructure = methodType === CONST_1.default.WALLET.TRANSFER_METHOD_TYPE.INSTANT ? CONST_1.default.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT : CONST_1.default.WALLET.TRANSFER_METHOD_TYPE_FEE.ACH;
    var calculateFee = Math.ceil(currentBalance * (transferMethodTypeFeeStructure.RATE / 100));
    return Math.max(calculateFee, transferMethodTypeFeeStructure.MINIMUM_FEE);
}
/**
 * Determines the appropriate payment action based on user validation and policy restrictions.
 * It navigates users to verification pages if necessary, triggers KYC flows for specific payment methods,
 * handles direct approvals, or proceeds with basic payment processing.
 */
var selectPaymentType = function (event, iouPaymentType, triggerKYCFlow, policy, onPress, isUserValidated, confirmApproval, iouReport) {
    if (policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
        Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
        return;
    }
    if (iouPaymentType === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST_1.default.IOU.PAYMENT_TYPE.VBBA) {
        if (!isUserValidated) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation_1.default.getActiveRoute()));
            return;
        }
        triggerKYCFlow(event, iouPaymentType);
        (0, BankAccounts_1.setPersonalBankAccountContinueKYCOnSuccess)(ROUTES_1.default.ENABLE_PAYMENTS);
        return;
    }
    if (iouPaymentType === CONST_1.default.IOU.REPORT_ACTION_TYPE.APPROVE) {
        if (confirmApproval) {
            confirmApproval();
        }
        else {
            (0, IOU_1.approveMoneyRequest)(iouReport);
        }
        return;
    }
    onPress(iouPaymentType);
};
exports.selectPaymentType = selectPaymentType;
var isSecondaryActionAPaymentOption = function (item) {
    if (!('value' in item)) {
        return false;
    }
    var payment = item.value;
    var isPaymentInArray = Object.values(CONST_1.default.IOU.PAYMENT_TYPE).filter(function (type) { return type === payment; });
    return isPaymentInArray.length > 0;
};
exports.isSecondaryActionAPaymentOption = isSecondaryActionAPaymentOption;
