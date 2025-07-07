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
exports.kycWallRef = void 0;
exports.deletePaymentCard = deletePaymentCard;
exports.addPaymentCard = addPaymentCard;
exports.openWalletPage = openWalletPage;
exports.makeDefaultPaymentMethod = makeDefaultPaymentMethod;
exports.continueSetup = continueSetup;
exports.addSubscriptionPaymentCard = addSubscriptionPaymentCard;
exports.clearPaymentCardFormErrorAndSubmit = clearPaymentCardFormErrorAndSubmit;
exports.dismissSuccessfulTransferBalancePage = dismissSuccessfulTransferBalancePage;
exports.transferWalletBalance = transferWalletBalance;
exports.resetWalletTransferData = resetWalletTransferData;
exports.saveWalletTransferAccountTypeAndID = saveWalletTransferAccountTypeAndID;
exports.saveWalletTransferMethodType = saveWalletTransferMethodType;
exports.hasPaymentMethodError = hasPaymentMethodError;
exports.updateBillingCurrency = updateBillingCurrency;
exports.clearDeletePaymentMethodError = clearDeletePaymentMethodError;
exports.clearAddPaymentMethodError = clearAddPaymentMethodError;
exports.clearWalletError = clearWalletError;
exports.setPaymentMethodCurrency = setPaymentMethodCurrency;
exports.clearPaymentCard3dsVerification = clearPaymentCard3dsVerification;
exports.clearWalletTermsError = clearWalletTermsError;
exports.verifySetupIntent = verifySetupIntent;
exports.addPaymentCardSCA = addPaymentCardSCA;
exports.setInvoicingTransferBankAccount = setInvoicingTransferBankAccount;
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CardUtils = require("@libs/CardUtils");
var GoogleTagManager_1 = require("@libs/GoogleTagManager");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AddPaymentCardForm_1 = require("@src/types/form/AddPaymentCardForm");
/**
 * Sets up a ref to an instance of the KYC Wall component.
 */
var kycWallRef = (0, react_1.createRef)();
exports.kycWallRef = kycWallRef;
/**
 * When we successfully add a payment method or pass the KYC checks we will continue with our setup action if we have one set.
 */
function continueSetup(fallbackRoute) {
    var _a;
    if (!((_a = kycWallRef.current) === null || _a === void 0 ? void 0 : _a.continueAction)) {
        Navigation_1.default.goBack(fallbackRoute);
        return;
    }
    // Close the screen (Add Debit Card, Add Bank Account, or Enable Payments) on success and continue with setup
    Navigation_1.default.goBack(fallbackRoute);
    kycWallRef.current.continueAction();
}
function openWalletPage() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_PAYMENT_METHODS,
            value: true,
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_PAYMENT_METHODS,
            value: false,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_PAYMENT_METHODS,
            value: false,
        },
    ];
    return API.read(types_1.READ_COMMANDS.OPEN_PAYMENTS_PAGE, null, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function getMakeDefaultPaymentOnyxData(bankAccountID, fundID, previousPaymentMethod, currentPaymentMethod, isOptimisticData) {
    var _a, _b;
    if (isOptimisticData === void 0) { isOptimisticData = true; }
    var onyxData = [
        isOptimisticData
            ? {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.USER_WALLET,
                value: {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    walletLinkedAccountID: bankAccountID || fundID,
                    walletLinkedAccountType: bankAccountID ? CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT : CONST_1.default.PAYMENT_METHODS.DEBIT_CARD,
                    // Only clear the error if this is optimistic data. If this is failure data, we do not want to clear the error that came from the server.
                    errors: null,
                },
            }
            : {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.USER_WALLET,
                value: {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    walletLinkedAccountID: bankAccountID || fundID,
                    walletLinkedAccountType: bankAccountID ? CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT : CONST_1.default.PAYMENT_METHODS.DEBIT_CARD,
                },
            },
    ];
    if (previousPaymentMethod === null || previousPaymentMethod === void 0 ? void 0 : previousPaymentMethod.methodID) {
        onyxData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: previousPaymentMethod.accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? ONYXKEYS_1.default.BANK_ACCOUNT_LIST : ONYXKEYS_1.default.FUND_LIST,
            value: (_a = {},
                _a[previousPaymentMethod.methodID] = {
                    isDefault: !isOptimisticData,
                },
                _a),
        });
    }
    if (currentPaymentMethod === null || currentPaymentMethod === void 0 ? void 0 : currentPaymentMethod.methodID) {
        onyxData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: currentPaymentMethod.accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? ONYXKEYS_1.default.BANK_ACCOUNT_LIST : ONYXKEYS_1.default.FUND_LIST,
            value: (_b = {},
                _b[currentPaymentMethod.methodID] = {
                    isDefault: isOptimisticData,
                },
                _b),
        });
    }
    return onyxData;
}
/**
 * Sets the default bank account or debit card for an Expensify Wallet
 *
 */
