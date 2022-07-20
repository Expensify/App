import getPlaidLinkTokenParameters from '../getPlaidLinkTokenParameters';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as Localize from '../Localize';

/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 * @param {Boolean} allowDebit
 * @param {Number} bankAccountID
 */
function openPlaidBankLogin(allowDebit, bankAccountID) {
    const params = getPlaidLinkTokenParameters();
    params.allowDebit = allowDebit;
    params.bankAccountID = bankAccountID;
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
    openPlaidBankAccountSelector,
    openPlaidBankLogin,
};
