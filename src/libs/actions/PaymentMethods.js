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
        returnValueList: 'bankAccountList, cardList, userWallet, nameValuePairs',
        name: 'paypalMeAddress',
        includeDeleted: false,
        includeNotIssued: false,
    })
        .then((response) => {
            Onyx.multiSet({
                [ONYXKEYS.USER_WALLET]: lodashGet(response, 'userWallet', {}),
                [ONYXKEYS.BANK_ACCOUNT_LIST]: lodashGet(response, 'bankAccountList', []),
                [ONYXKEYS.CARD_LIST]: lodashGet(response, 'cardList', []),
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
        // eslint-disable-next-line no-use-before-define
        cardYear: normalizeCardYear(params.expirationDate),
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

/**
 * Returns the year of the expiration date in YYYY format.
 *
 * @param {String} expirationDate
 *
 * @returns {String}
 */
function normalizeCardYear(expirationDate) {
    let cardYear = expirationDate.substr(3);
    if (cardYear.length === 2) {
        cardYear = `20${cardYear}`;
    }
    return cardYear;
}

export {
    getPaymentMethods,
    addBillingCard,
};
