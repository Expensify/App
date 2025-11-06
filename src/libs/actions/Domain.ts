import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Fetches a validation code that the user is supposed to put in the domain's DNS records to verify it
 */
function getDomainValidationCode(accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidateCodeLoading: true, validateCodeError: null},
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidateCodeLoading: null},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {
                isValidateCodeLoading: null,
                validateCodeError: getMicroSecondOnyxErrorWithTranslationKey('domain.verifyDomain.codeFetchError'),
            },
        },
    ];

    API.read(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, {domainName}, {optimisticData, successData, failureData});
}

/**
 * Checks if the validation code is present in the domain's DNS records to mark the domain as validated and the user as a verified admin
 */
function validateDomain(accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidationPending: true, domainValidationError: null},
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidationPending: null},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {
                isValidationPending: null,
                domainValidationError: getMicroSecondOnyxErrorWithTranslationKey('domain.verifyDomain.genericError'),
            },
        },
    ];

    API.write(WRITE_COMMANDS.VALIDATE_DOMAIN, {domainName}, {optimisticData, successData, failureData});
}

function resetDomainValidationError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {domainValidationError: null});
}

export {getDomainValidationCode, validateDomain, resetDomainValidationError};
