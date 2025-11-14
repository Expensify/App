import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SamlMetadata} from '@src/types/onyx';

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

/**
 * For resetting domain validation errors, when opening the verification flow
 * Resets the errors only on the client's side, no server call is performed
 */
function resetDomainValidationError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {domainValidationError: null});
}

/**
 * Fetches the latest domain data from the server,
 * when accessing the domain initial page
 */
function openDomainInitialPage(domainName: string) {
    API.read(READ_COMMANDS.OPEN_DOMAIN_INITIAL_PAGE, {domainName});
}

/**
 * Sets SAML metadata for a domain, e.g. the identity provider xml
 */
function setSamlMetadata(accountID: number, domainName: string, settings: Partial<SamlMetadata>) {
    API.write(WRITE_COMMANDS.SET_SAML_METADATA, {...settings, domainName});
}

/**
 * Fetches the domain's SAML metadata
 */
function getSamlSettings(accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_SAML_METADATA}${accountID}`,
            value: {
                isLoading: true,
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_SAML_METADATA}${accountID}`,
            value: {
                isLoading: null,
            },
        },
    ];

    API.read(READ_COMMANDS.GET_SAML_SETTINGS, {domainName}, {optimisticData, finallyData});
}

/**
 * Sets logging in through SAML as enabled/disabled for the emails belonging to the domain
 */
function setSamlEnabled(enabled: boolean, accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${accountID}`,
            value: {
                settings: {
                    samlEnabled: enabled,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {
                settings: {
                    isSamlEnabledLoading: true,
                },
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {settings: {isSamlEnabledLoading: null}},
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_SAML_ENABLED, {enabled, domainName}, {optimisticData, finallyData});
}

/**
 * Sets logging in through SAML as required or not for the emails belonging to the domain
 */
function setSamlRequired(required: boolean, accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${accountID}`,
            value: {
                settings: {
                    samlRequired: required,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {
                settings: {
                    isSamlRequiredLoading: true,
                },
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {settings: {isSamlRequiredLoading: null}},
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_SAML_REQUIRED, {required, domainName}, {optimisticData, finallyData});
}

/**
 * Fetches the decrypted Okta SCIM token for the domain
 */
function getScimToken(accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {
                settings: {
                    isScimTokenLoading: true,
                },
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {settings: {isScimTokenLoading: null}},
        },
    ];

    API.read(READ_COMMANDS.GET_SCIM_TOKEN, {domain: domainName}, {optimisticData, finallyData});
}

export {getDomainValidationCode, validateDomain, resetDomainValidationError, openDomainInitialPage, getSamlSettings, setSamlEnabled, setSamlRequired, setSamlMetadata, getScimToken};
