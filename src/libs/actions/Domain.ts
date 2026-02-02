import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    AddAdminToDomainParams,
    AddMemberToDomainParams,
    DeleteDomainMemberParams,
    DeleteDomainParams,
    RemoveDomainAdminParams,
    SetTechnicalContactEmailParams,
    ToggleConsolidatedDomainBillingParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, DomainSecurityGroup, UserSecurityGroupData} from '@src/types/onyx';
import {PendingAction} from '@src/types/onyx/OnyxCommon';
import type PrefixedRecord from '@src/types/utils/PrefixedRecord';
import type {ScimTokenWithState} from './ScimToken/ScimTokenUtils';
import {ScimTokenState} from './ScimToken/ScimTokenUtils';

/**
 * Fetches a validation code that the user is supposed to put in the domain's DNS records to verify it
 */
function getDomainValidationCode(accountID: number, domainName: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidateCodeLoading: true, validateCodeError: null},
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidateCodeLoading: null},
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidationPending: true, domainValidationError: null, hasValidationSucceeded: null},
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isValidationPending: null, hasValidationSucceeded: true},
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SAML_METADATA | typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SAML_METADATA>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SAML_METADATA>> = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SAML_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`,
            value: {
                isLoading: null,
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SAML_METADATA>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isSamlEnabledLoading: null},
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`,
            value: {isSamlRequiredLoading: null},
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.CREATE_DOMAIN_FORM,
            value: {hasCreationSucceeded: null, isLoading: true},
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_FORM>> = [
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

function setPrimaryContact(domainAccountID: number, newTechnicalContactEmail: string, currentTechnicalContactEmail?: string) {
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>
    > = [
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                technicalContactEmailErrors: null,
            },
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                technicalContactEmail: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                technicalContactEmailErrors: null,
            },
        },
    ];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>
    > = [
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
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                technicalContactEmailErrors: getMicroSecondOnyxErrorWithTranslationKey('domain.admins.setPrimaryContactError'),
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

    const params: SetTechnicalContactEmailParams = {
        domainAccountID,
        technicalContactEmail: newTechnicalContactEmail,
    };

    API.write(WRITE_COMMANDS.SET_TECHNICAL_CONTACT_EMAIL, params, {optimisticData, successData, failureData});
}

function clearSetPrimaryContactError(domainAccountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        technicalContactEmailErrors: null,
    });
}

