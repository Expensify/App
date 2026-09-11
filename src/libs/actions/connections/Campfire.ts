import {write} from '@libs/API';
import type {
    ConnectPolicyToCampfireParams,
    UpdateCampfireEnableNewCategoriesParams,
    UpdateCampfireFieldMappingParams,
    UpdateCampfireSubsidiaryParams,
    UpdateCampfireSyncTaxRatesParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CampfireCoding, CampfireConnectionsConfig} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function connectToCampfire(policyID: string, apiKey: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.CAMPFIRE_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const parameters: ConnectPolicyToCampfireParams = {
        policyID,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_CAMPFIRE, parameters, {
        optimisticData,
    });
}

function clearCampfireErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function prepareCampfireOnyxData<TSettingName extends keyof CampfireConnectionsConfig>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<CampfireConnectionsConfig[TSettingName]>,
    oldSettingValue: Partial<CampfireConnectionsConfig[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: {
                                [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            pendingFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            [settingName]: oldSettingValue ?? null,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function prepareCampfireCodingOnyxData<TSettingName extends keyof CampfireCoding>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<CampfireCoding[TSettingName]>,
    oldSettingValue: Partial<CampfireCoding[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            coding: {
                                [settingName]: settingValue ?? null,
                            },
                            pendingFields: {
                                [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            pendingFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            coding: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function prepareCampfireFieldMappingOnyxData(
    policyID: string,
    fieldID: keyof NonNullable<CampfireCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<CampfireCoding['fieldMappings']>>,
    oldMapping: ValueOf<NonNullable<CampfireCoding['fieldMappings']>> | null,
) {
    const fieldOfflineFeedbackKey = `${CONST.CAMPFIRE_CONFIG.FIELD_MAPPING_PREFIX}${fieldID}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            coding: {
                                fieldMappings: {
                                    [fieldID]: mapping,
                                },
                            },
                            pendingFields: {
                                [fieldOfflineFeedbackKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [fieldOfflineFeedbackKey]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            pendingFields: {
                                [fieldOfflineFeedbackKey]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            coding: {
                                fieldMappings: {
                                    [fieldID]: oldMapping ?? null,
                                },
                            },
                            pendingFields: {
                                [fieldOfflineFeedbackKey]: null,
                            },
                            errorFields: {
                                [fieldOfflineFeedbackKey]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function updateCampfireSubsidiary(policyID: string, subsidiaryID: CampfireConnectionsConfig['subsidiaryID'], oldSubsidiaryID?: CampfireConnectionsConfig['subsidiaryID']) {
    const onyxData = prepareCampfireOnyxData(policyID, CONST.CAMPFIRE_CONFIG.SUBSIDIARY_ID, subsidiaryID, oldSubsidiaryID ?? null);
    const params: UpdateCampfireSubsidiaryParams = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_SUBSIDIARY, params, onyxData);
}

function updateCampfireEnableNewCategories(policyID: string, enabled: CampfireConnectionsConfig['enableNewCategories'], oldEnabled?: CampfireConnectionsConfig['enableNewCategories']) {
    const onyxData = prepareCampfireOnyxData(policyID, CONST.CAMPFIRE_CONFIG.ENABLE_NEW_CATEGORIES, enabled, oldEnabled ?? null);
    const parameters: UpdateCampfireEnableNewCategoriesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateCampfireSyncTaxRates(policyID: string, enabled: CampfireCoding['syncTaxRates'], oldEnabled?: CampfireCoding['syncTaxRates']) {
    const onyxData = prepareCampfireCodingOnyxData(policyID, CONST.CAMPFIRE_CONFIG.SYNC_TAX_RATES, enabled, oldEnabled ?? null);
    const parameters: UpdateCampfireSyncTaxRatesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_SYNC_TAX_RATES, parameters, onyxData);
}

function updateCampfireFieldMapping(
    policyID: string,
    fieldID: keyof NonNullable<CampfireCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<CampfireCoding['fieldMappings']>>,
    oldMapping?: ValueOf<NonNullable<CampfireCoding['fieldMappings']>>,
) {
    const onyxData = prepareCampfireFieldMappingOnyxData(policyID, fieldID, mapping, oldMapping ?? null);
    const parameters: UpdateCampfireFieldMappingParams = {
        policyID,
        fieldID,
        mapping,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_FIELD_MAPPING, parameters, onyxData);
}

export {connectToCampfire, clearCampfireErrorField, updateCampfireSubsidiary, updateCampfireEnableNewCategories, updateCampfireSyncTaxRates, updateCampfireFieldMapping};
