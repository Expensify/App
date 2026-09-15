import {write} from '@libs/API';
import type {
    ConnectPolicyToCampfireParams,
    UpdateCampfireAccountingMethodParams,
    UpdateCampfireAutoSyncParams,
    UpdateCampfireBillPaymentAccountParams,
    UpdateCampfireCreditCardAccountParams,
    UpdateCampfireDefaultVendorParams,
    UpdateCampfireEnableNewCategoriesParams,
    UpdateCampfireExportDateParams,
    UpdateCampfireExporterParams,
    UpdateCampfireFieldMappingParams,
    UpdateCampfireSettlementsAccountParams,
    UpdateCampfireSubsidiaryParams,
    UpdateCampfireSyncExpensifyCardSettlementsParams,
    UpdateCampfireSyncReimbursedReportsParams,
    UpdateCampfireSyncTaxRatesParams,
    UpdateCampfireSyncTravelInvoicingSettlementsParams,
    UpdateCampfireTravelInvoicingPayableAccountParams,
    UpdateCampfireTravelInvoicingSettlementsAccountParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CampfireAutoSync, CampfireCoding, CampfireConnectionsConfig, CampfireExport, CampfireSync} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';
import {ValueOf} from 'type-fest';

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

function prepareCampfireExportOnyxData<TSettingName extends keyof CampfireExport>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<CampfireExport[TSettingName]>,
    oldSettingValue: Partial<CampfireExport[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
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

function prepareCampfireAutoSyncOnyxData(policyID: string, enabled: CampfireAutoSync['enabled'], oldEnabled?: CampfireAutoSync['enabled'] | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            autoSync: {
                                enabled,
                            },
                            pendingFields: {
                                [CONST.CAMPFIRE_CONFIG.AUTO_SYNC]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.CAMPFIRE_CONFIG.AUTO_SYNC]: null,
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
                                [CONST.CAMPFIRE_CONFIG.AUTO_SYNC]: null,
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
                            autoSync: {
                                enabled: oldEnabled ?? null,
                            },
                            pendingFields: {
                                [CONST.CAMPFIRE_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.CAMPFIRE_CONFIG.AUTO_SYNC]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function prepareCampfireSyncOnyxData<TSettingName extends keyof CampfireSync>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<CampfireSync[TSettingName]>,
    oldSettingValue: Partial<CampfireSync[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            sync: {
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
                            sync: {
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

function updateCampfireExporter(policyID: string, email: CampfireExport['exporter'], oldEmail?: CampfireExport['exporter']) {
    const onyxData = prepareCampfireExportOnyxData(policyID, CONST.CAMPFIRE_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateCampfireExporterParams = {
        policyID,
        email,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_EXPORTER, parameters, onyxData);
}

function updateCampfireExportDate(policyID: string, value: CampfireExport['exportDate'], oldValue?: CampfireExport['exportDate']) {
    const onyxData = prepareCampfireExportOnyxData(policyID, CONST.CAMPFIRE_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateCampfireExportDateParams = {
        policyID,
        value,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_EXPORT_DATE, parameters, onyxData);
}

function updateCampfireDefaultVendor(policyID: string, vendorID: CampfireExport['defaultVendorID'], oldVendorID?: CampfireExport['defaultVendorID']) {
    const onyxData = prepareCampfireExportOnyxData(policyID, CONST.CAMPFIRE_CONFIG.DEFAULT_VENDORID, vendorID, oldVendorID ?? null);
    const parameters: UpdateCampfireDefaultVendorParams = {
        policyID,
        vendorID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_DEFAULT_VENDOR, parameters, onyxData);
}

function updateCampfireCreditCardAccount(policyID: string, creditCardAccountID: CampfireExport['creditCardAccountID'], oldCreditCardAccountID?: CampfireExport['creditCardAccountID']) {
    const onyxData = prepareCampfireExportOnyxData(policyID, CONST.CAMPFIRE_CONFIG.CREDIT_CARD_ACCOUNT_ID, creditCardAccountID, oldCreditCardAccountID ?? null);
    const parameters: UpdateCampfireCreditCardAccountParams = {
        policyID,
        creditCardAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_CREDIT_CARD_ACCOUNT, parameters, onyxData);
}

function updateCampfireAutoSync(policyID: string, enabled: CampfireAutoSync['enabled'], oldEnabled?: CampfireAutoSync['enabled']) {
    const onyxData = prepareCampfireAutoSyncOnyxData(policyID, enabled, oldEnabled ?? null);
    const parameters: UpdateCampfireAutoSyncParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_AUTO_SYNC, parameters, onyxData);
}

function updateCampfireAccountingMethod(policyID: string, accountingMethod: CampfireExport['accountingMethod'], oldAccountingMethod?: CampfireExport['accountingMethod']) {
    const onyxData = prepareCampfireExportOnyxData(policyID, CONST.CAMPFIRE_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod ?? null);
    const parameters: UpdateCampfireAccountingMethodParams = {
        policyID,
        accountingMethod,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_ACCOUNTING_METHOD, parameters, onyxData);
}

function updateCampfireSyncReimbursedReports(policyID: string, enabled: CampfireSync['syncReimbursedReports'], oldEnabled?: CampfireSync['syncReimbursedReports']) {
    const onyxData = prepareCampfireSyncOnyxData(policyID, CONST.CAMPFIRE_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, oldEnabled ?? null);
    const parameters: UpdateCampfireSyncReimbursedReportsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateCampfireBillPaymentAccount(policyID: string, billPaymentAccountID: CampfireSync['billPaymentAccountID'], oldBillPaymentAccountID?: CampfireSync['billPaymentAccountID']) {
    const onyxData = prepareCampfireSyncOnyxData(policyID, CONST.CAMPFIRE_CONFIG.BILL_PAYMENT_ACCOUNT_ID, billPaymentAccountID, oldBillPaymentAccountID ?? null);
    const parameters: UpdateCampfireBillPaymentAccountParams = {
        policyID,
        billPaymentAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_BILL_PAYMENT_ACCOUNT, parameters, onyxData);
}

function updateCampfireSyncExpensifyCardSettlements(policyID: string, enabled: CampfireSync['syncExpensifyCardSettlements'], oldEnabled?: CampfireSync['syncExpensifyCardSettlements']) {
    const onyxData = prepareCampfireSyncOnyxData(policyID, CONST.CAMPFIRE_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateCampfireSyncExpensifyCardSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_SYNC_EXPENSIFY_CARD_SETTLEMENTS, parameters, onyxData);
}

function updateCampfireSettlementsAccount(
    policyID: string,
    settlementsBankAccountID: CampfireSync['settlementsBankAccountID'],
    oldSettlementsBankAccountID?: CampfireSync['settlementsBankAccountID'],
) {
    const onyxData = prepareCampfireSyncOnyxData(policyID, CONST.CAMPFIRE_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID, settlementsBankAccountID, oldSettlementsBankAccountID ?? null);
    const parameters: UpdateCampfireSettlementsAccountParams = {
        policyID,
        settlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateCampfireSyncTravelInvoicingSettlements(
    policyID: string,
    enabled: CampfireSync['syncTravelInvoicingSettlements'],
    oldEnabled?: CampfireSync['syncTravelInvoicingSettlements'],
) {
    const onyxData = prepareCampfireSyncOnyxData(policyID, CONST.CAMPFIRE_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateCampfireSyncTravelInvoicingSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_SYNC_TRAVEL_INVOICING_SETTLEMENTS, parameters, onyxData);
}

function updateCampfireTravelInvoicingSettlementsAccount(
    policyID: string,
    travelInvoicingSettlementsBankAccountID: CampfireSync['travelInvoicingSettlementsBankAccountID'],
    oldTravelInvoicingSettlementsBankAccountID?: CampfireSync['travelInvoicingSettlementsBankAccountID'],
) {
    const onyxData = prepareCampfireSyncOnyxData(
        policyID,
        CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID,
        travelInvoicingSettlementsBankAccountID,
        oldTravelInvoicingSettlementsBankAccountID ?? null,
    );
    const parameters: UpdateCampfireTravelInvoicingSettlementsAccountParams = {
        policyID,
        travelInvoicingSettlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_TRAVEL_INVOICING_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateCampfireTravelInvoicingPayableAccount(
    policyID: string,
    travelInvoicingPayableAccountID: CampfireExport['travelInvoicingPayableAccountID'],
    oldTravelInvoicingPayableAccountID?: CampfireExport['travelInvoicingPayableAccountID'],
) {
    const onyxData = prepareCampfireExportOnyxData(
        policyID,
        CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID,
        travelInvoicingPayableAccountID,
        oldTravelInvoicingPayableAccountID ?? null,
    );
    const parameters: UpdateCampfireTravelInvoicingPayableAccountParams = {
        policyID,
        travelInvoicingPayableAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_TRAVEL_INVOICING_PAYABLE_ACCOUNT, parameters, onyxData);
}

export {
    connectToCampfire,
    clearCampfireErrorField,
    updateCampfireSubsidiary,
    updateCampfireEnableNewCategories,
    updateCampfireSyncTaxRates,
    updateCampfireFieldMapping,
    updateCampfireExporter,
    updateCampfireExportDate,
    updateCampfireDefaultVendor,
    updateCampfireCreditCardAccount,
    updateCampfireAutoSync,
    updateCampfireAccountingMethod,
    updateCampfireSyncReimbursedReports,
    updateCampfireBillPaymentAccount,
    updateCampfireSyncExpensifyCardSettlements,
    updateCampfireSettlementsAccount,
    updateCampfireSyncTravelInvoicingSettlements,
    updateCampfireTravelInvoicingSettlementsAccount,
    updateCampfireTravelInvoicingPayableAccount,
};
