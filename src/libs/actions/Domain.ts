import Onyx from 'react-native-onyx';
import type {OnyxMergeInput, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {SetTechnicalContactEmailParams, ToggleConsolidatedDomainBillingParams} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getAuthToken} from '@libs/Network/NetworkStore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ScimTokenWithState} from './ScimToken/ScimTokenUtils';
import {ScimTokenState} from './ScimToken/ScimTokenUtils';

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
            value: {isValidationPending: true, domainValidationError: null, hasValidationSucceeded: null},
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidationPending: null, hasValidationSucceeded: true},
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
 * For resetting domain validation errors when opening the verification flow
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
 * Sets SAML identity provider metadata for a domain
 */
function setSamlIdentity(accountID: number, domainName: string, metaIdentity: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`,
            value: {
                samlMetadataError: null,
                metaIdentity,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {
                samlRequiredError: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`,
            value: {
                samlMetadataError: getMicroSecondOnyxErrorWithTranslationKey('domain.samlConfigurationDetails.setMetadataGenericError'),
            },
        },
    ];

    API.write(WRITE_COMMANDS.SET_SAML_IDENTITY, {domainName, metaIdentity}, {optimisticData, failureData});
}

/**
 * Fetches the domain's SAML metadata
 */
function getSamlSettings(accountID: number, domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`,
            value: {
                isLoading: true,
                samlMetadataError: null,
                errors: null,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`,
            value: {
                isLoading: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`,
            value: {
                isLoading: null,
                errors: getMicroSecondOnyxErrorWithTranslationKey('domain.samlConfigurationDetails.fetchError'),
            },
        },
    ];

    API.read(READ_COMMANDS.GET_SAML_SETTINGS, {domainName}, {optimisticData, successData, failureData});
}

/**
 * Sets whether logging in via SAML is enabled for the domain
 */
function setSamlEnabled({enabled, accountID, domainName}: {enabled: boolean; accountID: number; domainName: string}) {
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
                isSamlEnabledLoading: true,
                samlEnabledError: null,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isSamlEnabledLoading: null},
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {
                isSamlEnabledLoading: null,
                samlEnabledError: getMicroSecondOnyxErrorWithTranslationKey('domain.samlLogin.enableError'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${accountID}`,
            value: {
                settings: {
                    samlEnabled: !enabled,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_SAML_ENABLED, {enabled, domainName}, {optimisticData, successData, failureData});
}

/**
 * For dismissing SAML enabled errors
 * Resets the errors only on the client's side, no server call is performed
 */
function resetSamlEnabledError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {samlEnabledError: null});
}

/**
 * Sets whether logging in via SAML is required for the domain
 */
