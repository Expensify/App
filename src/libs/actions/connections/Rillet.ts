import {write} from '@libs/API';
import type {
    ConnectPolicyToRilletParams,
    UpdateRilletCreditCardAccountParams,
    UpdateRilletDefaultVendorParams,
    UpdateRilletEnableNewCategoriesParams,
    UpdateRilletExportDateParams,
    UpdateRilletExporterParams,
    UpdateRilletFieldMappingParams,
    UpdateRilletSubsidiaryParams,
    UpdateRilletSyncTaxRatesParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RilletCoding, RilletConnectionsConfig, RilletExport} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function connectToRillet(policyID: string, apiKey: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.RILLET_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.RILLET,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const parameters: ConnectPolicyToRilletParams = {
        policyID,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_RILLET, parameters, {
        optimisticData,
    });
}

function clearRilletErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.RILLET]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function prepareRilletOptimisticData<TSettingName extends keyof RilletConnectionsConfig>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<RilletConnectionsConfig[TSettingName]>,
    oldSettingValue: Partial<RilletConnectionsConfig[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    rillet: {
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
                    rillet: {
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
                    rillet: {
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

function prepareRilletCodingOptimisticData<TSettingName extends keyof RilletCoding>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<RilletCoding[TSettingName]>,
    oldSettingValue: Partial<RilletCoding[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    rillet: {
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
                    rillet: {
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
                    rillet: {
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

function prepareRilletFieldMappingOptimisticData(
    policyID: string,
    fieldID: keyof NonNullable<RilletCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<RilletCoding['fieldMappings']>>,
    oldMapping: ValueOf<NonNullable<RilletCoding['fieldMappings']>> | null,
) {
    const fieldOfflineFeedbackKey = `${CONST.RILLET_CONFIG.FIELD_MAPPING_PREFIX}${fieldID}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    rillet: {
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
                    rillet: {
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
                    rillet: {
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

function prepareRilletExportOptimisticData<TSettingName extends keyof RilletExport>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<RilletExport[TSettingName]>,
    oldSettingValue: Partial<RilletExport[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    rillet: {
                        config: {
                            export: {
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
                    rillet: {
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
                    rillet: {
                        config: {
                            export: {
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

function updateRilletSubsidiary(policyID: string, subsidiaryID: RilletConnectionsConfig['subsidiaryID'], oldSubsidiaryID?: RilletConnectionsConfig['subsidiaryID']) {
    const onyxData = prepareRilletOptimisticData(policyID, CONST.RILLET_CONFIG.SUBSIDIARY_ID, subsidiaryID, oldSubsidiaryID ?? null);
    const params: UpdateRilletSubsidiaryParams = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SUBSIDIARY, params, onyxData);
}

function updateRilletEnableNewCategories(policyID: string, enabled: RilletConnectionsConfig['enableNewCategories'], oldEnabled?: RilletConnectionsConfig['enableNewCategories']) {
    const onyxData = prepareRilletOptimisticData(policyID, CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES, enabled, oldEnabled ?? null);
    const parameters: UpdateRilletEnableNewCategoriesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateRilletSyncTaxRates(policyID: string, enabled: RilletCoding['syncTaxRates'], oldEnabled?: RilletCoding['syncTaxRates']) {
    const onyxData = prepareRilletCodingOptimisticData(policyID, CONST.RILLET_CONFIG.SYNC_TAX_RATES, enabled, oldEnabled ?? null);
    const parameters: UpdateRilletSyncTaxRatesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SYNC_TAX_RATES, parameters, onyxData);
}

function updateRilletFieldMapping(
    policyID: string,
    fieldID: keyof NonNullable<RilletCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<RilletCoding['fieldMappings']>>,
    oldMapping?: ValueOf<NonNullable<RilletCoding['fieldMappings']>>,
) {
    const onyxData = prepareRilletFieldMappingOptimisticData(policyID, fieldID, mapping, oldMapping ?? null);
    const parameters: UpdateRilletFieldMappingParams = {
        policyID,
        fieldID,
        mapping,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_FIELD_MAPPING, parameters, onyxData);
}

function updateRilletExporter(policyID: string, email: RilletExport['exporter'], oldEmail?: RilletExport['exporter']) {
    const onyxData = prepareRilletExportOptimisticData(policyID, CONST.RILLET_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateRilletExporterParams = {
        policyID,
        email,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_EXPORTER, parameters, onyxData);
}

function updateRilletExportDate(policyID: string, value: RilletExport['exportDate'], oldValue?: RilletExport['exportDate']) {
    const onyxData = prepareRilletExportOptimisticData(policyID, CONST.RILLET_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateRilletExportDateParams = {
        policyID,
        value,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_EXPORT_DATE, parameters, onyxData);
}

function updateRilletDefaultVendor(policyID: string, vendorID: RilletExport['defaultVendorID'], oldVendorID?: RilletExport['defaultVendorID']) {
    const onyxData = prepareRilletExportOptimisticData(policyID, CONST.RILLET_CONFIG.DEFAULT_VENDORID, vendorID, oldVendorID ?? null);
    const parameters: UpdateRilletDefaultVendorParams = {
        policyID,
        vendorID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_DEFAULT_VENDOR, parameters, onyxData);
}

function updateRilletCreditCardAccount(policyID: string, creditCardAccountCode: RilletExport['creditCardAccountCode'], oldCreditCardAccountCode?: RilletExport['creditCardAccountCode']) {
    const onyxData = prepareRilletExportOptimisticData(policyID, CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE, creditCardAccountCode, oldCreditCardAccountCode ?? null);
    const parameters: UpdateRilletCreditCardAccountParams = {
        policyID,
        creditCardAccountCode,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_CREDIT_CARD_ACCOUNT, parameters, onyxData);
}

export {
    connectToRillet,
    clearRilletErrorField,
    updateRilletSubsidiary,
    updateRilletEnableNewCategories,
    updateRilletSyncTaxRates,
    updateRilletFieldMapping,
    updateRilletExporter,
    updateRilletExportDate,
    updateRilletDefaultVendor,
    updateRilletCreditCardAccount,
};
