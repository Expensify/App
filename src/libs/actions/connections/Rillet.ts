import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {write} from '@libs/API';
import type {
    ConnectPolicyToRilletParams,
    UpdateRilletAccountingMethodParams,
    UpdateRilletAutoSyncParams,
    UpdateRilletBillPaymentAccountParams,
    UpdateRilletCreditCardAccountParams,
    UpdateRilletDefaultVendorParams,
    UpdateRilletEnableNewCategoriesParams,
    UpdateRilletExportDateParams,
    UpdateRilletExporterParams,
    UpdateRilletFieldMappingParams,
    UpdateRilletSettlementsAccountParams,
    UpdateRilletSubsidiaryParams,
    UpdateRilletSyncExpensifyCardSettlementsParams,
    UpdateRilletSyncReimbursedReportsParams,
    UpdateRilletSyncTaxRatesParams,
    UpdateRilletSyncTravelInvoicingSettlementsParams,
    UpdateRilletTravelInvoicingSettlementsAccountParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RilletAutoSync, RilletCoding, RilletConnectionsConfig, RilletExport, RilletSync} from '@src/types/onyx/Policy';

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
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_RILLET, parameters, {optimisticData});
}

function clearRilletErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {[CONST.POLICY.CONNECTIONS.NAME.RILLET]: {config: {errorFields: {[fieldName]: null}}}},
    });
}

