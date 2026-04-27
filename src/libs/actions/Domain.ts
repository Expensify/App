import Onyx from 'react-native-onyx';
import type {NullishDeep, OnyxUpdate} from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {
    AddAdminToDomainParams,
    AddMemberToDomainParams,
    ChangeDomainSecurityGroupParams,
    DeleteDomainMemberParams,
    DeleteDomainParams,
    RemoveDomainAdminParams,
    ResetDomainMemberTwoFactorAuthParams,
    SetTechnicalContactEmailParams,
    SetTwoFactorAuthExemptEmailForDomainParams,
    SetVacationDelegateParams,
    ToggleConsolidatedDomainBillingParams,
    ToggleTwoFactorAuthRequiredForDomainParams,
    UpdateDomainSecurityGroupParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, DomainSecurityGroup, UserSecurityGroupData} from '@src/types/onyx';
import type {SecurityGroupKey} from '@src/types/onyx/Domain';
import type {DomainSecurityGroupErrors} from '@src/types/onyx/DomainErrors';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';
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

function addAdminToDomain(domainAccountID: number, accountID: number, targetEmail: string, domainName: string, isOptimisticAccount: boolean) {
    const PERMISSION_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${accountID}`;

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>
    > = [
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

    if (isOptimisticAccount) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.PERSONAL_DETAILS_LIST}`,
            value: {
                [accountID]: {
                    accountID,
                    login: targetEmail,
                    displayName: targetEmail,
                    isOptimisticPersonalDetail: true,
                },
            },
        });
    }

    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>
    > = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>> = [
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

    if (isOptimisticAccount) {
        const clearOptimisticPersonalDetails: OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST> = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.PERSONAL_DETAILS_LIST}`,
            value: {
                [accountID]: null,
            },
        };
        successData.push(clearOptimisticPersonalDetails);
        failureData.push(clearOptimisticPersonalDetails);
    }

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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>> = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>> = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
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
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
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
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
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
 * Clears domain related errors and pending actions.
 */
function clearDomainErrors(domainAccountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        errors: null,
    });
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        pendingAction: null,
    });
}

/**
 * Adds a member to a domain
 * @param domainAccountID Account ID of a domain
 * @param email Email of a user to be added
 * @param defaultSecurityGroupID Security group ID to be used for optimistic updates
 */
function addMemberToDomain(domainAccountID: number, email: string, defaultSecurityGroupID: string) {
    const DOMAIN_SECURITY_GROUP = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${defaultSecurityGroupID}`;
    const optimisticAccountID = generateAccountID(email);

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.COLLECTION.DOMAIN>
    > = [
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

    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.COLLECTION.DOMAIN>
    > = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>> = [
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
function clearDomainMemberError(domainAccountID: number, accountID: number, email: string, defaultSecurityGroupID: string, pendingAction?: PendingAction) {
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

    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        member: {
            [email]: null,
            [accountID]: null,
        },
    });
}

/**
 * Sends a request to remove a user from a domain and close their account
 * @param domainAccountID Account ID of a domain
 * @param domain Domain name
 * @param targetEmail Email of a user to be removed
 * @param securityGroupsData Data of a security group user is in
 * @param overrideProcessingReports "Force" flag. If true user will be removed regardless of if they have outstanding reports
 */
function closeUserAccount(domainAccountID: number, domain: string, targetEmail: string, securityGroupsData: UserSecurityGroupData, overrideProcessingReports = false) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {[targetEmail]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [targetEmail]: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {[targetEmail]: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [targetEmail]: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN>> = [
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
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {[targetEmail]: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: (securityGroupsData?.key
                ? {
                      [securityGroupsData.key]: securityGroupsData.securityGroup,
                  }
                : {}) as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>>,
        },
    ];

    const parameters: DeleteDomainMemberParams = {
        domain,
        domainAccountID,
        targetEmail,
        overrideProcessingReports,
    };

    API.write(WRITE_COMMANDS.DELETE_DOMAIN_MEMBER, parameters, {optimisticData, successData, failureData});
}

function toggleTwoFactorAuthRequiredForDomain(domainAccountID: number, domainName: string, twoFactorAuthRequired: boolean, twoFactorAuthCode?: string) {
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER
            | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS
            | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS
            | typeof ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    twoFactorAuthRequired: twoFactorAuthRequired ? true : undefined,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                twoFactorAuthRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                setTwoFactorAuthRequiredError: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
            value: null,
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                twoFactorAuthRequired: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                setTwoFactorAuthRequiredError: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
            value: null,
        },
    ];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER
            | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS
            | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS
            | typeof ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    twoFactorAuthRequired: !twoFactorAuthRequired,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                setTwoFactorAuthRequiredError: twoFactorAuthCode ? null : getMicroSecondOnyxErrorWithTranslationKey('domain.common.forceTwoFactorAuthError'),
            },
        },
        ...(twoFactorAuthCode
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
                      value: {
                          errors: getMicroSecondOnyxErrorWithTranslationKey('domain.common.forceTwoFactorAuthError'),
                      },
                  } as OnyxUpdate<typeof ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE>,
              ]
            : []),
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                twoFactorAuthRequired: null,
            },
        },
    ];

    const params: ToggleTwoFactorAuthRequiredForDomainParams = {
        domainAccountID,
        domainName,
        enabled: twoFactorAuthRequired,
        twoFactorAuthCode,
    };

    API.write(WRITE_COMMANDS.TOGGLE_TWO_FACTOR_AUTH_REQUIRED_FOR_DOMAIN, params, {optimisticData, failureData, successData});
}

