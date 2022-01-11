import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import Growl from '../Growl';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import * as CardUtils from '../CardUtils';
import NameValuePair from './NameValuePair';

/**
 * Deletes a debit card
 *
 * @param {Number} fundID
 *
 * @returns {Promise}
 */
function deleteDebitCard(fundID) {
    return API.DeleteFund({fundID})
        .then((response) => {
            if (response.jsonCode === 200) {
                Growl.show('paymentsPage.deleteDebitCardSuccess', CONST.GROWL.ERROR, 3000);
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
    NameValuePair.set(CONST.NVP.PAYPAL_ME_ADDRESS, '');
    Onyx.merge(ONYXKEYS.NVP_PAYPAL_ME_ADDRESS, null);
    Growl.show('PayPal.me successfully deleted!', CONST.GROWL.ERROR, 3000);
}

/**
 * Calls the API to get the user's bankAccountList, cardList, wallet, and payPalMe
 *
 * @returns {Promise}
 */
function getPaymentMethods() {
    Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, true);
    return API.Get({
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

/**
 * Sets the default bank account or debit card for an Expensify Wallet
 *
 * @param {String} password
 * @param {Number} bankAccountID
 * @param {Number} fundID
 *
 * @returns {Promise}
 */
function setWalletLinkedAccount(password, bankAccountID, fundID) {
    return API.SetWalletLinkedAccount({
        password,
        bankAccountID,
        fundID,
    })
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.USER_WALLET, {
                    walletLinkedAccountID: bankAccountID || fundID, walletLinkedAccountType: bankAccountID ? CONST.PAYMENT_METHODS.BANK_ACCOUNT : CONST.PAYMENT_METHODS.DEBIT_CARD,
                });
                Growl.show(Localize.translateLocal('paymentsPage.setDefaultSuccess'), CONST.GROWL.SUCCESS, 5000);
            } else {
                Growl.show(Localize.translateLocal('paymentsPage.setDefaultFailure'), CONST.GROWL.ERROR, 5000);
            }
        })
        .catch(() => {
            Growl.show(Localize.translateLocal('paymentsPage.setDefaultFailure'), CONST.GROWL.ERROR, 5000);
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

    Onyx.merge(ONYXKEYS.ADD_DEBIT_CARD_FORM, {submitting: true});
    API.AddBillingCard({
        cardNumber: params.cardNumber,
        cardYear,
        cardMonth,
        cardCVV: params.securityCode,
        addressName: params.nameOnCard,
        addressZip: params.addressZipCode,
        currency: CONST.CURRENCY.USD,
    }).then(((response) => {
        let errorMessage = '';
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
            Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
        } else {
            errorMessage = response.message ? response.message : Localize.translateLocal('addDebitCardPage.error.genericFailureMessage');
        }

        Onyx.merge(ONYXKEYS.ADD_DEBIT_CARD_FORM, {
            submitting: false,
            error: errorMessage,
        });
    }));
}

/**
 * Resets the values for the add debit card form back to their initial states
 */
function clearDebitCardFormErrorAndSubmit() {
    Onyx.set(ONYXKEYS.ADD_DEBIT_CARD_FORM, {
        submitting: false,
        error: '',
    });
}

export {
    deleteDebitCard,
    deletePayPalMe,
    getPaymentMethods,
    setWalletLinkedAccount,
    addBillingCard,
    clearDebitCardFormErrorAndSubmit,
};
