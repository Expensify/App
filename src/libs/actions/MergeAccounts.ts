import * as API from '@libs/API';
import type {GetValidateCodeForAccountMergeParams, MergeWithValidateCodeParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {appendCountryCode} from '@libs/LoginUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

/** Keep code requests and merge submissions pointed at the same account. */
function normalizeMergeAccountLogin(email: string, countryCode: number): string {
    const trimmedEmail = email.trim();
    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(trimmedEmail), countryCode));
    return parsedPhoneNumber.possible && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : trimmedEmail.toLowerCase();
}

function requestValidationCodeForAccountMerge(email: string, validateCodeResent = false, countryCode: number = CONST.DEFAULT_COUNTRY_CODE) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: true,
                    validateCodeSent: false,
                    validateCodeResent: false,
                    errors: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: false,
                    validateCodeSent: !validateCodeResent,
                    validateCodeResent,
                    errors: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: false,
                    validateCodeSent: false,
                    validateCodeResent: false,
                },
            },
        },
    ];

    const parameters: GetValidateCodeForAccountMergeParams = {
        email: normalizeMergeAccountLogin(email, countryCode),
    };

    API.write(WRITE_COMMANDS.GET_VALIDATE_CODE_FOR_ACCOUNT_MERGE, parameters, {optimisticData, successData, failureData});
}

function clearGetValidateCodeForAccountMerge() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {
        getValidateCodeForAccountMerge: {
            errors: null,
            validateCodeSent: false,
            validateCodeResent: false,
            isLoading: false,
        },
    });
}

function mergeWithValidateCode(email: string, validateCode: string, countryCode: number = CONST.DEFAULT_COUNTRY_CODE) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
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
        email: normalizeMergeAccountLogin(email, countryCode),
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