function clearToggleTwoFactorAuthRequiredForDomainError(domainAccountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        setTwoFactorAuthRequiredError: null,
    });
}

function clearValidateDomainTwoFactorCodeError() {
    Onyx.set(ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE, null);
}

function setDomainVacationDelegate(domainAccountID: number, domainMemberAccountID: number, creator: string, vacationer: string, delegate: string, vacationDelegate?: BaseVacationDelegate) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`]: {
                    delegate,
                    creator,
                    previousDelegate: vacationDelegate?.delegate,
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX, BaseVacationDelegate>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [vacationer]: {
                        vacationDelegate: vacationDelegate?.delegate ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [vacationer]: {
                        vacationDelegateErrors: null,
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`]: {
                    previousDelegate: null,
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX, NullishDeep<BaseVacationDelegate>>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [vacationer]: {
                        vacationDelegateErrors: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [vacationer]: {
                        vacationDelegate: null,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [vacationer]: {
                        vacationDelegateErrors: getMicroSecondOnyxErrorWithTranslationKey('domain.members.error.vacationDelegate'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [vacationer]: {
                        vacationDelegate: null,
                    },
                },
            },
        },
    ];

    const parameters: SetVacationDelegateParams = {
        creator,
        vacationerEmail: vacationer,
        vacationDelegateEmail: delegate,
        overridePolicyDiffWarning: true,
        domainAccountID,
    };

    // We don't use the side effect here but `SetVacationDelegate` command is declared as side effect command
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE, parameters, {optimisticData, successData, failureData});
}

function deleteDomainVacationDelegate(domainAccountID: number, domainMemberAccountID: number, vacationer: string, vacationDelegate: BaseVacationDelegate) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`]: {
                    creator: null,
                    delegate: null,
                    previousDelegate: vacationDelegate?.delegate,
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX, NullishDeep<BaseVacationDelegate>>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [vacationer]: {
                        vacationDelegate: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [vacationer]: {
                        vacationDelegateErrors: null,
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [vacationer]: {
                        vacationDelegate: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [vacationer]: {
                        vacationDelegateErrors: null,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`]: vacationDelegate,
            } as PrefixedRecord<typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX, NullishDeep<BaseVacationDelegate>>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [vacationer]: {
                        vacationDelegate: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [vacationer]: {
                        vacationDelegateErrors: getMicroSecondOnyxErrorWithTranslationKey('domain.members.error.vacationDelegate'),
                    },
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_VACATION_DELEGATE, {vacationerEmail: vacationer, domainAccountID}, {optimisticData, successData, failureData});
}

function clearVacationDelegateError(domainAccountID: number, domainMemberAccountID: number, domainMemberEmail: string, previousDelegate?: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        [`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`]: {
            delegate: previousDelegate ?? null,
        },
    } as PrefixedRecord<typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX, NullishDeep<BaseVacationDelegate>>);

    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        memberErrors: {
            [domainMemberEmail]: {
                vacationDelegateErrors: null,
            },
        },
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        member: {
            [domainMemberEmail]: {
                vacationDelegate: null,
            },
        },
    });
}

