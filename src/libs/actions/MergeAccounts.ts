import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetValidateCodeForAccountMergeParams, MergeWithValidateCodeParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
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
                mergeAccount: {
                    email,
                    getValidateCodeForAccountMerge: {
                        isLoading: true,
                        validateCodeSent: false,
                        errors: null,
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeAccount: {
                    email,
                    getValidateCodeForAccountMerge: {
                        isLoading: false,
                        validateCodeSent: true,
                        errors: null,
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeAccount: {
                    email,
                    getValidateCodeForAccountMerge: {
                        isLoading: false,
                        validateCodeSent: false,
                        // Todo: This is a generic error message. Backend should replace it with a more specific error message.
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('mergeAccountsPage.requestValidationCodeForAccountMerge.genericError'),
                    },
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

function clearRequestValidationCodeForAccountMerge() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {
        mergeAccount: {
            getValidateCodeForAccountMerge: {
                errors: null,
            },
        },
    });
}

function mergeWithValidateCode(email: string, validateCode: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeAccount: {
                    email,
                    mergeWithValidateCode: {
                        isLoading: true,
                        accountMerged: false,
                        errors: null,
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeAccount: {
                    email,
                    mergeWithValidateCode: {
                        isLoading: false,
                        accountMerged: true,
                        errors: null,
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                mergeAccount: {
                    email,
                    mergeWithValidateCode: {
                        isLoading: false,
                        accountMerged: false,
                        // Todo: This is a generic error message. Backend should replace it with a more specific error message.
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('mergeAccountsPage.requestValidationCodeForAccountMerge.genericError'),
                    },
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
        mergeAccount: {
            mergeWithValidateCode: {
                errors: null,
            },
        },
    });
}

export {requestValidationCodeForAccountMerge, clearRequestValidationCodeForAccountMerge, mergeWithValidateCode, clearMergeWithValidateCode};
