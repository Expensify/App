import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as PlaidDataProps from '@pages/ReimbursementAccount/plaidDataPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

/**
 * Reset user's reimbursement account. This will delete the bank account.
 */
function resetFreePlanBankAccount(bankAccountID: number, session: OnyxEntry<OnyxTypes.Session>) {
    if (!bankAccountID) {
        throw new Error('Missing bankAccountID when attempting to reset free plan bank account');
    }
    if (!session?.email) {
        throw new Error('Missing credentials when attempting to reset free plan bank account');
    }

    API.write(
        WRITE_COMMANDS.RESTART_BANK_ACCOUNT_SETUP,
        {
            bankAccountID,
            ownerEmail: session.email,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {
                        shouldShowResetModal: false,
                        isLoading: true,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        achData: null,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.ONFIDO_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.ONFIDO_APPLICANT_ID,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.PLAID_DATA,
                    value: PlaidDataProps.plaidDataDefaultProps,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.PLAID_LINK_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: ReimbursementAccountProps.reimbursementAccountDefaultProps,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
                    value: {},
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {isLoading: false, pendingAction: null},
                },
            ],
        },
    );
}

export default resetFreePlanBankAccount;