function setTwoFactorAuthExemptEmailForDomain(domainAccountID: number, accountID: number, exemptEmails: string[], targetEmail: string, force2FA: boolean, twoFactorAuthCode?: string) {
    let newExemptEmails;
    if (force2FA) {
        newExemptEmails = exemptEmails.filter((email) => email !== targetEmail);
    } else if (twoFactorAuthCode === undefined) {
        newExemptEmails = [...exemptEmails, targetEmail];
    } else {
        newExemptEmails = exemptEmails;
    }

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER
            | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS
            | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS
            | typeof ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    twoFactorAuthExemptEmails: newExemptEmails,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [accountID]: {
                        twoFactorAuthExemptEmails: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [targetEmail]: {
                        twoFactorAuthExemptEmailsError: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
            value: null,
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS | typeof ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [accountID]: {
                        twoFactorAuthExemptEmails: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [targetEmail]: {
                        twoFactorAuthExemptEmailsError: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
            value: null,
        },
    ];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER
            | typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS
            | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS
            | typeof ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    twoFactorAuthExemptEmails: exemptEmails,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [accountID]: {
                        twoFactorAuthExemptEmails: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [targetEmail]: {
                        twoFactorAuthExemptEmailsError: twoFactorAuthCode ? null : getMicroSecondOnyxErrorWithTranslationKey('domain.common.forceTwoFactorAuthError'),
                    },
                },
            },
        },
        ...(twoFactorAuthCode
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
                      value: {
                          errors: getMicroSecondOnyxErrorWithTranslationKey('domain.common.forceTwoFactorAuthError'),
                      },
                  },
              ]
            : []),
    ];

    const params: SetTwoFactorAuthExemptEmailForDomainParams = {
        domainAccountID,
        targetEmail,
        enabled: !force2FA,
        twoFactorAuthCode,
    };

    API.write(WRITE_COMMANDS.SET_TWO_FACTOR_AUTH_EXEMPT_EMAIL_FOR_DOMAIN, params, {optimisticData, successData, failureData});
}

function clearTwoFactorAuthExemptEmailsErrors(domainAccountID: number, email: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        memberErrors: {
            [email]: {twoFactorAuthExemptEmailsError: null},
        },
    });
}

function resetDomainMemberTwoFactorAuth(domainAccountID: number, targetAccountID: number, targetEmail: string, twoFactorAuthCode: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [targetAccountID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [targetAccountID]: {
                        errors: null,
                    },
                },
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [targetAccountID]: {
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
                    [targetAccountID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('domain.common.forceTwoFactorAuthError'),
                    },
                },
            },
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {
                    [targetAccountID]: {
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
                    [targetAccountID]: {
                        errors: null,
                    },
                },
            },
        },
    ];

    const params: ResetDomainMemberTwoFactorAuthParams = {
        domainAccountID,
        targetAccountID,
        targetEmail,
        twoFactorAuthCode,
    };

    API.write(WRITE_COMMANDS.RESET_DOMAIN_MEMBER_TWO_FACTOR_AUTH, params, {optimisticData, failureData, successData});
}