function prepareRilletOnyxData<TSettingName extends keyof RilletConnectionsConfig>(
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

function prepareRilletCodingOnyxData<TSettingName extends keyof RilletCoding>(
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

function prepareRilletFieldMappingOnyxData(
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

function prepareRilletExportOnyxData<TSettingName extends keyof RilletExport>(
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

function prepareRilletAutoSyncOnyxData(policyID: string, enabled: RilletAutoSync['enabled'], oldEnabled?: RilletAutoSync['enabled'] | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    rillet: {
                        config: {
                            autoSync: {
                                enabled,
                            },
                            pendingFields: {
                                [CONST.RILLET_CONFIG.AUTO_SYNC]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.RILLET_CONFIG.AUTO_SYNC]: null,
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
                                [CONST.RILLET_CONFIG.AUTO_SYNC]: null,
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
                            autoSync: {
                                enabled: oldEnabled ?? null,
                            },
                            pendingFields: {
                                [CONST.RILLET_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.RILLET_CONFIG.AUTO_SYNC]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function prepareRilletSyncOnyxData<TSettingName extends keyof RilletSync>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<RilletSync[TSettingName]>,
    oldSettingValue: Partial<RilletSync[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    rillet: {
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

function updateRilletSubsidiary(policyID: string, subsidiaryID: RilletConnectionsConfig['subsidiaryID'], oldSubsidiaryID?: RilletConnectionsConfig['subsidiaryID']) {
    const onyxData = prepareRilletOnyxData(policyID, CONST.RILLET_CONFIG.SUBSIDIARY_ID, subsidiaryID, oldSubsidiaryID ?? null);
    const params: UpdateRilletSubsidiaryParams = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SUBSIDIARY, params, onyxData);
}

function updateRilletEnableNewCategories(policyID: string, enabled: RilletConnectionsConfig['enableNewCategories'], oldEnabled?: RilletConnectionsConfig['enableNewCategories']) {
    const onyxData = prepareRilletOnyxData(policyID, CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES, enabled, oldEnabled ?? null);
    const parameters: UpdateRilletEnableNewCategoriesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateRilletSyncTaxRates(policyID: string, enabled: RilletCoding['syncTaxRates'], oldEnabled?: RilletCoding['syncTaxRates']) {
    const onyxData = prepareRilletCodingOnyxData(policyID, CONST.RILLET_CONFIG.SYNC_TAX_RATES, enabled, oldEnabled ?? null);
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
    const onyxData = prepareRilletFieldMappingOnyxData(policyID, fieldID, mapping, oldMapping ?? null);
    const parameters: UpdateRilletFieldMappingParams = {
        policyID,
        fieldID,
        mapping,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_FIELD_MAPPING, parameters, onyxData);
}

function updateRilletExporter(policyID: string, email: RilletExport['exporter'], oldEmail?: RilletExport['exporter']) {
    const onyxData = prepareRilletExportOnyxData(policyID, CONST.RILLET_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateRilletExporterParams = {
        policyID,
        email,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_EXPORTER, parameters, onyxData);
}

function updateRilletExportDate(policyID: string, value: RilletExport['exportDate'], oldValue?: RilletExport['exportDate']) {
    const onyxData = prepareRilletExportOnyxData(policyID, CONST.RILLET_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateRilletExportDateParams = {
        policyID,
        value,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_EXPORT_DATE, parameters, onyxData);
}

function updateRilletDefaultVendor(policyID: string, vendorID: RilletExport['defaultVendorID'], oldVendorID?: RilletExport['defaultVendorID']) {
    const onyxData = prepareRilletExportOnyxData(policyID, CONST.RILLET_CONFIG.DEFAULT_VENDORID, vendorID, oldVendorID ?? null);
    const parameters: UpdateRilletDefaultVendorParams = {
        policyID,
        vendorID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_DEFAULT_VENDOR, parameters, onyxData);
}

function updateRilletCreditCardAccount(policyID: string, creditCardAccountCode: RilletExport['creditCardAccountCode'], oldCreditCardAccountCode?: RilletExport['creditCardAccountCode']) {
    const onyxData = prepareRilletExportOnyxData(policyID, CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE, creditCardAccountCode, oldCreditCardAccountCode ?? null);
    const parameters: UpdateRilletCreditCardAccountParams = {
        policyID,
        creditCardAccountCode,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_CREDIT_CARD_ACCOUNT, parameters, onyxData);
}

function updateRilletAutoSync(policyID: string, enabled: RilletAutoSync['enabled'], oldEnabled?: RilletAutoSync['enabled']) {
    const onyxData = prepareRilletAutoSyncOnyxData(policyID, enabled, oldEnabled ?? null);
    const parameters: UpdateRilletAutoSyncParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_AUTO_SYNC, parameters, onyxData);
}

function updateRilletAccountingMethod(policyID: string, accountingMethod: RilletExport['accountingMethod'], oldAccountingMethod?: RilletExport['accountingMethod']) {
    const onyxData = prepareRilletExportOnyxData(policyID, CONST.RILLET_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod ?? null);
    const parameters: UpdateRilletAccountingMethodParams = {
        policyID,
        accountingMethod,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_ACCOUNTING_METHOD, parameters, onyxData);
}

function updateRilletSyncReimbursedReports(policyID: string, enabled: RilletSync['syncReimbursedReports'], oldEnabled?: RilletSync['syncReimbursedReports']) {
    const onyxData = prepareRilletSyncOnyxData(policyID, CONST.RILLET_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, oldEnabled ?? null);
    const parameters: UpdateRilletSyncReimbursedReportsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateRilletBillPaymentAccount(policyID: string, accountCode: RilletSync['billPaymentAccountCode'], oldAccountCode?: RilletSync['billPaymentAccountCode']) {
    const onyxData = prepareRilletSyncOnyxData(policyID, CONST.RILLET_CONFIG.BILL_PAYMENT_ACCOUNT_CODE, accountCode, oldAccountCode ?? null);
    const parameters: UpdateRilletBillPaymentAccountParams = {
        policyID,
        accountCode,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_BILL_PAYMENT_ACCOUNT, parameters, onyxData);
}

function updateRilletSyncExpensifyCardSettlements(policyID: string, enabled: RilletSync['syncExpensifyCardSettlements'], oldEnabled?: RilletSync['syncExpensifyCardSettlements']) {
    const onyxData = prepareRilletSyncOnyxData(policyID, CONST.RILLET_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateRilletSyncExpensifyCardSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SYNC_EXPENSIFY_CARD_SETTLEMENTS, parameters, onyxData);
}

function updateRilletSettlementsAccount(policyID: string, bankAccountID: RilletSync['settlementsBankAccountID'], oldBankAccountID?: RilletSync['settlementsBankAccountID']) {
    const onyxData = prepareRilletSyncOnyxData(policyID, CONST.RILLET_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID, bankAccountID, oldBankAccountID ?? null);
    const parameters: UpdateRilletSettlementsAccountParams = {
        policyID,
        bankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateRilletSyncTravelInvoicingSettlements(policyID: string, enabled: RilletSync['syncTravelInvoicingSettlements'], oldEnabled?: RilletSync['syncTravelInvoicingSettlements']) {
    const onyxData = prepareRilletSyncOnyxData(policyID, CONST.RILLET_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateRilletSyncTravelInvoicingSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SYNC_TRAVEL_INVOICING_SETTLEMENTS, parameters, onyxData);
}

function updateRilletTravelInvoicingSettlementsAccount(
    policyID: string,
    travelInvoicingSettlementsBankAccountID: RilletSync['travelInvoicingSettlementsBankAccountID'],
    oldTravelInvoicingSettlementsBankAccountID?: RilletSync['travelInvoicingSettlementsBankAccountID'],
) {
    const onyxData = prepareRilletSyncOnyxData(
        policyID,
        CONST.RILLET_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID,
        travelInvoicingSettlementsBankAccountID,
        oldTravelInvoicingSettlementsBankAccountID ?? null,
    );
    const parameters: UpdateRilletTravelInvoicingSettlementsAccountParams = {
        policyID,
        travelInvoicingSettlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_TRAVEL_INVOICING_SETTLEMENTS_ACCOUNT, parameters, onyxData);
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
    updateRilletAutoSync,
    updateRilletAccountingMethod,
    updateRilletSyncReimbursedReports,
    updateRilletBillPaymentAccount,
    updateRilletSyncExpensifyCardSettlements,
    updateRilletSettlementsAccount,
    updateRilletSyncTravelInvoicingSettlements,
    updateRilletTravelInvoicingSettlementsAccount,
};
