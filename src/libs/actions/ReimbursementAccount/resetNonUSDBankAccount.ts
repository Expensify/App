import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ACHAccount} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

function resetNonUSDBankAccount(policyID: string | undefined, achAccount: OnyxEntry<ACHAccount>, bankAccountID?: number, lastUsedPaymentMethod?: OnyxTypes.LastPaymentMethodType) {
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

    const isLastUsedPaymentMethodVBBA = lastUsedPaymentMethod?.expense?.name === CONST.IOU.PAYMENT_TYPE.VBBA;
    const isPreviousLastUsedPaymentMethodVBBA = lastUsedPaymentMethod?.lastUsed?.name === CONST.IOU.PAYMENT_TYPE.VBBA;

    const onyxData: OnyxData = {
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
    };

    if (isLastUsedPaymentMethodVBBA) {
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: {
                [policyID]: {
                    expense: {
                        name: isPreviousLastUsedPaymentMethodVBBA ? '' : lastUsedPaymentMethod?.lastUsed.name,
                    },
                    lastUsed: {
                        name: isPreviousLastUsedPaymentMethodVBBA ? '' : lastUsedPaymentMethod?.lastUsed.name,
                    },
                },
            },
        });
    }

    API.write(WRITE_COMMANDS.RESTART_BANK_ACCOUNT_SETUP, {policyID, bankAccountID}, onyxData);
}

export default resetNonUSDBankAccount;
