import getPlaidLinkTokenParameters from '../getPlaidLinkTokenParameters';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Localize from '../Localize';
import CONST from '../../CONST';

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
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PLAID_DATA,
            value: {
                isLoading: true,
                error: '',
                bankName,
            },
        }],
        successData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PLAID_DATA,
            value: {
                isLoading: false,
                error: '',
            },
        }],
        failureData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PLAID_DATA,
            value: {
                isLoading: false,
                error: Localize.translateLocal('bankAccount.error.noBankAccountAvailable'),
            },
        }],
    });
}

export {
    openPlaidBankAccountSelector,
    openPlaidBankLogin,
};
