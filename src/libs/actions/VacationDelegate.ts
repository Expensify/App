import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {SetVacationDelegateParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {VacationDelegate} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function setVacationDelegate(creator: string, delegate: string, shouldOverridePolicyDiffWarning = false, currentDelegate?: string) {
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
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                errors: ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('statusPage.vacationDelegateError'),
            },
        },
    ];

    const parameters: SetVacationDelegateParams = {
        creator,
        vacationDelegateEmail: delegate,
        overridePolicyDiffWarning: shouldOverridePolicyDiffWarning,
    };

    // We need to read the API response for showing a warning if there is a policy diff warning.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE, parameters, {optimisticData, successData, failureData});
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
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                errors: ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('statusPage.vacationDelegateError'),
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_VACATION_DELEGATE, null, {optimisticData, successData, failureData});
}

function clearVacationDelegateError(previousDelegate?: string) {
    Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
        errors: null,
        pendingAction: null,
        delegate: previousDelegate ?? null,
        previousDelegate: null,
    });
}

export {setVacationDelegate, deleteVacationDelegate, clearVacationDelegateError};