function exportMembersToCSV(domainAccountID: number, onDownloadFailed: () => void, translate: LocalizedTranslate) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_DOMAIN_MEMBERS_CSV, {
        domainAccountID,
    });

    const fileName = 'DomainMembers.csv';

    const formData = new FormData();
    for (const [key, value] of Object.entries(finalParameters)) {
        formData.append(key, String(value));
    }

    fileDownload(translate, getCommandURL({command: WRITE_COMMANDS.EXPORT_DOMAIN_MEMBERS_CSV}), fileName, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

/**
 * Moves a domain member from one security group to another with optimistic updates.
 * @param domainAccountID - The account ID of the domain
 * @param domainName - The name of the domain
 * @param employeeEmail - The email of the member being moved
 * @param accountID - The account ID of the member being moved
 * @param currentSecurityGroupKey - The Onyx key of the member's current security group
 * @param currentSecurityGroup - The current security group data
 * @param targetSecurityGroupKey - The Onyx key of the target security group
 */
function changeDomainSecurityGroup(
    domainAccountID: number,
    domainName: string,
    employeeEmail: string,
    accountID: number,
    currentSecurityGroupKey: SecurityGroupKey,
    currentSecurityGroup: Partial<DomainSecurityGroup>,
    targetSecurityGroupKey: SecurityGroupKey,
) {
    const accountIDStr = String(accountID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [currentSecurityGroupKey]: {
                    shared: {
                        [accountIDStr]: null,
                    },
                },
                [targetSecurityGroupKey]: {
                    shared: {
                        [accountIDStr]: 'read',
                    },
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {[employeeEmail]: {changeDomainSecurityGroup: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE as PendingAction}},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {[employeeEmail]: null},
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {[employeeEmail]: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {[employeeEmail]: null},
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS | typeof ONYXKEYS.COLLECTION.DOMAIN | typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [currentSecurityGroupKey]: {
                    shared: {
                        [accountIDStr]: currentSecurityGroup.shared?.[accountIDStr],
                    },
                },
                [targetSecurityGroupKey]: {
                    shared: {
                        [accountIDStr]: null,
                    },
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                member: {[employeeEmail]: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                memberErrors: {
                    [employeeEmail]: {changeDomainSecurityGroupErrors: getMicroSecondOnyxErrorWithTranslationKey('domain.members.error.moveMember')},
                },
            },
        },
    ];

    const newID = targetSecurityGroupKey.replace(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, '');

    const parameters: ChangeDomainSecurityGroupParams = {
        domainName,
        newID,
        employeeEmail,
        domainAccountID,
    };

    API.write(WRITE_COMMANDS.CHANGE_DOMAIN_SECURITY_GROUP, parameters, {optimisticData, successData, failureData});
}

function setDomainMembersSelectedForMove(memberAccountIDs: string[]) {
    Onyx.set(ONYXKEYS.DOMAIN_MEMBERS_SELECTED_FOR_MOVE, memberAccountIDs);
}

function clearDomainMembersSelectedForMove() {
    Onyx.set(ONYXKEYS.DOMAIN_MEMBERS_SELECTED_FOR_MOVE, []);
}

/**
 * Updates a setting of a domain security group
 *
 * @param domainAccountID - The account ID of the domain
 * @param groupID - The ID of the security group
 * @param currentSecurityGroup - The current security group data
 * @param newSettingValue - The setting value we want to update
 * @param settingsName - The setting name we want to update
 */
function updateDomainSecurityGroup(
    domainAccountID: number,
    groupID: string,
    currentSecurityGroup: DomainSecurityGroup,
    newSettingValue: Partial<DomainSecurityGroup>,
    settingsName: keyof Pick<DomainSecurityGroup, 'name'>,
) {
    const SECURITY_GROUP_KEY = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}`;
    const newSecurityGroup = {...currentSecurityGroup, ...newSettingValue};

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN> | OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS> | OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: newSecurityGroup,
            } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroup>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: {
                    [settingsName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: {
                    [`${settingsName}Errors`]: null,
                },
            },
        },
    ];

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN> | OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS> | OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: {
                    [settingsName]: currentSecurityGroup[settingsName],
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroup>,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: {
                    [settingsName]: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: {
                    [`${settingsName}Errors`]: getMicroSecondOnyxErrorWithTranslationKey(`domain.common.error`),
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_ERRORS> | OnyxUpdate<typeof ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: {
                    [settingsName]: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            value: {
                [SECURITY_GROUP_KEY]: {
                    [`${settingsName}Errors`]: null,
                },
            },
        },
    ];

    const params: UpdateDomainSecurityGroupParams = {
        domainAccountID,
        name: SECURITY_GROUP_KEY,
        value: JSON.stringify(newSecurityGroup),
        settingsName,
    };

    API.write(WRITE_COMMANDS.UPDATE_DOMAIN_SECURITY_GROUP, params, {optimisticData, failureData, successData});
}

/**
 * Removes an error after trying to change the security group setting
 */
function clearDomainSecurityGroupSettingError(domainAccountID: number, groupID: string, settingsName: keyof DomainSecurityGroupErrors) {
    const SECURITY_GROUP_KEY = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}`;
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        [SECURITY_GROUP_KEY]: {
            [settingsName]: null,
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
    addAdminToDomain,
    clearAdminError,
    revokeDomainAdminAccess,
    resetDomain,
    clearDomainErrors,
    addMemberToDomain,
    clearDomainMemberError,
    closeUserAccount,
    toggleTwoFactorAuthRequiredForDomain,
    clearToggleTwoFactorAuthRequiredForDomainError,
    clearValidateDomainTwoFactorCodeError,
    setDomainVacationDelegate,
    deleteDomainVacationDelegate,
    clearVacationDelegateError,
    setTwoFactorAuthExemptEmailForDomain,
    clearTwoFactorAuthExemptEmailsErrors,
    resetDomainMemberTwoFactorAuth,
    exportMembersToCSV,
    changeDomainSecurityGroup,
    setDomainMembersSelectedForMove,
    clearDomainMembersSelectedForMove,
    updateDomainSecurityGroup,
    clearDomainSecurityGroupSettingError,
};
