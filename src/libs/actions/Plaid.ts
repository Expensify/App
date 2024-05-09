import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {OpenPlaidBankAccountSelectorParams, OpenPlaidBankLoginParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import getPlaidLinkTokenParameters from '@libs/getPlaidLinkTokenParameters';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 */
function openPlaidBankLogin(allowDebit: boolean, bankAccountID: number) {
    // redirect_uri needs to be in kebab case convention because that's how it's passed to the backend
    const {redirectURI, androidPackage} = getPlaidLinkTokenParameters();

    const params: OpenPlaidBankLoginParams = {
        redirectURI,
        androidPackage,
        allowDebit,
        bankAccountID,
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PLAID_DATA,
            value: {...CONST.PLAID.DEFAULT_DATA, isLoading: true},
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PLAID_LINK_TOKEN,
            value: '',
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
            value: {
                plaidAccountID: '',
            },
        },
    ];

    API.read(READ_COMMANDS.OPEN_PLAID_BANK_LOGIN, params, {optimisticData});
}

function openPlaidBankAccountSelector(publicToken: string, bankName: string, allowDebit: boolean, bankAccountID: number) {
    const parameters: OpenPlaidBankAccountSelectorParams = {
        publicToken,
        allowDebit,
        bank: bankName,
        bankAccountID,
    };

    API.read(READ_COMMANDS.OPEN_PLAID_BANK_ACCOUNT_SELECTOR, parameters, {
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
    });
}

export {openPlaidBankAccountSelector, openPlaidBankLogin};
