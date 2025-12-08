import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import type {ACHAccount} from '@src/types/onyx/Policy';

function resetNonUSDBankAccount(policyID: string | undefined, achAccount: OnyxEntry<ACHAccount>, shouldResetLocally: boolean, bankAccountList?: BankAccountList) {
    if (!policyID) {
        throw new Error('Missing policy when attempting to reset');
    }

    const bankAccountID = achAccount?.bankAccountID ?? '';
    const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : {};

    if (shouldResetLocally) {
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
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    value: {
                        [bankAccountID]: null,
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
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    value: {
                        [bankAccountID]: bankAccount,
                    },
                },
            ],
        },
    );
}

export default resetNonUSDBankAccount;
