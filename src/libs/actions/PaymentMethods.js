import _ from 'underscore';
import {createRef} from 'react';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as DeprecatedAPI from '../deprecatedAPI';
import * as API from '../API';
import CONST from '../../CONST';
import Growl from '../Growl';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import * as CardUtils from '../CardUtils';
import * as User from './User';
import * as store from './ReimbursementAccount/store';
import ROUTES from '../../ROUTES';

/**
 * Deletes a debit card
 *
 * @param {Number} fundID
 *
 * @returns {Promise}
 */
function deleteDebitCard(fundID) {
    return DeprecatedAPI.DeleteFund({fundID})
        .then((response) => {
            if (response.jsonCode === 200) {
                Growl.show(Localize.translateLocal('paymentsPage.deleteDebitCardSuccess'), CONST.GROWL.SUCCESS, 3000);
                Onyx.merge(ONYXKEYS.CARD_LIST, {[fundID]: null});
            } else {
                Growl.show(Localize.translateLocal('common.genericErrorMessage'), CONST.GROWL.ERROR, 3000);
            }
        })
        .catch(() => {
            Growl.show(Localize.translateLocal('common.genericErrorMessage'), CONST.GROWL.ERROR, 3000);
        });
}

function deletePayPalMe() {
    User.deletePaypalMeAddress();
    Growl.show(Localize.translateLocal('paymentsPage.deletePayPalSuccess'), CONST.GROWL.SUCCESS, 3000);
}

/**
 * Sets up a ref to an instance of the KYC Wall component.
 */
const kycWallRef = createRef();

/**
 * When we successfully add a payment method or pass the KYC checks we will continue with our setup action if we have one set.
 */
function continueSetup() {
    if (!kycWallRef.current || !kycWallRef.current.continue) {
        Navigation.goBack();
        return;
    }

    // Close the screen (Add Debit Card, Add Bank Account, or Enable Payments) on success and continue with setup
    Navigation.goBack();
    kycWallRef.current.continue();
}

/**
 * Clears local reimbursement account if it doesn't exist in bankAccounts
 * @param {Object[]} bankAccounts
 */
function cleanLocalReimbursementData(bankAccounts) {
    const bankAccountID = lodashGet(store.getReimbursementAccountInSetup(), 'bankAccountID');

    // We check if the bank account list doesn't have the reimbursementAccount
    if (!_.find(bankAccounts, bankAccount => bankAccount.bankAccountID === bankAccountID)) {
        Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: null, shouldShowResetModal: false});
    }
}

/**
 * Calls the API to get the user's bankAccountList, cardList, wallet, and payPalMe
 *
 * @returns {Promise}
 */
function getPaymentMethods() {
    Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, true);
    return DeprecatedAPI.Get({
        returnValueList: 'bankAccountList, fundList, userWallet, nameValuePairs',
        name: 'paypalMeAddress',
        includeDeleted: false,
        includeNotIssued: false,
        excludeNotActivated: true,
    })
        .then((response) => {
            // Convert bank accounts/cards from an array of objects, to a map with the bankAccountID as the key
            const bankAccounts = _.object(_.map(lodashGet(response, 'bankAccountList', []), bankAccount => [bankAccount.bankAccountID, bankAccount]));
            const debitCards = _.object(_.map(lodashGet(response, 'fundList', []), fund => [fund.fundID, fund]));
            cleanLocalReimbursementData(bankAccounts);
            Onyx.multiSet({
                [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: false,
                [ONYXKEYS.USER_WALLET]: lodashGet(response, 'userWallet', {}),
                [ONYXKEYS.BANK_ACCOUNT_LIST]: bankAccounts,
                [ONYXKEYS.CARD_LIST]: debitCards,
                [ONYXKEYS.NVP_PAYPAL_ME_ADDRESS]:
                    lodashGet(response, ['nameValuePairs', CONST.NVP.PAYPAL_ME_ADDRESS], ''),
            });
        });
}

function openPaymentsPage() {
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
                value: true,
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
                value: false,
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
                value: false,
            },
        ],
    };

    return API.read('OpenPaymentsPage', {}, onyxData);
}

/**
 * Sets the default bank account or debit card for an Expensify Wallet
 *
 * @param {String} password
 * @param {Number} bankAccountID
 * @param {Number} fundID
 * @param {Number} previousPaymentMethodID
 * @param {String} previousPaymentMethodType
 *
 */
