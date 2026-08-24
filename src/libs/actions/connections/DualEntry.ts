import {write} from '@libs/API';
import type {
    ConnectPolicyToDualEntryParams,
    UpdateDualEntryAccountingMethodParams,
    UpdateDualEntryAutoSyncParams,
    UpdateDualEntryBillPaymentAccountParams,
    UpdateDualEntryCreditCardAccountParams,
    UpdateDualEntryDefaultVendorParams,
    UpdateDualEntryEnableNewCategoriesParams,
    UpdateDualEntryExpensifyCardAccountParams,
    UpdateDualEntryExportDateParams,
    UpdateDualEntryExporterParams,
    UpdateDualEntryFieldMappingParams,
    UpdateDualEntrySettlementsAccountParams,
    UpdateDualEntrySubsidiaryParams,
    UpdateDualEntrySyncExpensifyCardSettlementsParams,
    UpdateDualEntrySyncReimbursedReportsParams,
    UpdateDualEntrySyncTaxRatesParams,
    UpdateDualEntrySyncTravelInvoicingSettlementsParams,
    UpdateDualEntryTravelInvoicingPayableAccountParams,
    UpdateDualEntryTravelInvoicingSettlementsAccountParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DualEntryAutoSync, DualEntryCoding, DualEntryConnectionsConfig, DualEntryExport, DualEntrySync} from '@src/types/onyx/Policy';

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

function prepareDualEntryAutoSyncOnyxData(policyID: string, enabled: DualEntryAutoSync['enabled'], oldEnabled?: DualEntryAutoSync['enabled'] | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    dualEntry: {
                        config: {
                            autoSync: {
                                enabled,
                            },
                            pendingFields: {
                                [CONST.DUALENTRY_CONFIG.AUTO_SYNC]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.DUALENTRY_CONFIG.AUTO_SYNC]: null,
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
                                [CONST.DUALENTRY_CONFIG.AUTO_SYNC]: null,
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
                            autoSync: {
                                enabled: oldEnabled ?? null,
                            },
                            pendingFields: {
                                [CONST.DUALENTRY_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.DUALENTRY_CONFIG.AUTO_SYNC]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function prepareDualEntrySyncOnyxData<TSettingName extends keyof DualEntrySync>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<DualEntrySync[TSettingName]>,
    oldSettingValue: Partial<DualEntrySync[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    dualEntry: {
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

function updateDualEntryAutoSync(policyID: string, enabled: DualEntryAutoSync['enabled'], oldEnabled?: DualEntryAutoSync['enabled']) {
    const onyxData = prepareDualEntryAutoSyncOnyxData(policyID, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntryAutoSyncParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_AUTO_SYNC, parameters, onyxData);
}

function updateDualEntryAccountingMethod(policyID: string, accountingMethod: DualEntryExport['accountingMethod'], oldAccountingMethod?: DualEntryExport['accountingMethod']) {
    const onyxData = prepareDualEntryExportOnyxData(policyID, CONST.DUALENTRY_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod ?? null);
    const parameters: UpdateDualEntryAccountingMethodParams = {
        policyID,
        accountingMethod,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_ACCOUNTING_METHOD, parameters, onyxData);
}

function updateDualEntrySyncReimbursedReports(policyID: string, enabled: DualEntrySync['syncReimbursedReports'], oldEnabled?: DualEntrySync['syncReimbursedReports']) {
    const onyxData = prepareDualEntrySyncOnyxData(policyID, CONST.DUALENTRY_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntrySyncReimbursedReportsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateDualEntryBillPaymentAccount(policyID: string, billPaymentAccountID: DualEntrySync['billPaymentAccountID'], oldBillPaymentAccountID?: DualEntrySync['billPaymentAccountID']) {
    const onyxData = prepareDualEntrySyncOnyxData(policyID, CONST.DUALENTRY_CONFIG.BILL_PAYMENT_ACCOUNT_ID, billPaymentAccountID, oldBillPaymentAccountID ?? null);
    const parameters: UpdateDualEntryBillPaymentAccountParams = {
        policyID,
        billPaymentAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_BILL_PAYMENT_ACCOUNT, parameters, onyxData);
}

function updateDualEntrySyncExpensifyCardSettlements(policyID: string, enabled: DualEntrySync['syncExpensifyCardSettlements'], oldEnabled?: DualEntrySync['syncExpensifyCardSettlements']) {
    const onyxData = prepareDualEntrySyncOnyxData(policyID, CONST.DUALENTRY_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntrySyncExpensifyCardSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_SYNC_EXPENSIFY_CARD_SETTLEMENTS, parameters, onyxData);
}

function updateDualEntrySettlementsAccount(
    policyID: string,
    settlementsBankAccountID: DualEntrySync['settlementsBankAccountID'],
    oldSettlementsBankAccountID?: DualEntrySync['settlementsBankAccountID'],
) {
    const onyxData = prepareDualEntrySyncOnyxData(policyID, CONST.DUALENTRY_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID, settlementsBankAccountID, oldSettlementsBankAccountID ?? null);
    const parameters: UpdateDualEntrySettlementsAccountParams = {
        policyID,
        settlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateDualEntrySyncTravelInvoicingSettlements(
    policyID: string,
    enabled: DualEntrySync['syncTravelInvoicingSettlements'],
    oldEnabled?: DualEntrySync['syncTravelInvoicingSettlements'],
) {
    const onyxData = prepareDualEntrySyncOnyxData(policyID, CONST.DUALENTRY_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateDualEntrySyncTravelInvoicingSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_SYNC_TRAVEL_INVOICING_SETTLEMENTS, parameters, onyxData);
}

function updateDualEntryTravelInvoicingSettlementsAccount(
    policyID: string,
    travelInvoicingSettlementsBankAccountID: DualEntrySync['travelInvoicingSettlementsBankAccountID'],
    oldTravelInvoicingSettlementsBankAccountID?: DualEntrySync['travelInvoicingSettlementsBankAccountID'],
) {
    const onyxData = prepareDualEntrySyncOnyxData(
        policyID,
        CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID,
        travelInvoicingSettlementsBankAccountID,
        oldTravelInvoicingSettlementsBankAccountID ?? null,
    );
    const parameters: UpdateDualEntryTravelInvoicingSettlementsAccountParams = {
        policyID,
        travelInvoicingSettlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_TRAVEL_INVOICING_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateDualEntryTravelInvoicingPayableAccount(
    policyID: string,
    travelInvoicingPayableAccountID: DualEntryExport['travelInvoicingPayableAccountID'],
    oldTravelInvoicingPayableAccountID?: DualEntryExport['travelInvoicingPayableAccountID'],
) {
    const onyxData = prepareDualEntryExportOnyxData(
        policyID,
        CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID,
        travelInvoicingPayableAccountID,
        oldTravelInvoicingPayableAccountID ?? null,
    );
    const parameters: UpdateDualEntryTravelInvoicingPayableAccountParams = {
        policyID,
        travelInvoicingPayableAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DUALENTRY_TRAVEL_INVOICING_PAYABLE_ACCOUNT, parameters, onyxData);
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
    updateDualEntryAutoSync,
    updateDualEntryAccountingMethod,
    updateDualEntrySyncReimbursedReports,
    updateDualEntryBillPaymentAccount,
    updateDualEntrySyncExpensifyCardSettlements,
    updateDualEntrySettlementsAccount,
    updateDualEntrySyncTravelInvoicingSettlements,
    updateDualEntryTravelInvoicingSettlementsAccount,
    updateDualEntryTravelInvoicingPayableAccount,
};
