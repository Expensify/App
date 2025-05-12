import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {SetVacationDelegateParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {VacationDelegate} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

let vacationDelegate: VacationDelegate;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
    callback: (val) => {
        vacationDelegate = val ?? {};
    },
});

function setVacationDelegate(creator: string, delegate: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator,
                delegate,
                errors: null,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: null,
                pendingAction: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator: null,
                delegate: null,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('statusPage.vacationDelegateError'),
                pendingAction: null,
            },
        },
    ];

    const parameters: SetVacationDelegateParams = {
        creator,
        delegate,
    };

    API.write(WRITE_COMMANDS.SET_VACATION_DELEGATE, parameters, {optimisticData, successData, failureData});
}

function deleteVacationDelegate() {
    if (isEmptyObject(vacationDelegate)) {
        return;
    }

    const {creator, delegate} = vacationDelegate;
    const optimisticData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: null,
                pendingAction: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator,
                delegate,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('statusPage.vacationDelegateError'),
                pendingAction: null,
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_VACATION_DELEGATE, null, {optimisticData, successData, failureData});
}

export {setVacationDelegate, deleteVacationDelegate};
