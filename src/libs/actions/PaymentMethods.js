import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Growl from '../Growl';
import {translateLocal} from '../translate';

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
 * Call the API to transfer wallet balance.
 * @param {Object} paymentMethod
 * @param {String} paymentMethod.id
 * @param {'bank'|'card'} paymentMethod.type
 * @returns {Promise}
 */
function transferWalletBalance(paymentMethod) {
    const parameters = {};
    parameters[paymentMethod.type === 'bank' ? 'bankAccountID' : 'fundID'] = paymentMethod.id;

    return API.TransferWalletBalance(parameters)
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error();
            }
            Onyx.merge(ONYXKEYS.USER_WALLET, {balance: 0});
            Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {completed: true});
        }).catch((error) => {
            console.debug(`[Payments] Failed to transfer wallet balance: ${error.message}`);
            Growl.error(translateLocal('transferAmountPage.failedTransfer'));
        });
}

export {
    getPaymentMethods,
    transferWalletBalance,
};
