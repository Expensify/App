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
        returnValueList: 'bankAccountList, cardList, userWallet, nameValuePairs',
        name: 'paypalMeAddress',
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
 * Calls the API to transfet wallet balance
 *
 * @returns {Promise}
 */
function transferWalletBalance() {
    return API.TransferWalletBalance()
        .then((response) => {
            if (!response) {
                return;
            }
            if (response.jsonCode !== 200) {
                Growl.error(translateLocal('transferAmountPage.failedTransfer'));
                return;
            }
            Onyx.merge(ONYXKEYS.USER_WALLET, {balance: 0});
        }).catch((error) => {
            console.debug(`[Payments] Failed to tranfer wallet balance: ${error.message}`);
        });
}

export {
    getPaymentMethods,
    transferWalletBalance,
};