function setSamlRequired({required, accountID, domainName, metaIdentity}: {required: boolean; accountID: number; domainName: string; metaIdentity: string | undefined}) {
    if (required && !metaIdentity) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {samlRequiredError: getMicroSecondOnyxErrorWithTranslationKey('domain.samlLogin.requireWithEmptyMetadataError')});
        return;
    }

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
                isSamlRequiredLoading: true,
                samlRequiredError: null,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isSamlRequiredLoading: null},
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isSamlRequiredLoading: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${accountID}`,
            value: {
                settings: {
                    samlRequired: !required,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_SAML_REQUIRED, {enabled: required, domainName}, {optimisticData, successData, failureData});
}

/**
 * For dismissing SAML required errors
 * Resets the errors only on the client's side, no server call is performed
 */
function resetSamlRequiredError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {samlRequiredError: null});
}

/**
 * Fetches the decrypted Okta SCIM token for the domain
 */
async function getScimToken(domainName: string): Promise<ScimTokenWithState> {
    const genericError = "Couldn't fetch SCIM token";

    try {
        // eslint-disable-next-line rulesdir/no-api-side-effects-method -- we cannot store the token in onyx for security reasons
        const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_SCIM_TOKEN, {domain: domainName});

        if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return {
                state: ScimTokenState.ERROR,
                error: response?.message ? response.message : genericError,
            };
        }

        return {
            state: ScimTokenState.VALUE,
            value: (response as {SCIMToken: string}).SCIMToken,
        };
    } catch (error) {
        return {
            state: ScimTokenState.ERROR,
            error: genericError,
        };
    }
}

/** Sends request for claiming a domain */
function createDomain(domainName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.CREATE_DOMAIN_FORM,
            value: {hasCreationSucceeded: null, isLoading: true},
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.CREATE_DOMAIN_FORM,
            value: {hasCreationSucceeded: true, isLoading: null},
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.CREATE_DOMAIN_FORM,
            value: {isLoading: null},
        },
    ];

    API.write(WRITE_COMMANDS.CREATE_DOMAIN, {domainName}, {optimisticData, successData, failureData});
}

/**
 * For resetting createDomain form data
 * Resets it only on the client's side, no server call is performed
 */
function resetCreateDomainForm() {
    Onyx.merge(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, null);
}

function setPrimaryContact(domainAccountID: number, newTechnicalContactAccountID: number, newTechnicalContactEmail: string, currentTechnicalContactEmail?: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    technicalContactEmail: newTechnicalContactEmail,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                technicalContactEmail: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                technicalContactEmail: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    technicalContactEmail: currentTechnicalContactEmail,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                technicalContactEmail: null,
            },
        },
    ];

    const authToken = getAuthToken();
    const params: SetTechnicalContactEmailParams = {
        authToken,
        domainAccountID,
        technicalContactAccountID: newTechnicalContactAccountID,
    };

    API.write(WRITE_COMMANDS.SET_TECHNICAL_CONTACT_EMAIL, params, {optimisticData, successData, failureData});
}

function clearSetPrimaryContactError(domainAccountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        technicalContactEmailErrors: null,
    });
}

function toggleConsolidatedDomainBilling(domainAccountID: number, domainName: string, useTechnicalContactBillingCard: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    useTechnicalContactBillingCard,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                useTechnicalContactBillingCard: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                useTechnicalContactBillingCardErrors: null,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                useTechnicalContactBillingCard: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                useTechnicalContactBillingCardErrors: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    useTechnicalContactBillingCard: !useTechnicalContactBillingCard,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                useTechnicalContactBillingCardErrors: getMicroSecondOnyxErrorWithTranslationKey('domain.admins.consolidatedDomainBillingError'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                useTechnicalContactBillingCard: null,
            },
        },
    ];

    const authToken = getAuthToken();
    const params: ToggleConsolidatedDomainBillingParams = {
        authToken,
        domainAccountID,
        domainName,
        enabled: useTechnicalContactBillingCard,
    };

    API.write(WRITE_COMMANDS.TOGGLE_CONSOLIDATED_DOMAIN_BILLING, params, {optimisticData, failureData, successData});
}

function clearToggleConsolidatedDomainBillingErrors(domainAccountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        useTechnicalContactBillingCardErrors: null,
    });
}

/** Sends a request to remove user from a domain and close their account */
function closeUserAccount(domainAccountID: number, securityGroupIDs: number[], accountID: number, force = false) {
    const optimisticValue: OnyxMergeInput<`domain_${string}`> = {};
    for (const groupID of securityGroupIDs) {
        // @ts-expect-error
        optimisticValue[`${ONYXKEYS.COLLECTION.DOMAIN_SECURITY_GROUP}_${groupID}`] = {
            shared: {
                [accountID]: null,
            },
        };
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: optimisticValue,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                members: {[accountID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                members: {[accountID]: null},
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                members: {[accountID]: null},
            },
        },
        // DEV
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [accountID]: {errors: {[Date.now()]: 'Unable to remove this user. Please try again.'}},
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                expensify_securityGroup_1: {
                    shared: {
                        [accountID]: 'read',
                    },
                },
            },
        },
    ];
    API.write('', {force}, {optimisticData, successData, failureData});
}

function clearDomainMemberError(domainAccountID: number, accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        memberErrors: {
            [accountID]: null,
        },
    });
}

export {
    getDomainValidationCode,
    validateDomain,
    resetDomainValidationError,
    openDomainInitialPage,
    getSamlSettings,
    setSamlEnabled,
    resetSamlEnabledError,
    setSamlRequired,
    resetSamlRequiredError,
    setSamlIdentity,
    getScimToken,
    createDomain,
    resetCreateDomainForm,
    setPrimaryContact,
    clearSetPrimaryContactError,
    toggleConsolidatedDomainBilling,
    clearToggleConsolidatedDomainBillingErrors,
    closeUserAccount,
    clearDomainMemberError,
};