function makeDefaultPaymentMethod(bankAccountID, fundID, previousPaymentMethod, currentPaymentMethod) {
    var parameters = {
        bankAccountID: bankAccountID,
        fundID: fundID,
    };
    API.write(types_1.WRITE_COMMANDS.MAKE_DEFAULT_PAYMENT_METHOD, parameters, {
        optimisticData: getMakeDefaultPaymentOnyxData(bankAccountID, fundID, previousPaymentMethod, currentPaymentMethod, true),
        failureData: getMakeDefaultPaymentOnyxData(bankAccountID, fundID, previousPaymentMethod, currentPaymentMethod, false),
    });
}
/**
 * Calls the API to add a new card.
 *
 */
function addPaymentCard(accountID, params) {
    var cardMonth = CardUtils.getMonthFromExpirationDateString(params.expirationDate);
    var cardYear = CardUtils.getYearFromExpirationDateString(params.expirationDate);
    var parameters = {
        cardNumber: CardUtils.getMCardNumberString(params.cardNumber),
        cardYear: cardYear,
        cardMonth: cardMonth,
        cardCVV: params.securityCode,
        addressName: params.nameOnCard,
        addressZip: params.addressZipCode,
        currency: CONST_1.default.PAYMENT_CARD_CURRENCY.USD,
        isP2PDebitCard: true,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM,
            value: { isLoading: true },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM,
            value: { isLoading: false },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM,
            value: { isLoading: false },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.ADD_PAYMENT_CARD, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
    GoogleTagManager_1.default.publishEvent(CONST_1.default.ANALYTICS.EVENT.PAID_ADOPTION, accountID);
}
/**
 * Calls the API to add a new card.
 *
 */
function addSubscriptionPaymentCard(accountID, cardData) {
    var cardNumber = cardData.cardNumber, cardYear = cardData.cardYear, cardMonth = cardData.cardMonth, cardCVV = cardData.cardCVV, addressName = cardData.addressName, addressZip = cardData.addressZip, currency = cardData.currency;
    var parameters = {
        cardNumber: cardNumber,
        cardYear: cardYear,
        cardMonth: cardMonth,
        cardCVV: cardCVV,
        addressName: addressName,
        addressZip: addressZip,
        currency: currency,
        isP2PDebitCard: false,
        shouldClaimEarlyDiscountOffer: true,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM,
            value: { isLoading: true },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM,
            value: { isLoading: false },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM,
            value: { isLoading: false },
        },
    ];
    if (CONST_1.default.SCA_CURRENCIES.has(currency)) {
        addPaymentCardSCA(parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    }
    else {
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        API.write(types_1.WRITE_COMMANDS.ADD_PAYMENT_CARD, parameters, {
            optimisticData: optimisticData,
            successData: successData,
            failureData: failureData,
        });
    }
    if ((0, SubscriptionUtils_1.getCardForSubscriptionBilling)()) {
        Log_1.default.info("[GTM] Not logging ".concat(CONST_1.default.ANALYTICS.EVENT.PAID_ADOPTION, " because a card was already added"));
    }
    else {
        GoogleTagManager_1.default.publishEvent(CONST_1.default.ANALYTICS.EVENT.PAID_ADOPTION, accountID);
    }
}
/**
 * Calls the API to add a new SCA (GBP or EUR) card.
 * Updates verify3dsSubscription Onyx key with a new authentication link for 3DS.
 */
function addPaymentCardSCA(params, onyxData) {
    if (onyxData === void 0) { onyxData = {}; }
    API.write(types_1.WRITE_COMMANDS.ADD_PAYMENT_CARD_SCA, params, onyxData);
}
/**
 * Resets the values for the add payment card form back to their initial states
 */
function clearPaymentCardFormErrorAndSubmit() {
    var _a;
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM, (_a = {
            isLoading: false,
            errors: undefined
        },
        _a[AddPaymentCardForm_1.default.SETUP_COMPLETE] = false,
        _a[AddPaymentCardForm_1.default.NAME_ON_CARD] = '',
        _a[AddPaymentCardForm_1.default.CARD_NUMBER] = '',
        _a[AddPaymentCardForm_1.default.EXPIRATION_DATE] = '',
        _a[AddPaymentCardForm_1.default.SECURITY_CODE] = '',
        _a[AddPaymentCardForm_1.default.ADDRESS_STREET] = '',
        _a[AddPaymentCardForm_1.default.ADDRESS_ZIP_CODE] = '',
        _a[AddPaymentCardForm_1.default.ADDRESS_STATE] = '',
        _a[AddPaymentCardForm_1.default.ACCEPT_TERMS] = '',
        _a[AddPaymentCardForm_1.default.CURRENCY] = CONST_1.default.PAYMENT_CARD_CURRENCY.USD,
        _a));
}
/**
 * Clear 3ds flow - when verification will be finished
 *
 */
function clearPaymentCard3dsVerification() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.VERIFY_3DS_SUBSCRIPTION, '');
}
/**
 * Properly updates the nvp_privateStripeCustomerID onyx data for 3DS payment
 *
 */
