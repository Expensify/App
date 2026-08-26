import {write} from '@libs/API';
import type {
    ConnectPolicyToDualEntryParams,
    UpdateDualEntryCreditCardAccountParams,
    UpdateDualEntryDefaultVendorParams,
    UpdateDualEntryEnableNewCategoriesParams,
    UpdateDualEntryExpensifyCardAccountParams,
    UpdateDualEntryExportDateParams,
    UpdateDualEntryExporterParams,
    UpdateDualEntryFieldMappingParams,
    UpdateDualEntrySubsidiaryParams,
    UpdateDualEntrySyncTaxRatesParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DualEntryCoding, DualEntryConnectionsConfig, DualEntryExport} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function connectToDualEntry(policyID: string, apiKey: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.DUALENTRY_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.DUALENTRY,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const parameters: ConnectPolicyToDualEntryParams = {
        policyID,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_DUALENTRY, parameters, {
        optimisticData,
    });
}

function clearDualEntryErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.DUALENTRY]: {
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
    const fieldOfflineFeedbackKey = `${CONST.DUALENTRY_CONFIG.FIELD_MAPPING_PREFIX}${fieldID}`;

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

function prepareDualEntryExportOnyxData<TSettingName extends keyof DualEntryExport>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<DualEntryExport[TSettingName]>,
    oldSettingValue: Partial<DualEntryExport[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    dualEntry: {
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

function updateDualEntrySubsidiary(policyID: string, subsidiaryID: DualEntryConnectionsConfig['subsidiaryID'], oldSubsidiaryID?: DualEntryConnectionsConfig['subsidiaryID']) {
    const onyxData = prepareDualEntryOnyxData(policyID, CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID, subsidiaryID, oldSubsidiaryID ?? null);
    const params: UpdateDualEntrySubsidiaryParams = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_SUBSIDIARY, params, onyxData);
}

function updateDualEntryEnableNewCategories(policyID: string, enabled: DualEntryConnectionsConfig['enableNewCategories'], oldEnabled?: DualEntryConnectionsConfig['enableNewCategories']) {
    const onyxData = prepareDualEntryOnyxData(policyID, CONST.DUALENTRY_CONFIG.ENABLE_NEW_CATEGORIES, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntryEnableNewCategoriesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateDualEntrySyncTaxRates(policyID: string, enabled: DualEntryCoding['syncTaxRates'], oldEnabled?: DualEntryCoding['syncTaxRates']) {
    const onyxData = prepareDualEntryCodingOnyxData(policyID, CONST.DUALENTRY_CONFIG.SYNC_TAX_RATES, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntrySyncTaxRatesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_SYNC_TAX_RATES, parameters, onyxData);
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
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_FIELD_MAPPING, parameters, onyxData);
}

function updateDualEntryExporter(policyID: string, email: DualEntryExport['exporter'], oldEmail?: DualEntryExport['exporter']) {
    const onyxData = prepareDualEntryExportOnyxData(policyID, CONST.DUALENTRY_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateDualEntryExporterParams = {
        policyID,
        email,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_EXPORTER, parameters, onyxData);
}

function updateDualEntryExportDate(policyID: string, value: DualEntryExport['exportDate'], oldValue?: DualEntryExport['exportDate']) {
    const onyxData = prepareDualEntryExportOnyxData(policyID, CONST.DUALENTRY_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateDualEntryExportDateParams = {
        policyID,
        value,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_EXPORT_DATE, parameters, onyxData);
}

function updateDualEntryDefaultVendor(policyID: string, vendorID: DualEntryExport['defaultVendorID'], oldVendorID?: DualEntryExport['defaultVendorID']) {
    const onyxData = prepareDualEntryExportOnyxData(policyID, CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID, vendorID, oldVendorID ?? null);
    const parameters: UpdateDualEntryDefaultVendorParams = {
        policyID,
        vendorID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_DEFAULT_VENDOR, parameters, onyxData);
}

function updateDualEntryCreditCardAccount(policyID: string, creditCardAccountID: DualEntryExport['creditCardAccountID'], oldCreditCardAccountID?: DualEntryExport['creditCardAccountID']) {
    const onyxData = prepareDualEntryExportOnyxData(policyID, CONST.DUALENTRY_CONFIG.CREDIT_CARD_ACCOUNT_ID, creditCardAccountID, oldCreditCardAccountID ?? null);
    const parameters: UpdateDualEntryCreditCardAccountParams = {
        policyID,
        creditCardAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_CREDIT_CARD_ACCOUNT, parameters, onyxData);
}

function updateDualEntryExpensifyCardAccount(
    policyID: string,
    expensifyCardAccountID: DualEntryExport['expensifyCardAccountID'],
    oldExpensifyCardAccountID?: DualEntryExport['expensifyCardAccountID'],
) {
    const onyxData = prepareDualEntryExportOnyxData(policyID, CONST.DUALENTRY_CONFIG.EXPENSIFY_CARD_ACCOUNT_ID, expensifyCardAccountID, oldExpensifyCardAccountID ?? null);
    const parameters: UpdateDualEntryExpensifyCardAccountParams = {
        policyID,
        creditCardAccountID: expensifyCardAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_EXPENSIFY_CARD_ACCOUNT, parameters, onyxData);
}

export {
    connectToDualEntry,
    clearDualEntryErrorField,
    updateDualEntrySubsidiary,
    updateDualEntryEnableNewCategories,
    updateDualEntrySyncTaxRates,
    updateDualEntryFieldMapping,
    updateDualEntryExporter,
    updateDualEntryExportDate,
    updateDualEntryDefaultVendor,
    updateDualEntryCreditCardAccount,
    updateDualEntryExpensifyCardAccount,
};
