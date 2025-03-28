import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

let allPolicies: OnyxCollection<OnyxTypes.Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

function resetNonUSDBankAccount(policyID: string | undefined) {
    if (!policyID) {
        throw new Error('Missing Policy ID when attempting to reset');
    }

    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? ({} as OnyxTypes.Policy);

    API.write(
        WRITE_COMMANDS.RESET_BANK_ACCOUNT_SETUP,
        {policyID},
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
                        achAccount: policy?.achAccount,
                    },
                },
            ],
        },
    );
}

export default resetNonUSDBankAccount;