function verifySetupIntent(accountID, isVerifying) {
    if (isVerifying === void 0) { isVerifying = true; }
    API.write(types_1.WRITE_COMMANDS.VERIFY_SETUP_INTENT, { accountID: accountID, isVerifying: isVerifying });
}
/**
 * Set currency for payments
 *
 */
function setPaymentMethodCurrency(currency) {
    var _a;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM, (_a = {},
        _a[AddPaymentCardForm_1.default.CURRENCY] = currency,
        _a));
}
/**
 * Call the API to transfer wallet balance.
 *
 */
function transferWalletBalance(paymentMethod) {
    var _a;
    var paymentMethodIDKey = paymentMethod.accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? CONST_1.default.PAYMENT_METHOD_ID_KEYS.BANK_ACCOUNT : CONST_1.default.PAYMENT_METHOD_ID_KEYS.DEBIT_CARD;
    var parameters = (_a = {},
        _a[paymentMethodIDKey] = paymentMethod.methodID,
        _a);
    var optimisticData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.WALLET_TRANSFER,
            value: {
                loading: true,
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.WALLET_TRANSFER,
            value: {
                loading: false,
                shouldShowSuccess: true,
                paymentMethodType: paymentMethod.accountType,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.WALLET_TRANSFER,
            value: {
                loading: false,
                shouldShowSuccess: false,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.TRANSFER_WALLET_BALANCE, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function resetWalletTransferData() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.WALLET_TRANSFER, {
        selectedAccountType: '',
        selectedAccountID: null,
        filterPaymentMethodType: null,
        loading: false,
        shouldShowSuccess: false,
    });
}
function saveWalletTransferAccountTypeAndID(selectedAccountType, selectedAccountID) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.WALLET_TRANSFER, { selectedAccountType: selectedAccountType, selectedAccountID: selectedAccountID });
}
/**
 * Toggles the user's selected type of payment method (bank account or debit card) on the wallet transfer balance screen.
 *
 */
function saveWalletTransferMethodType(filterPaymentMethodType) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.WALLET_TRANSFER, { filterPaymentMethodType: filterPaymentMethodType });
}
function dismissSuccessfulTransferBalancePage() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.WALLET_TRANSFER, { shouldShowSuccess: false });
    Navigation_1.default.goBack();
}
/**
 * Looks through each payment method to see if there is an existing error
 *
 */
function hasPaymentMethodError(bankList, fundList) {
    var combinedPaymentMethods = __assign(__assign({}, bankList), fundList);
    return Object.values(combinedPaymentMethods).some(function (item) { var _a; return Object.keys((_a = item.errors) !== null && _a !== void 0 ? _a : {}).length; });
}
/**
 * Clears the error for the specified payment item
 * @param paymentListKey The onyx key for the provided payment method
 * @param paymentMethodID
 */
function clearDeletePaymentMethodError(paymentListKey, paymentMethodID) {
    var _a;
    react_native_onyx_1.default.merge(paymentListKey, (_a = {},
        _a[paymentMethodID] = {
            pendingAction: null,
            errors: null,
        },
        _a));
}
/**
 * If there was a failure adding a payment method, clearing it removes the payment method from the list entirely
 * @param paymentListKey The onyx key for the provided payment method
 * @param paymentMethodID
 */
function clearAddPaymentMethodError(paymentListKey, paymentMethodID) {
    var _a;
    react_native_onyx_1.default.merge(paymentListKey, (_a = {},
        _a[paymentMethodID] = null,
        _a));
}
/**
 * Clear any error(s) related to the user's wallet
 */
function clearWalletError() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.USER_WALLET, { errors: null });
}
/**
 * Clear any error(s) related to the user's wallet terms
 */
function clearWalletTermsError() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.WALLET_TERMS, { errors: null });
}
function deletePaymentCard(fundID) {
    var _a;
    var parameters = {
        fundID: fundID,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.FUND_LIST),
            value: (_a = {}, _a[fundID] = { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE }, _a),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.DELETE_PAYMENT_CARD, parameters, {
        optimisticData: optimisticData,
    });
}
/**
 * Call the API to change billing currency.
 *
 */
function updateBillingCurrency(currency, cardCVV) {
    var parameters = {
        cardCVV: cardCVV,
        currency: currency,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.CHANGE_BILLING_CURRENCY_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.CHANGE_BILLING_CURRENCY_FORM,
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.CHANGE_BILLING_CURRENCY_FORM,
            value: {
                isLoading: false,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.UPDATE_BILLING_CARD_CURRENCY, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 *  Sets the default bank account to use for receiving payouts from
 *
 */
function setInvoicingTransferBankAccount(bankAccountID, policyID, previousBankAccountID) {
    var parameters = {
        bankAccountID: bankAccountID,
        policyID: policyID,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    bankAccount: {
                        transferBankAccountID: bankAccountID,
                    },
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                invoice: {
                    bankAccount: {
                        transferBankAccountID: previousBankAccountID,
                    },
                },
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.SET_INVOICING_TRANSFER_BANK_ACCOUNT, parameters, {
        optimisticData: optimisticData,
        failureData: failureData,
    });
}
