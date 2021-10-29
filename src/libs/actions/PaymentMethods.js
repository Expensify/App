import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import Growl from '../Growl';
import {translateLocal} from '../translate';
import Navigation from '../Navigation/Navigation';
import {maskCardNumber, getMonthFromExpirationDateString, getYearFromExpirationDateString} from '../CardUtils';

function deleteDebitCard(fundID) {
    return API.DeleteFund({fundID}).then((response) => {
        if (response.jsonCode === 200) {
            Onyx.merge(ONYXKEYS.CARD_LIST, {[fundID]: null});
        }
    });
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

function setWalletLinkedAccount(password, bankAccountID, fundID) {
    return API.SetWalletLinkedAccount({
        password,
        bankAccountID,
        fundID,
    })
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.USER_WALLET, {walletLinkedAccountID: bankAccountID || fundID, walletLinkedAccountType: bankAccountID ? 'bankAccount' : 'debitCard'});
                Growl.show(translateLocal('paymentsPage.setDefaultSuccess'), CONST.GROWL.SUCCESS, 5000);
            } else {
                Growl.show(translateLocal('paymentsPage.setDefaultFailure'), CONST.GROWL.ERROR, 5000);
            }
        });
}

/**
 * Calls the API to add a new card.
 *
 * @param {Object} params
 */
function addBillingCard(params) {
    const cardMonth = getMonthFromExpirationDateString(params.expirationDate);
    const cardYear = getYearFromExpirationDateString(params.expirationDate);

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
                cardNumber: maskCardNumber(params.cardNumber),
                cardYear,
                currency: 'USD',
                fundID: lodashGet(response, 'fundID', ''),
            };
            Onyx.merge(ONYXKEYS.CARD_LIST, [cardObject]);
            Growl.show(translateLocal('addDebitCardPage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
            Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
        } else {
            errorMessage = response.message ? response.message : translateLocal('addDebitCardPage.error.genericFailureMessage');
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
    getPaymentMethods,
    setWalletLinkedAccount,
    addBillingCard,
    clearDebitCardFormErrorAndSubmit,
};
