import Onyx from 'react-native-onyx';
import _ from 'underscore';
import getPlaidLinkTokenParameters from '../getPlaidLinkTokenParameters';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as PlaidDataProps from '../../pages/ReimbursementAccount/plaidDataPropTypes';

/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 * @param {Boolean} allowDebit
 * @param {Number} bankAccountID
 * @param {String} [policyID]
 */
function openPlaidBankLogin(allowDebit, bankAccountID, policyID = '') {
    const params = getPlaidLinkTokenParameters();
    params.allowDebit = allowDebit;
    params.bankAccountID = bankAccountID;
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PLAID_DATA,
            value: {...PlaidDataProps.plaidDataDefaultProps, isLoading: true},
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PLAID_LINK_TOKEN,
            value: '',
        },
    ];

    if (!_.isEmpty(policyID)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT_DRAFT}${policyID}`,
            value: {
                plaidAccountID: '',
            },
        });
    }

    API.read('OpenPlaidBankLogin', params, {optimisticData});
}

/**
 * @param {String} publicToken
 * @param {String} bankName
 * @param {Boolean} allowDebit
 * @param {Number} bankAccountID
 */
function openPlaidBankAccountSelector(publicToken, bankName, allowDebit, bankAccountID) {
    API.read(
        'OpenPlaidBankAccountSelector',
        {
            publicToken,
            allowDebit,
            bank: bankName,
            bankAccountID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PLAID_DATA,
                    value: {
                        isLoading: true,
                        errors: null,
                        bankName,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PLAID_DATA,
                    value: {
                        isLoading: false,
                        errors: null,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PLAID_DATA,
                    value: {
                        isLoading: false,
                    },
                },
            ],
        },
    );
}

export {openPlaidBankAccountSelector, openPlaidBankLogin};