function makeDefaultPaymentMethod(password, bankAccountID, fundID, previousPaymentMethodID, previousPaymentMethodType) {
    API.write('MakeDefaultPaymentMethod', {
        password,
        bankAccountID,
        fundID,
    }, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {
                    walletLinkedAccountID: bankAccountID || fundID,
                    walletLinkedAccountType: bankAccountID ? CONST.PAYMENT_METHODS.BANK_ACCOUNT : CONST.PAYMENT_METHODS.DEBIT_CARD,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {
                    walletLinkedAccountID: previousPaymentMethodID,
                    walletLinkedAccountType: previousPaymentMethodType,
                },
            },
        ],
    });
}

/**
 * Calls the API to add a new card.
 *
 * @param {Object} params
 */
function addBillingCard(params) {
    const cardMonth = CardUtils.getMonthFromExpirationDateString(params.expirationDate);
    const cardYear = CardUtils.getYearFromExpirationDateString(params.expirationDate);

    DeprecatedAPI.AddBillingCard({
        cardNumber: params.cardNumber,
        cardYear,
        cardMonth,
        cardCVV: params.securityCode,
        addressName: params.nameOnCard,
        addressZip: params.addressZipCode,
        currency: CONST.CURRENCY.USD,
        isP2PDebitCard: true,
        password: params.password,
    }).then(((response) => {
        let serverErrorMessage = '';
        if (response.jsonCode === 200) {
            const cardObject = {
                additionalData: {
                    isBillingCard: false,
                    isP2PDebitCard: true,
                },
                addressName: params.nameOnCard,
                addressState: params.addressState,
                addressStreet: params.addressStreet,
                addressZip: params.addressZipCode,
                cardMonth,
                cardNumber: CardUtils.maskCardNumber(params.cardNumber),
                cardYear,
                currency: 'USD',
                fundID: lodashGet(response, 'fundID', ''),
            };
            Onyx.merge(ONYXKEYS.CARD_LIST, [cardObject]);
            Growl.show(Localize.translateLocal('addDebitCardPage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
            continueSetup();
        } else {
            serverErrorMessage = response.message ? response.message : Localize.translateLocal('addDebitCardPage.error.genericFailureMessage');
        }

        Onyx.merge(ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM, {
            isSubmitting: false,
            serverErrorMessage,
        });
    }));
}

/**
 * Resets the values for the add debit card form back to their initial states
 */
function clearDebitCardFormErrorAndSubmit() {
    Onyx.set(ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM, {
        isSubmitting: false,
        serverErrorMessage: null,
    });
}

/**
 * Call the API to transfer wallet balance.
 * @param {Object} paymentMethod
 * @param {*} paymentMethod.methodID
 * @param {String} paymentMethod.accountType
 */
function transferWalletBalance(paymentMethod) {
    const paymentMethodIDKey = paymentMethod.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT
        ? CONST.PAYMENT_METHOD_ID_KEYS.BANK_ACCOUNT
        : CONST.PAYMENT_METHOD_ID_KEYS.DEBIT_CARD;
    const parameters = {
        [paymentMethodIDKey]: paymentMethod.methodID,
    };

    API.write('TransferWalletBalance', parameters, {
        optimisticData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.WALLET_TRANSFER,
                value: {
                    loading: true,
                    error: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.WALLET_TRANSFER,
                value: {
                    loading: false,
                    shouldShowSuccess: true,
                    paymentMethodType: paymentMethod.accountType,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.WALLET_TRANSFER,
                value: {
                    loading: false,
                    shouldShowSuccess: false,
                },
            },
        ],
    });
}

function resetWalletTransferData() {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {
        selectedAccountType: '',
        selectedAccountID: null,
        filterPaymentMethodType: null,
        loading: false,
        shouldShowSuccess: false,
    });
}

/**
 * @param {String} selectedAccountType
 * @param {String} selectedAccountID
 */
function saveWalletTransferAccountTypeAndID(selectedAccountType, selectedAccountID) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {selectedAccountType, selectedAccountID});
}

/**
 * Toggles the user's selected type of payment method (bank account or debit card) on the wallet transfer balance screen.
 * @param {String} filterPaymentMethodType
 */
function saveWalletTransferMethodType(filterPaymentMethodType) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {filterPaymentMethodType});
}

function dismissSuccessfulTransferBalancePage() {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {shouldShowSuccess: false});
    Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
}

export {
    deleteDebitCard,
    deletePayPalMe,
    getPaymentMethods,
    openPaymentsPage,
    makeDefaultPaymentMethod,
    addBillingCard,
    kycWallRef,
    continueSetup,
    clearDebitCardFormErrorAndSubmit,
    dismissSuccessfulTransferBalancePage,
    transferWalletBalance,
    resetWalletTransferData,
    saveWalletTransferAccountTypeAndID,
    saveWalletTransferMethodType,
    cleanLocalReimbursementData,
};
