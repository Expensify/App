import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import Growl from '../Growl';
import {translateLocal} from '../translate';
import Navigation from '../Navigation/Navigation';

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

/**
 * Calls the API to add a new card.
 *
 * @param {Object} params
 */
function addBillingCard(params) {
    API.AddBillingCard({
        cardNumber: params.cardNumber,
        cardYear: params.expirationDate.substr(3),
        cardMonth: params.expirationDate.substr(0, 2),
        cardCVV: params.securityCode,
        addressName: params.nameOnCard,
        addressZip: params.zipCode,
        currency: CONST.CURRENCY.USD,
    }).then(((response) => {
        if (response.jsonCode === 200) {
            Onyx.set(ONYXKEYS.CARD_LIST, response);
            Growl.show(translateLocal('addDebitCardPage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
            Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
        } else {
            Growl.error(translateLocal('addDebitCardPage.error.genericFailureMessage', 3000));
        }
    }));
}

export {
    getPaymentMethods,
    addBillingCard,
};