function toggleConsolidatedDomainBilling(domainAccountID: number, domainName: string, useTechnicalContactBillingCard: boolean) {
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>
    > = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
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
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>
    > = [
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

    const params: ToggleConsolidatedDomainBillingParams = {
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

function addAdminToDomain(domainAccountID: number, accountID: number, targetEmail: string, domainName: string) {
    const PERMISSION_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${accountID}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [PERMISSION_KEY]: accountID,
            } as PrefixedRecord<typeof CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX, number>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                admin: {
                    [accountID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                adminErrors: {
                    [accountID]: {
                        errors: null,
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [PERMISSION_KEY]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                adminErrors: {
                    [accountID]: {
                        errors: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                admin: {
                    [accountID]: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                adminErrors: {
                    [accountID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('domain.admins.addAdminError'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                admin: {
                    [accountID]: null,
                },
            },
        },
    ];

    const params: AddAdminToDomainParams = {
        domainName,
        targetEmail,
    };

    API.write(WRITE_COMMANDS.ADD_DOMAIN_ADMIN, params, {optimisticData, successData, failureData});
}

/**
 * Removes an error and pending actions after trying to add admin
 */
function clearAdminError(domainAccountID: number, accountID: number) {
    const PERMISSION_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${accountID}`;

    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        [PERMISSION_KEY]: null,
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        adminErrors: {
            [accountID]: null,
        },
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        admin: {
            [accountID]: null,
        },
    });
}
/**
 * Removes admin access for a domain member
 */
function revokeDomainAdminAccess(domainAccountID: number, accountID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                admin: {
                    [accountID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                admin: {
                    [accountID]: {
                        pendingAction: null,
                    },
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                admin: {
                    [accountID]: {
                        pendingAction: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                adminErrors: {
                    [accountID]: {errors: getMicroSecondOnyxErrorWithTranslationKey('domain.admins.error.removeAdmin')},
                },
            },
        },
    ];

    const parameters: RemoveDomainAdminParams = {
        domainAccountID,
        targetAccountID: accountID,
    };

    API.write(WRITE_COMMANDS.REMOVE_DOMAIN_ADMIN, parameters, {optimisticData, successData, failureData});
}

/**
 * Removes the domain
 */
function resetDomain(domainAccountID: number, domainName: string, domain: Domain) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: null,
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                errors: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: domain,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('domain.admins.error.removeDomain'),
            },
        },
    ];

    const parameters: DeleteDomainParams = {
        domainAccountID,
        domainName,
    };

    API.write(WRITE_COMMANDS.DELETE_DOMAIN, parameters, {optimisticData, successData, failureData});
}

/**
 * Clears errors after trying to reset the domain
 */
function clearDomainErrors(domainAccountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        errors: null,
    });
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        pendingAction: null,
    });
}

function addMemberToDomain(domainAccountID: number, email: string, defaultSecurityGroupID: string) {
    const DOMAIN_SECURITY_GROUP = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${defaultSecurityGroupID}`;
    const optimisticAccountID = generateAccountID(email);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [DOMAIN_SECURITY_GROUP]: {
                    shared: {
                        [optimisticAccountID]: 'read',
                    },
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.PERSONAL_DETAILS_LIST}`,
            value: {
                [optimisticAccountID]: {
                    accountID: optimisticAccountID,
                    login: email,
                    isOptimisticPersonalDetail: true,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [email]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [email]: {
                        errors: null,
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [email]: {
                        pendingAction: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [email]: {
                        errors: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.PERSONAL_DETAILS_LIST}`,
            value: {
                [optimisticAccountID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [DOMAIN_SECURITY_GROUP]: {
                    shared: {
                        [optimisticAccountID]: null,
                    },
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>>,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [email]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('domain.members.error.addMember'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [email]: {
                        pendingAction: null,
                    },
                },
            },
        },
    ];

    const params: AddMemberToDomainParams = {
        email,
        domainAccountID,
    };

    API.write(WRITE_COMMANDS.ADD_DOMAIN_MEMBER, params, {optimisticData, successData, failureData});
}

/**
 * Removes an error and pending actions after trying to add member. It clears errors for both email and accountID
 */
function clearDomainMemberError(domainAccountID: number, accountID: number, email: string, pendingAction: PendingAction, defaultSecurityGroupID: string) {
    const DOMAIN_SECURITY_GROUP = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${defaultSecurityGroupID}`;

    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
            [DOMAIN_SECURITY_GROUP]: {
                shared: {
                    [accountID]: null,
                },
            },
        } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>>);
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        memberErrors: {
            [email]: null,
            [accountID]: null,
        },
    });
}

/** Sends a request to remove a user from a domain and close their account */
function closeUserAccount(domainAccountID: number, domain: string, accountID: number, targetEmail: string, securityGroupsData: UserSecurityGroupData, overrideProcessingReports = false) {
    const failureValue: PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>> = {};

    if (securityGroupsData) {
        const groupID = securityGroupsData.key;

        failureValue[groupID] = {
            shared: {
                [accountID]: 'read',
            },
        };
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                members: {[targetEmail]: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                members: {[targetEmail]: null},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [targetEmail]: {errors: getMicroSecondOnyxErrorWithTranslationKey('domain.members.error.removeMember')},
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: failureValue,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                members: {[targetEmail]: null},
            },
        },
    ];

    const parameters: DeleteDomainMemberParams = {
        domain,
        targetEmail,
        overrideProcessingReports,
    };

    API.write(WRITE_COMMANDS.DELETE_DOMAIN_MEMBER, parameters, {optimisticData, successData, failureData});
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
    addAdminToDomain,
    clearAdminError,
    revokeDomainAdminAccess,
    resetDomain,
    clearDomainErrors,
    addMemberToDomain,
    clearDomainMemberError,
    closeUserAccount,
};
