import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetValidateCodeForAccountMergeParams, MergeWithValidateCodeParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type Session from '@src/types/onyx/Session';

let session: Session = {};
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => (session = value ?? {}),
});

function requestValidationCodeForAccountMerge(email: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: true,
                    validateCodeSent: false,
                    errors: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: false,
                    validateCodeSent: true,
                    errors: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: false,
                    validateCodeSent: false,
                },
            },
        },
    ];

    const parameters: GetValidateCodeForAccountMergeParams = {
        authToken: session.authToken ?? '',
        email,
    };

    API.write(WRITE_COMMANDS.GET_VALIDATE_CODE_FOR_ACCOUNT_MERGE, parameters, {optimisticData, successData, failureData});
}

function clearGetValidateCodeForAccountMerge() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {
        getValidateCodeForAccountMerge: {
            errors: null,
            validateCodeSent: false,
            isLoading: false,
        },
    });
}

function mergeWithValidateCode(email: string, validateCode: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeWithValidateCode: {
                    isLoading: true,
                    isAccountMerged: false,
                    errors: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeWithValidateCode: {
                    isLoading: false,
                    isAccountMerged: true,
                    errors: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeWithValidateCode: {
                    isLoading: false,
                    isAccountMerged: false,
                },
            },
        },
    ];

    const parameters: MergeWithValidateCodeParams = {
        email,
        validateCode,
    };

    API.write(WRITE_COMMANDS.MERGE_WITH_VALIDATE_CODE, parameters, {optimisticData, successData, failureData});
}

function clearMergeWithValidateCode() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {
        mergeWithValidateCode: {
            errors: null,
            isLoading: false,
            isAccountMerged: false,
        },
    });
}

export {requestValidationCodeForAccountMerge, clearGetValidateCodeForAccountMerge, mergeWithValidateCode, clearMergeWithValidateCode};
