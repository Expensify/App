import * as API from '@libs/API';
import type {GetValidateCodeForAccountMergeParams, MergeAccountWithSAMLParams, MergeWithValidateCodeParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {parsePhoneNumber} from '@libs/PhoneNumber';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {OnyxUpdate} from 'react-native-onyx';

import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

function requestValidationCodeForAccountMerge(email: string, validateCodeResent = false, countryCode: number = CONST.DEFAULT_COUNTRY_CODE) {
    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(email), countryCode));
    const normalizedEmail = parsedPhoneNumber.possible && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : email.toLowerCase();

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
        email: normalizedEmail,
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

function mergeWithValidateCode(email: string, validateCode: string) {
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

// Deep-link handlers can fire the same URL more than once, but each mergeValidateCode is single-use.
let lastHandledMergeValidateCode: string | undefined;

function approveAccountMerge(validateCode: string, currentUserEmail: string) {
    if (validateCode === lastHandledMergeValidateCode) {
        return;
    }
    lastHandledMergeValidateCode = validateCode;

    const parameters: MergeAccountWithSAMLParams = {validateCode};

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.MERGE_ACCOUNT_WITH_SAML, parameters).then((response) => {
        const isSuccess = response?.jsonCode === CONST.JSON_CODE.SUCCESS;
        const login = (isSuccess ? response?.newAccountEmail : undefined) ?? currentUserEmail;
        const result = isSuccess ? CONST.MERGE_ACCOUNT_RESULTS.ADMIN_APPROVAL_SUCCESS : CONST.MERGE_ACCOUNT_RESULTS.ADMIN_APPROVAL_FAILED;
        Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(login, result, ROUTES.INBOX));
    });
}

export {requestValidationCodeForAccountMerge, clearGetValidateCodeForAccountMerge, mergeWithValidateCode, clearMergeWithValidateCode, approveAccountMerge};
