import {write} from '@libs/API';
import type {
    UpdateZohoBooksAccountingMethodParams,
    UpdateZohoBooksAutoSyncParams,
    UpdateZohoBooksBillPaymentAccountParams,
    UpdateZohoBooksCardProgramAccountParams,
    UpdateZohoBooksCreditCardAccountParams,
    UpdateZohoBooksDefaultVendorParams,
    UpdateZohoBooksEnableNewCategoriesParams,
    UpdateZohoBooksExportDateParams,
    UpdateZohoBooksExporterParams,
    UpdateZohoBooksExportToMultipleAccountsParams,
    UpdateZohoBooksFieldMappingParams,
    UpdateZohoBooksOrganizationParams,
    UpdateZohoBooksSettlementsAccountParams,
    UpdateZohoBooksSyncExpensifyCardSettlementsParams,
    UpdateZohoBooksSyncReimbursedReportsParams,
    UpdateZohoBooksSyncTaxRatesParams,
    UpdateZohoBooksSyncTravelInvoicingSettlementsParams,
    UpdateZohoBooksTravelInvoicingPayableAccountParams,
    UpdateZohoBooksTravelInvoicingSettlementsAccountParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ZohoBooksAutoSync, ZohoBooksCoding, ZohoBooksConnectionsConfig, ZohoBooksExport, ZohoBooksSync} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function getZohoBooksSetupLink(policyID: string) {
    // Zoho Books authenticates with OAuth, so the connector opens this URL in the browser.
    const params = new URLSearchParams({policyID});
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_ZOHO_BOOKS, shouldSkipWebProxy: true});
    return commandURL + params.toString();
}

function clearZohoBooksErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function prepareZohoBooksOnyxData<TSettingName extends keyof ZohoBooksConnectionsConfig>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<ZohoBooksConnectionsConfig[TSettingName]>,
    oldSettingValue: Partial<ZohoBooksConnectionsConfig[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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

function prepareZohoBooksCodingOnyxData<TSettingName extends keyof ZohoBooksCoding>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<ZohoBooksCoding[TSettingName]>,
    oldSettingValue: Partial<ZohoBooksCoding[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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

function prepareZohoBooksFieldMappingOnyxData(
    policyID: string,
    fieldID: keyof NonNullable<ZohoBooksCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<ZohoBooksCoding['fieldMappings']>>,
    oldMapping: ValueOf<NonNullable<ZohoBooksCoding['fieldMappings']>> | null,
) {
    const fieldOfflineFeedbackKey = `${CONST.ZOHO_BOOKS_CONFIG.FIELD_MAPPING_PREFIX}${fieldID}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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

function prepareZohoBooksExportOnyxData<TSettingName extends keyof ZohoBooksExport>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<ZohoBooksExport[TSettingName]>,
    oldSettingValue: Partial<ZohoBooksExport[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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

function prepareZohoBooksAutoSyncOnyxData(policyID: string, enabled: ZohoBooksAutoSync['enabled'], oldEnabled?: ZohoBooksAutoSync['enabled'] | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
                        config: {
                            autoSync: {
                                enabled,
                            },
                            pendingFields: {
                                [CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
                        config: {
                            pendingFields: {
                                [CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
                        config: {
                            autoSync: {
                                enabled: oldEnabled ?? null,
                            },
                            pendingFields: {
                                [CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function prepareZohoBooksSyncOnyxData<TSettingName extends keyof ZohoBooksSync>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<ZohoBooksSync[TSettingName]>,
    oldSettingValue: Partial<ZohoBooksSync[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
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

function prepareZohoBooksCardProgramAccountOnyxData(
    policyID: string,
    feedKey: keyof ZohoBooksExport['cardProgramAccounts'],
    accountID: ValueOf<ZohoBooksExport['cardProgramAccounts']>,
    oldAccountID?: ValueOf<ZohoBooksExport['cardProgramAccounts']> | null,
) {
    const cardProgramAccountOfflineFeedbackKey = `${CONST.ZOHO_BOOKS_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
                        config: {
                            export: {
                                cardProgramAccounts: {
                                    // An empty accountID string implies clearing the custom account
                                    [feedKey]: accountID || null,
                                },
                            },
                            pendingFields: {
                                [cardProgramAccountOfflineFeedbackKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [cardProgramAccountOfflineFeedbackKey]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
                        config: {
                            pendingFields: {
                                [cardProgramAccountOfflineFeedbackKey]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
                        config: {
                            export: {
                                cardProgramAccounts: {
                                    [feedKey]: oldAccountID ?? null,
                                },
                            },
                            pendingFields: {
                                [cardProgramAccountOfflineFeedbackKey]: null,
                            },
                            errorFields: {
                                [cardProgramAccountOfflineFeedbackKey]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function updateZohoBooksOrganization(policyID: string, organizationID: ZohoBooksConnectionsConfig['organizationID'], oldSubsidiaryID?: ZohoBooksConnectionsConfig['organizationID']) {
    const onyxData = prepareZohoBooksOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.ORGANIZATION_ID, organizationID, oldSubsidiaryID ?? null);
    const params: UpdateZohoBooksOrganizationParams = {
        policyID,
        organizationID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_ORGANIZATION, params, onyxData);
}

function updateZohoBooksEnableNewCategories(policyID: string, enabled: ZohoBooksConnectionsConfig['enableNewCategories'], oldEnabled?: ZohoBooksConnectionsConfig['enableNewCategories']) {
    const onyxData = prepareZohoBooksOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES, enabled, oldEnabled ?? null);
    const parameters: UpdateZohoBooksEnableNewCategoriesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateZohoBooksSyncTaxRates(policyID: string, enabled: ZohoBooksCoding['syncTaxRates'], oldEnabled?: ZohoBooksCoding['syncTaxRates']) {
    const onyxData = prepareZohoBooksCodingOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.SYNC_TAX_RATES, enabled, oldEnabled ?? null);
    const parameters: UpdateZohoBooksSyncTaxRatesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_SYNC_TAX_RATES, parameters, onyxData);
}

function updateZohoBooksFieldMapping(
    policyID: string,
    fieldID: keyof NonNullable<ZohoBooksCoding['fieldMappings']>,
    mapping: ValueOf<NonNullable<ZohoBooksCoding['fieldMappings']>>,
    oldMapping?: ValueOf<NonNullable<ZohoBooksCoding['fieldMappings']>>,
) {
    const onyxData = prepareZohoBooksFieldMappingOnyxData(policyID, fieldID, mapping, oldMapping ?? null);
    const parameters: UpdateZohoBooksFieldMappingParams = {
        policyID,
        fieldID,
        mapping,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_FIELD_MAPPING, parameters, onyxData);
}

function updateZohoBooksExporter(policyID: string, email: ZohoBooksExport['exporter'], oldEmail?: ZohoBooksExport['exporter']) {
    const onyxData = prepareZohoBooksExportOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateZohoBooksExporterParams = {
        policyID,
        email,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_EXPORTER, parameters, onyxData);
}

function updateZohoBooksExportDate(policyID: string, value: ZohoBooksExport['exportDate'], oldValue?: ZohoBooksExport['exportDate']) {
    const onyxData = prepareZohoBooksExportOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateZohoBooksExportDateParams = {
        policyID,
        value,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_EXPORT_DATE, parameters, onyxData);
}

function updateZohoBooksDefaultVendor(policyID: string, vendorID: ZohoBooksExport['defaultVendorID'], oldVendorID?: ZohoBooksExport['defaultVendorID']) {
    const onyxData = prepareZohoBooksExportOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.DEFAULT_VENDORID, vendorID, oldVendorID ?? null);
    const parameters: UpdateZohoBooksDefaultVendorParams = {
        policyID,
        vendorID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_DEFAULT_VENDOR, parameters, onyxData);
}

function updateZohoBooksCreditCardAccount(policyID: string, creditCardAccountID: ZohoBooksExport['creditCardAccountID'], oldCreditCardAccountID?: ZohoBooksExport['creditCardAccountID']) {
    const onyxData = prepareZohoBooksExportOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.CREDIT_CARD_ACCOUNT_ID, creditCardAccountID, oldCreditCardAccountID ?? null);
    const parameters: UpdateZohoBooksCreditCardAccountParams = {
        policyID,
        creditCardAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_CREDIT_CARD_ACCOUNT, parameters, onyxData);
}

function updateZohoBooksAutoSync(policyID: string, enabled: ZohoBooksAutoSync['enabled'], oldEnabled?: ZohoBooksAutoSync['enabled']) {
    const onyxData = prepareZohoBooksAutoSyncOnyxData(policyID, enabled, oldEnabled ?? null);
    const parameters: UpdateZohoBooksAutoSyncParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_AUTO_SYNC, parameters, onyxData);
}

function updateZohoBooksAccountingMethod(policyID: string, accountingMethod: ZohoBooksExport['accountingMethod'], oldAccountingMethod?: ZohoBooksExport['accountingMethod']) {
    const onyxData = prepareZohoBooksExportOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod ?? null);
    const parameters: UpdateZohoBooksAccountingMethodParams = {
        policyID,
        accountingMethod,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_ACCOUNTING_METHOD, parameters, onyxData);
}

function updateZohoBooksSyncReimbursedReports(policyID: string, enabled: ZohoBooksSync['syncReimbursedReports'], oldEnabled?: ZohoBooksSync['syncReimbursedReports']) {
    const onyxData = prepareZohoBooksSyncOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, oldEnabled ?? null);
    const parameters: UpdateZohoBooksSyncReimbursedReportsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateZohoBooksBillPaymentAccount(policyID: string, billPaymentAccountID: ZohoBooksSync['billPaymentAccountID'], oldBillPaymentAccountID?: ZohoBooksSync['billPaymentAccountID']) {
    const onyxData = prepareZohoBooksSyncOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.BILL_PAYMENT_ACCOUNT_ID, billPaymentAccountID, oldBillPaymentAccountID ?? null);
    const parameters: UpdateZohoBooksBillPaymentAccountParams = {
        policyID,
        billPaymentAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_BILL_PAYMENT_ACCOUNT, parameters, onyxData);
}

function updateZohoBooksSyncExpensifyCardSettlements(policyID: string, enabled: ZohoBooksSync['syncExpensifyCardSettlements'], oldEnabled?: ZohoBooksSync['syncExpensifyCardSettlements']) {
    const onyxData = prepareZohoBooksSyncOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateZohoBooksSyncExpensifyCardSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_SYNC_EXPENSIFY_CARD_SETTLEMENTS, parameters, onyxData);
}

function updateZohoBooksSettlementsAccount(
    policyID: string,
    settlementsBankAccountID: ZohoBooksSync['settlementsBankAccountID'],
    oldSettlementsBankAccountID?: ZohoBooksSync['settlementsBankAccountID'],
) {
    const onyxData = prepareZohoBooksSyncOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID, settlementsBankAccountID, oldSettlementsBankAccountID ?? null);
    const parameters: UpdateZohoBooksSettlementsAccountParams = {
        policyID,
        settlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateZohoBooksSyncTravelInvoicingSettlements(
    policyID: string,
    enabled: ZohoBooksSync['syncTravelInvoicingSettlements'],
    oldEnabled?: ZohoBooksSync['syncTravelInvoicingSettlements'],
) {
    const onyxData = prepareZohoBooksSyncOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateZohoBooksSyncTravelInvoicingSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_SYNC_TRAVEL_INVOICING_SETTLEMENTS, parameters, onyxData);
}

function updateZohoBooksTravelInvoicingSettlementsAccount(
    policyID: string,
    travelInvoicingSettlementsBankAccountID: ZohoBooksSync['travelInvoicingSettlementsBankAccountID'],
    oldTravelInvoicingSettlementsBankAccountID?: ZohoBooksSync['travelInvoicingSettlementsBankAccountID'],
) {
    const onyxData = prepareZohoBooksSyncOnyxData(
        policyID,
        CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID,
        travelInvoicingSettlementsBankAccountID,
        oldTravelInvoicingSettlementsBankAccountID ?? null,
    );
    const parameters: UpdateZohoBooksTravelInvoicingSettlementsAccountParams = {
        policyID,
        travelInvoicingSettlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_TRAVEL_INVOICING_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateZohoBooksTravelInvoicingPayableAccount(
    policyID: string,
    travelInvoicingPayableAccountID: ZohoBooksExport['travelInvoicingPayableAccountID'],
    oldTravelInvoicingPayableAccountID?: ZohoBooksExport['travelInvoicingPayableAccountID'],
) {
    const onyxData = prepareZohoBooksExportOnyxData(
        policyID,
        CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID,
        travelInvoicingPayableAccountID,
        oldTravelInvoicingPayableAccountID ?? null,
    );
    const parameters: UpdateZohoBooksTravelInvoicingPayableAccountParams = {
        policyID,
        travelInvoicingPayableAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_TRAVEL_INVOICING_PAYABLE_ACCOUNT, parameters, onyxData);
}

function updateZohoBooksExportToMultipleAccounts(policyID: string, enabled: ZohoBooksExport['exportToMultipleAccounts'], oldEnabled?: ZohoBooksExport['exportToMultipleAccounts']) {
    const onyxData = prepareZohoBooksExportOnyxData(policyID, CONST.ZOHO_BOOKS_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS, enabled, oldEnabled ?? null);
    const parameters: UpdateZohoBooksExportToMultipleAccountsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_EXPORT_TO_MULTIPLE_ACCOUNTS, parameters, onyxData);
}

function updateZohoBooksCardProgramAccount(
    policyID: string,
    feedKey: keyof ZohoBooksExport['cardProgramAccounts'],
    cardProgramAccountID: ValueOf<ZohoBooksExport['cardProgramAccounts']>,
    oldCardProgramAccountID?: ValueOf<ZohoBooksExport['cardProgramAccounts']>,
) {
    const onyxData = prepareZohoBooksCardProgramAccountOnyxData(policyID, feedKey, cardProgramAccountID, oldCardProgramAccountID ?? null);
    const parameters: UpdateZohoBooksCardProgramAccountParams = {
        policyID,
        feedKey,
        cardProgramAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_ZOHO_BOOKS_CARD_PROGRAM_ACCOUNT, parameters, onyxData);
}

export {
    getZohoBooksSetupLink,
    clearZohoBooksErrorField,
    updateZohoBooksOrganization,
    updateZohoBooksEnableNewCategories,
    updateZohoBooksSyncTaxRates,
    updateZohoBooksFieldMapping,
    updateZohoBooksExporter,
    updateZohoBooksExportDate,
    updateZohoBooksDefaultVendor,
    updateZohoBooksCreditCardAccount,
    updateZohoBooksAutoSync,
    updateZohoBooksAccountingMethod,
    updateZohoBooksSyncReimbursedReports,
    updateZohoBooksBillPaymentAccount,
    updateZohoBooksSyncExpensifyCardSettlements,
    updateZohoBooksSettlementsAccount,
    updateZohoBooksSyncTravelInvoicingSettlements,
    updateZohoBooksTravelInvoicingSettlementsAccount,
    updateZohoBooksTravelInvoicingPayableAccount,
    updateZohoBooksExportToMultipleAccounts,
    updateZohoBooksCardProgramAccount,
};
