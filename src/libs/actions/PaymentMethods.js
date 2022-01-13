import {createRef} from 'react';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Growl from '../Growl';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import * as CardUtils from '../CardUtils';
import ROUTES from '../../ROUTES';

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
            continueSetup();
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

/**
 * Call the API to transfer wallet balance.
 * @param {Object} paymentMethod
 * @param {*} paymentMethod.methodID
 * @param {String} paymentMethod.type
 */
function transferWalletBalance(paymentMethod) {
    const paymentMethodIDKey = paymentMethod.type === CONST.PAYMENT_METHODS.BANK_ACCOUNT
        ? CONST.PAYMENT_METHOD_ID_KEYS.BANK_ACCOUNT
        : CONST.PAYMENT_METHOD_ID_KEYS.DEBIT_CARD;
    const parameters = {
        [paymentMethodIDKey]: paymentMethod.methodID,
    };
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {loading: true});

    API.TransferWalletBalance(parameters)
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }
            Onyx.merge(ONYXKEYS.USER_WALLET, {balance: 0});
            Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {shouldShowConfirmModal: true, loading: false});
            Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
        }).catch(() => {
            Growl.error(Localize.translateLocal('transferAmountPage.failedTransfer'));
            Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {loading: false});
        });
}

/**
 * Set the transfer account and reset the transfer data for Wallet balance transfer
 * @param {String} selectedAccountID
 */
function saveWalletTransferAccountAndResetData(selectedAccountID) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {
        selectedAccountID,
        filterPaymentMethodType: null,
        loading: false,
        shouldShowConfirmModal: false,
    });
}

/**
 * @param {Number} transferAmount
 */
function saveWalletTransferAmount(transferAmount) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {transferAmount});
}

/**
 * @param {String} selectedAccountID
 */
function saveWalletTransferAccount(selectedAccountID) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {selectedAccountID});
}

/**
 * @param {String} filterPaymentMethodType
 */
function saveWalletTransferMethodType(filterPaymentMethodType) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {filterPaymentMethodType});
}

function dismissWalletConfirmModal() {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {shouldShowConfirmModal: false});
}

export {
    getPaymentMethods,
    addBillingCard,
    kycWallRef,
    continueSetup,
    clearDebitCardFormErrorAndSubmit,
    transferWalletBalance,
    saveWalletTransferAccountAndResetData,
    saveWalletTransferAmount,
    saveWalletTransferAccount,
    saveWalletTransferMethodType,
    dismissWalletConfirmModal,
};
