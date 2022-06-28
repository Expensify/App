import Onyx from 'react-native-onyx';
import getPlaidLinkTokenParameters from '../getPlaidLinkTokenParameters';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as Localize from '../Localize';

/**
 * List of bank accounts. This data should not be stored in Onyx since it contains unmasked PANs.
 *
 * @private
 */
let bankName = '';

/**
 * We clear these out of storage once we are done with them so the user must re-enter Plaid credentials upon returning.
 */
function clearPlaidBankAccountsAndToken() {
    bankName = '';
    Onyx.set(ONYXKEYS.PLAID_BANK_ACCOUNTS, {});
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, null);
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
 * @param {String} bank
 * @param {Boolean} allowDebit
 */
function openPlaidBankAccountSelector(publicToken, bank, allowDebit) {
    bankName = bank;

    API.read('OpenPlaidBankAccountSelector', {
        publicToken,
        allowDebit,
        bank,
    }, {
        optimisticData: [{
            onyxMethod: 'merge',
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
            value: {
                loading: true,
                error: '',
            },
        }],
        successData: [{
            onyxMethod: 'merge',
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
            value: {
                loading: false,
                error: '',
            },
        }],
        failureData: [{
            onyxMethod: 'merge',
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
            value: {
                loading: false,
                error: Localize.translateLocal('bankAccount.error.noBankAccountAvailable'),
            },
        }],
    });
}

/**
 * @returns {String}
 */
function getBankName() {
    return bankName;
}

export {
    clearPlaidBankAccountsAndToken,
    openPlaidBankAccountSelector,
    openPlaidBankLogin,
    getBankName,
};
