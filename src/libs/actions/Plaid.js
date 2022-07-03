import Onyx from 'react-native-onyx';
import getPlaidLinkTokenParameters from '../getPlaidLinkTokenParameters';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as Localize from '../Localize';

/**
 * We clear these out of storage once we are done with them so the user must re-enter Plaid credentials upon returning.
 * @param {String} onyxKey
 */
function clearOnyxObject(onyxKey) {
    Onyx.set(onyxKey, {});
}

/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 * @param {Boolean} allowDebit
 */
function openPlaidBankLogin(allowDebit) {
    const params = getPlaidLinkTokenParameters();
    params.allowDebit = allowDebit;
    API.read('OpenPlaidBankLogin', params);
}

/**
 * @param {String} publicToken
 * @param {String} bankName
 * @param {Boolean} allowDebit
 */
function openPlaidBankAccountSelector(publicToken, bankName, allowDebit) {
    API.read('OpenPlaidBankAccountSelector', {
        publicToken,
        allowDebit,
        bank: bankName,
    }, {
        optimisticData: [{
            onyxMethod: 'merge',
            key: ONYXKEYS.PLAID_DATA,
            value: {
                loading: true,
                error: '',
                bankName,
            },
        }],
        successData: [{
            onyxMethod: 'merge',
            key: ONYXKEYS.PLAID_DATA,
            value: {
                loading: false,
                error: '',
            },
        }],
        failureData: [{
            onyxMethod: 'merge',
            key: ONYXKEYS.PLAID_DATA,
            value: {
                loading: false,
                error: Localize.translateLocal('bankAccount.error.noBankAccountAvailable'),
            },
        }],
    });
}

export {
    clearOnyxObject,
    openPlaidBankAccountSelector,
    openPlaidBankLogin,
};
