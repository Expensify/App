import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ACHAccount} from '@src/types/onyx/Policy';

function resetNonUSDBankAccount(policyID: string | undefined, achAccount: OnyxEntry<ACHAccount>, bankAccountID?: number) {
    if (!policyID) {
        throw new Error('Missing policy when attempting to reset');
    }

    // If there's no bankAccountID, we reset locally without making an API call
    if (!bankAccountID) {
        const updateData = [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    achAccount: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA,
            },
        ];
        Onyx.update(updateData as OnyxUpdate[]);
        return;
    }

    API.write(
        WRITE_COMMANDS.RESTART_BANK_ACCOUNT_SETUP,
        {policyID, bankAccountID},
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
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        achAccount: null,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA,
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {isLoading: false, pendingAction: null},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        achAccount,
                    },
                },
            ],
        },
    );
}

export default resetNonUSDBankAccount;
