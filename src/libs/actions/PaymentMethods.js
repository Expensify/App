import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Growl from '../Growl';
import ROUTES from '../../ROUTES';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import * as CardUtils from '../CardUtils';

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
            Onyx.multiSet({
                [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: false,
                [ONYXKEYS.USER_WALLET]: lodashGet(response, 'userWallet', {}),
                [ONYXKEYS.BANK_ACCOUNT_LIST]: lodashGet(response, 'bankAccountList', []),
                [ONYXKEYS.CARD_LIST]: lodashGet(response, 'fundList', []),
                [ONYXKEYS.NVP_PAYPAL_ME_ADDRESS]:
                    lodashGet(response, ['nameValuePairs', CONST.NVP.PAYPAL_ME_ADDRESS], ''),
            });
        });
}

/**
 * Call the API to transfer wallet balance.
 * @param {Object} paymentMethod
 * @param {String} paymentMethod.id
 * @param {'bank'|'card'} paymentMethod.type
 * @returns {Promise}
 */
function transferWalletBalance(paymentMethod) {
    const parameters = {};
    parameters[paymentMethod.type === CONST.PAYMENT_METHODS.BANK_ACCOUNT ? 'bankAccountID' : 'fundID'] = paymentMethod.id;
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {loading: true});

    return API.TransferWalletBalance(parameters)
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error();
            }
            Onyx.merge(ONYXKEYS.USER_WALLET, {balance: 0});
            Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {completed: true, loading: false});
            Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
        }).catch((error) => {
            console.debug(`[Payments] Failed to transfer wallet balance: ${error.message}`);
            Growl.error(Localize.translateLocal('transferAmountPage.failedTransfer'));
            Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {loading: false});
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

function startWalletTransfer(transferAmount) {
    Onyx.set(ONYXKEYS.WALLET_TRANSFER, {
        transferAmount,
        filterPaymentMethodType: null,
        loading: false,
    });
}

function updateWalletTransferData(data) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, data);
}

function cancelWalletTransfer() {
    Onyx.set(ONYXKEYS.WALLET_TRANSFER, null);
}

export {
    getPaymentMethods,
    addBillingCard,
    clearDebitCardFormErrorAndSubmit,
    transferWalletBalance,
    startWalletTransfer,
    updateWalletTransferData,
    cancelWalletTransfer,
};
