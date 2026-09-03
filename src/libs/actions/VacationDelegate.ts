import * as API from '@libs/API';
import type {SetVacationDelegateParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {VacationDelegate} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type SetVacationDelegateOptions = {
    creator: string;
    delegate: string;
    currentDelegate?: string;
    shouldOverridePolicyDiffWarning?: boolean;
};

async function setVacationDelegate({creator, delegate, currentDelegate, shouldOverridePolicyDiffWarning = false}: SetVacationDelegateOptions) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator,
                delegate,
                errors: null,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                previousDelegate: currentDelegate,
                policyDiff: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: null,
                pendingAction: null,
                previousDelegate: null,
                policyDiff: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('statusPage.vacationDelegateError'),
                pendingAction: null,
            },
        },
    ];

    const parameters: SetVacationDelegateParams = {
        creator,
        vacationDelegateEmail: delegate,
        overridePolicyDiffWarning: shouldOverridePolicyDiffWarning,
    };

    // Once the policy diff warning has been overridden there is nothing left to read from the response, so use a persisted write.
    // That keeps this request in the sequential queue behind any workspace invitations sent alongside it, so going offline
    // can no longer drop the delegate while the invites are replayed on reconnect.
    if (shouldOverridePolicyDiffWarning) {
        API.write(WRITE_COMMANDS.SET_VACATION_DELEGATE, parameters, {optimisticData, successData, failureData});
        return;
    }

    // We need to read the API response for capturing a policy diff warning. This is the other half of the branch above, not a chained call.
    // No failureData: the API layer treats the 305 policy diff warning as a failure, and any error written for this request lights up a red brick
    // road on the profile page, which reads as something being broken. The caller reports every outcome from the returned response instead.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method, rulesdir/no-multiple-api-calls
    const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE, parameters, {optimisticData, successData});

    if (response?.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING && response.data?.policyDiff) {
        // Keep the optimistic delegate so the flow can continue into the missing workspaces step.
        await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
            policyDiff: response.data.policyDiff,
            pendingAction: null,
        });
    }

    return response;
}

function deleteVacationDelegate(vacationDelegate?: VacationDelegate) {
    if (isEmptyObject(vacationDelegate)) {
        return;
    }

    const {creator, delegate} = vacationDelegate;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator: null,
                delegate: null,
                errors: null,
                previousDelegate: vacationDelegate?.delegate,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: null,
                pendingAction: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator,
                delegate,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('statusPage.vacationDelegateError'),
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_VACATION_DELEGATE, null, {optimisticData, successData, failureData});
}

function clearVacationDelegateError(previousDelegate?: string) {
    return Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
        errors: null,
        pendingAction: null,
        delegate: previousDelegate ?? null,
        previousDelegate: null,
        policyDiff: null,
    });
}

export {setVacationDelegate, deleteVacationDelegate, clearVacationDelegateError};
