import {write} from '@libs/API';
import type {
    ConnectPolicyToDualEntryParams,
    UpdateDualEntryEnableNewCategoriesParams,
    UpdateDualEntryFieldMappingParams,
    UpdateDualEntrySubsidiaryParams,
    UpdateDualEntrySyncTaxRatesParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DualEntryCoding, DualEntryConnectionsConfig} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function connectToDualEntry(policyID: string, apiKey: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.DUAL_ENTRY_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.DUAL_ENTRY,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const parameters: ConnectPolicyToDualEntryParams = {
        policyID,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_DUAL_ENTRY, parameters, {optimisticData});
}

function clearDualEntryErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.DUAL_ENTRY]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function prepareDualEntryOnyxData<TSettingName extends keyof DualEntryConnectionsConfig>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<DualEntryConnectionsConfig[TSettingName]>,
    oldSettingValue: Partial<DualEntryConnectionsConfig[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    dualEntry: {
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
                    dualEntry: {
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
                    dualEntry: {
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

function prepareDualEntryCodingOnyxData<TSettingName extends keyof DualEntryCoding>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<DualEntryCoding[TSettingName]>,
    oldSettingValue: Partial<DualEntryCoding[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    dualEntry: {
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
                    dualEntry: {
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
                    dualEntry: {
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

function prepareDualEntryFieldMappingOnyxData(
    policyID: string,
    fieldID: keyof NonNullable<DualEntryCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<DualEntryCoding['fieldMappings']>>,
    oldMapping: ValueOf<NonNullable<DualEntryCoding['fieldMappings']>> | null,
) {
    const fieldOfflineFeedbackKey = `${CONST.DUAL_ENTRY_CONFIG.FIELD_MAPPING_PREFIX}${fieldID}`;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    dualEntry: {
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
                    dualEntry: {
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
                    dualEntry: {
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

function updateDualEntrySubsidiary(policyID: string, companyID: NonNullable<DualEntryConnectionsConfig['companyID']>, oldCompanyID?: DualEntryConnectionsConfig['companyID']) {
    const onyxData = prepareDualEntryOnyxData(policyID, CONST.DUAL_ENTRY_CONFIG.COMPANY_ID, companyID, oldCompanyID ?? null);
    const parameters: UpdateDualEntrySubsidiaryParams = {
        policyID,
        companyID,
    };
    write(WRITE_COMMANDS.UPDATE_DUAL_ENTRY_SUBSIDIARY, parameters, onyxData);
}

function updateDualEntryEnableNewCategories(policyID: string, enabled: DualEntryConnectionsConfig['enableNewCategories'], oldEnabled?: DualEntryConnectionsConfig['enableNewCategories']) {
    const onyxData = prepareDualEntryOnyxData(policyID, CONST.DUAL_ENTRY_CONFIG.ENABLE_NEW_CATEGORIES, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntryEnableNewCategoriesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUAL_ENTRY_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateDualEntrySyncTaxRates(policyID: string, enabled: DualEntryCoding['syncTaxRates'], oldEnabled?: DualEntryCoding['syncTaxRates']) {
    const onyxData = prepareDualEntryCodingOnyxData(policyID, CONST.DUAL_ENTRY_CONFIG.SYNC_TAX_RATES, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntrySyncTaxRatesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUAL_ENTRY_SYNC_TAX_RATES, parameters, onyxData);
}

function updateDualEntryFieldMapping(
    policyID: string,
    fieldID: keyof NonNullable<DualEntryCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<DualEntryCoding['fieldMappings']>>,
    oldMapping?: ValueOf<NonNullable<DualEntryCoding['fieldMappings']>>,
) {
    const onyxData = prepareDualEntryFieldMappingOnyxData(policyID, fieldID, mapping, oldMapping ?? null);
    const parameters: UpdateDualEntryFieldMappingParams = {
        policyID,
        fieldID,
        mapping,
    };
    write(WRITE_COMMANDS.UPDATE_DUAL_ENTRY_FIELD_MAPPING, parameters, onyxData);
}

export {clearDualEntryErrorField, connectToDualEntry, updateDualEntryEnableNewCategories, updateDualEntryFieldMapping, updateDualEntrySubsidiary, updateDualEntrySyncTaxRates};
