import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import Growl from '../Growl';
import {translateLocal} from '../translate';
import Navigation from '../Navigation/Navigation';
import {maskCardNumber} from '../cardUtils';

function deleteCard(cardID) {
    return API.DeleteCard(cardID);
}

/**
 * Calls the API to get the user's bankAccountList, cardList, wallet, and payPalMe
 *
 * @returns {Promise}
 */
function getPaymentMethods() {
    return API.Get({
        returnValueList: 'bankAccountList, fundList, userWallet, nameValuePairs',
        name: 'paypalMeAddress',
        includeDeleted: false,
        includeNotIssued: false,
        excludeNotActivated: true,
    })
        .then((response) => {
            Onyx.multiSet({
                [ONYXKEYS.USER_WALLET]: lodashGet(response, 'userWallet', {}),
                [ONYXKEYS.BANK_ACCOUNT_LIST]: lodashGet(response, 'bankAccountList', []),
                [ONYXKEYS.CARD_LIST]: lodashGet(response, 'fundList', []),
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
                Onyx.merge(ONYXKEYS.USER_WALLET, {walletLinkedAccountID: bankAccountID ? bankAccountID : fundID, walletLinkedAccountType: bankAccountID ? 'bankAccount' : 'debitCard'});
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
    const cardYear = params.expirationDate.substr(3);
    const cardMonth = params.expirationDate.substr(0, 2);

    API.AddBillingCard({
        cardNumber: params.cardNumber,
        cardYear,
        cardMonth,
        cardCVV: params.securityCode,
        addressName: params.nameOnCard,
        addressZip: params.zipCode,
        currency: CONST.CURRENCY.USD,
    }).then(((response) => {
        if (response.jsonCode === 200) {
            const cardObject = {
                additionalData: {
                    isBillingCard: false,
                    isP2PDebitCard: true,
                },
                addressName: params.nameOnCard,
                addressState: params.selectedState,
                addressStreet: params.billingAddress,
                addressZip: params.zipCode,
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
            Growl.error(translateLocal('addDebitCardPage.error.genericFailureMessage', 3000));
        }
    }));
}

export {
    deleteCard,
    getPaymentMethods,
    setWalletLinkedAccount,
    addBillingCard,
};
