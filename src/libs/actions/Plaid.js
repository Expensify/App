import getPlaidLinkTokenParameters from '../getPlaidLinkTokenParameters';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import * as PlaidDataProps from '../../pages/ReimbursementAccount/plaidDataPropTypes';

/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 * @param {Boolean} allowDebit
 * @param {Number} bankAccountID
 */
function openPlaidBankLogin(allowDebit, bankAccountID) {
    const params = getPlaidLinkTokenParameters();
    params.allowDebit = allowDebit;
    params.bankAccountID = bankAccountID;
    const optimisticData = [{
        onyxMethod: CONST.ONYX.METHOD.SET,
        key: ONYXKEYS.PLAID_DATA,
        value: {...PlaidDataProps.plaidDataDefaultProps, isLoading: true},
    }, {
        onyxMethod: CONST.ONYX.METHOD.SET,
        key: ONYXKEYS.PLAID_LINK_TOKEN,
        value: '',
    }, {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        value: {
            plaidAccountID: '',
        },
    }];

    API.read('OpenPlaidBankLogin', params, {optimisticData});
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
            },
        }],
    });
}

export {
    openPlaidBankAccountSelector,
    openPlaidBankLogin,
};
