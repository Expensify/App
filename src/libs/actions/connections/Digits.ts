/**
 * Onyx actions for the Digits accounting connection. Every setting saves optimistically with a pending field, and
 * rolls back to its previous value with an error when the server rejects it.
 */
import {write} from '@libs/API';
import type {
    UpdateDigitsAccountingMethodParams,
    UpdateDigitsAutoSyncParams,
    UpdateDigitsBillPaymentAccountParams,
    UpdateDigitsCardProgramAccountParams,
    UpdateDigitsCreditCardAccountParams,
    UpdateDigitsDefaultVendorParams,
    UpdateDigitsEnableNewCategoriesParams,
    UpdateDigitsExportDateParams,
    UpdateDigitsExporterParams,
    UpdateDigitsExportToMultipleAccountsParams,
    UpdateDigitsFieldMappingParams,
    UpdateDigitsSettlementsAccountParams,
    UpdateDigitsSyncExpensifyCardSettlementsParams,
    UpdateDigitsSyncReimbursedReportsParams,
    UpdateDigitsSyncTravelInvoicingSettlementsParams,
    UpdateDigitsTravelInvoicingPayableAccountParams,
    UpdateDigitsTravelInvoicingSettlementsAccountParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DigitsAutoSync, DigitsCoding, DigitsConnectionsConfig, DigitsExport, DigitsSync} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function getDigitsSetupLink(policyID: string) {
    // Digits authenticates with OAuth, so the connector opens this URL in the browser.
    const params = new URLSearchParams({policyID});
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_DIGITS, shouldSkipWebProxy: true});
    return commandURL + params.toString();
}

function clearDigitsErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function prepareDigitsOnyxData<TSettingName extends keyof DigitsConnectionsConfig>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<DigitsConnectionsConfig[TSettingName]>,
    oldSettingValue: Partial<DigitsConnectionsConfig[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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

function prepareDigitsFieldMappingOnyxData(
    policyID: string,
    fieldID: keyof NonNullable<DigitsCoding['fieldMappings']>,
    mapping: ValueOf<typeof CONST.DIGITS_MAPPING_VALUE>,
    oldMapping: ValueOf<typeof CONST.DIGITS_MAPPING_VALUE> | null,
) {
    const fieldOfflineFeedbackKey = `${CONST.DIGITS_CONFIG.FIELD_MAPPING_PREFIX}${fieldID}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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

function prepareDigitsExportOnyxData<TSettingName extends keyof DigitsExport>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<DigitsExport[TSettingName]>,
    oldSettingValue: Partial<DigitsExport[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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

function prepareDigitsAutoSyncOnyxData(policyID: string, enabled: DigitsAutoSync['enabled'], oldEnabled?: DigitsAutoSync['enabled'] | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
                        config: {
                            autoSync: {
                                enabled,
                            },
                            pendingFields: {
                                [CONST.DIGITS_CONFIG.AUTO_SYNC]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.DIGITS_CONFIG.AUTO_SYNC]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
                        config: {
                            pendingFields: {
                                [CONST.DIGITS_CONFIG.AUTO_SYNC]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
                        config: {
                            autoSync: {
                                enabled: oldEnabled ?? null,
                            },
                            pendingFields: {
                                [CONST.DIGITS_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.DIGITS_CONFIG.AUTO_SYNC]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function prepareDigitsSyncOnyxData<TSettingName extends keyof DigitsSync>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<DigitsSync[TSettingName]>,
    oldSettingValue: Partial<DigitsSync[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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

function prepareDigitsCardProgramAccountOnyxData(
    policyID: string,
    feedKey: keyof DigitsExport['cardProgramAccounts'],
    accountID: ValueOf<DigitsExport['cardProgramAccounts']>,
    oldAccountID?: ValueOf<DigitsExport['cardProgramAccounts']> | null,
) {
    const cardProgramAccountOfflineFeedbackKey = `${CONST.DIGITS_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
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

function updateDigitsEnableNewCategories(policyID: string, enabled: DigitsConnectionsConfig['enableNewCategories'], oldEnabled?: DigitsConnectionsConfig['enableNewCategories']) {
    const onyxData = prepareDigitsOnyxData(policyID, CONST.DIGITS_CONFIG.ENABLE_NEW_CATEGORIES, enabled, oldEnabled ?? null);
    const parameters: UpdateDigitsEnableNewCategoriesParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateDigitsFieldMapping(
    policyID: string,
    fieldID: keyof NonNullable<DigitsCoding['fieldMappings']>,
    mapping: ValueOf<typeof CONST.DIGITS_MAPPING_VALUE>,
    oldMapping?: ValueOf<typeof CONST.DIGITS_MAPPING_VALUE>,
) {
    const onyxData = prepareDigitsFieldMappingOnyxData(policyID, fieldID, mapping, oldMapping ?? null);
    const parameters: UpdateDigitsFieldMappingParams = {
        policyID,
        fieldID,
        mapping,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_FIELD_MAPPING, parameters, onyxData);
}

function updateDigitsExporter(policyID: string, email: DigitsExport['exporter'], oldEmail?: DigitsExport['exporter']) {
    const onyxData = prepareDigitsExportOnyxData(policyID, CONST.DIGITS_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateDigitsExporterParams = {
        policyID,
        email,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_EXPORTER, parameters, onyxData);
}

function updateDigitsExportDate(policyID: string, value: DigitsExport['exportDate'], oldValue?: DigitsExport['exportDate']) {
    const onyxData = prepareDigitsExportOnyxData(policyID, CONST.DIGITS_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateDigitsExportDateParams = {
        policyID,
        value,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_EXPORT_DATE, parameters, onyxData);
}

function updateDigitsDefaultVendor(policyID: string, vendorID: DigitsExport['defaultVendorID'], oldVendorID?: DigitsExport['defaultVendorID']) {
    const onyxData = prepareDigitsExportOnyxData(policyID, CONST.DIGITS_CONFIG.DEFAULT_VENDORID, vendorID, oldVendorID ?? null);
    const parameters: UpdateDigitsDefaultVendorParams = {
        policyID,
        vendorID,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_DEFAULT_VENDOR, parameters, onyxData);
}

function updateDigitsCreditCardAccount(policyID: string, creditCardAccountID: DigitsExport['creditCardAccountID'], oldCreditCardAccountID?: DigitsExport['creditCardAccountID']) {
    const onyxData = prepareDigitsExportOnyxData(policyID, CONST.DIGITS_CONFIG.CREDIT_CARD_ACCOUNT_ID, creditCardAccountID, oldCreditCardAccountID ?? null);
    const parameters: UpdateDigitsCreditCardAccountParams = {
        policyID,
        creditCardAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_CREDIT_CARD_ACCOUNT, parameters, onyxData);
}

function updateDigitsAutoSync(policyID: string, enabled: DigitsAutoSync['enabled'], oldEnabled?: DigitsAutoSync['enabled']) {
    const onyxData = prepareDigitsAutoSyncOnyxData(policyID, enabled, oldEnabled ?? null);
    const parameters: UpdateDigitsAutoSyncParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_AUTO_SYNC, parameters, onyxData);
}

function updateDigitsAccountingMethod(policyID: string, accountingMethod: DigitsExport['accountingMethod'], oldAccountingMethod?: DigitsExport['accountingMethod']) {
    const onyxData = prepareDigitsExportOnyxData(policyID, CONST.DIGITS_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod ?? null);
    const parameters: UpdateDigitsAccountingMethodParams = {
        policyID,
        accountingMethod,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_ACCOUNTING_METHOD, parameters, onyxData);
}

function updateDigitsSyncReimbursedReports(policyID: string, enabled: DigitsSync['syncReimbursedReports'], oldEnabled?: DigitsSync['syncReimbursedReports']) {
    const onyxData = prepareDigitsSyncOnyxData(policyID, CONST.DIGITS_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, oldEnabled ?? null);
    const parameters: UpdateDigitsSyncReimbursedReportsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateDigitsBillPaymentAccount(policyID: string, billPaymentAccountID: DigitsSync['billPaymentAccountID'], oldBillPaymentAccountID?: DigitsSync['billPaymentAccountID']) {
    const onyxData = prepareDigitsSyncOnyxData(policyID, CONST.DIGITS_CONFIG.BILL_PAYMENT_ACCOUNT_ID, billPaymentAccountID, oldBillPaymentAccountID ?? null);
    const parameters: UpdateDigitsBillPaymentAccountParams = {
        policyID,
        billPaymentAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_BILL_PAYMENT_ACCOUNT, parameters, onyxData);
}

function updateDigitsSyncExpensifyCardSettlements(policyID: string, enabled: DigitsSync['syncExpensifyCardSettlements'], oldEnabled?: DigitsSync['syncExpensifyCardSettlements']) {
    const onyxData = prepareDigitsSyncOnyxData(policyID, CONST.DIGITS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateDigitsSyncExpensifyCardSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_SYNC_EXPENSIFY_CARD_SETTLEMENTS, parameters, onyxData);
}

function updateDigitsSettlementsAccount(
    policyID: string,
    settlementsBankAccountID: DigitsSync['settlementsBankAccountID'],
    oldSettlementsBankAccountID?: DigitsSync['settlementsBankAccountID'],
) {
    const onyxData = prepareDigitsSyncOnyxData(policyID, CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID, settlementsBankAccountID, oldSettlementsBankAccountID ?? null);
    const parameters: UpdateDigitsSettlementsAccountParams = {
        policyID,
        settlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateDigitsSyncTravelInvoicingSettlements(policyID: string, enabled: DigitsSync['syncTravelInvoicingSettlements'], oldEnabled?: DigitsSync['syncTravelInvoicingSettlements']) {
    const onyxData = prepareDigitsSyncOnyxData(policyID, CONST.DIGITS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateDigitsSyncTravelInvoicingSettlementsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_SYNC_TRAVEL_BILLING_SETTLEMENTS, parameters, onyxData);
}

function updateDigitsTravelInvoicingSettlementsAccount(
    policyID: string,
    travelInvoicingSettlementsBankAccountID: DigitsSync['travelInvoicingSettlementsBankAccountID'],
    oldTravelInvoicingSettlementsBankAccountID?: DigitsSync['travelInvoicingSettlementsBankAccountID'],
) {
    const onyxData = prepareDigitsSyncOnyxData(
        policyID,
        CONST.DIGITS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID,
        travelInvoicingSettlementsBankAccountID,
        oldTravelInvoicingSettlementsBankAccountID ?? null,
    );
    const parameters: UpdateDigitsTravelInvoicingSettlementsAccountParams = {
        policyID,
        travelInvoicingSettlementsBankAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_TRAVEL_BILLING_SETTLEMENTS_ACCOUNT, parameters, onyxData);
}

function updateDigitsTravelInvoicingPayableAccount(
    policyID: string,
    travelInvoicingPayableAccountID: DigitsExport['travelInvoicingPayableAccountID'],
    oldTravelInvoicingPayableAccountID?: DigitsExport['travelInvoicingPayableAccountID'],
) {
    const onyxData = prepareDigitsExportOnyxData(
        policyID,
        CONST.DIGITS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID,
        travelInvoicingPayableAccountID,
        oldTravelInvoicingPayableAccountID ?? null,
    );
    const parameters: UpdateDigitsTravelInvoicingPayableAccountParams = {
        policyID,
        travelInvoicingPayableAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_TRAVEL_BILLING_PAYABLE_ACCOUNT, parameters, onyxData);
}

function updateDigitsExportToMultipleAccounts(policyID: string, enabled: DigitsExport['exportToMultipleAccounts'], oldEnabled?: DigitsExport['exportToMultipleAccounts']) {
    const onyxData = prepareDigitsExportOnyxData(policyID, CONST.DIGITS_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS, enabled, oldEnabled ?? null);
    const parameters: UpdateDigitsExportToMultipleAccountsParams = {
        policyID,
        enabled,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_EXPORT_TO_MULTIPLE_ACCOUNTS, parameters, onyxData);
}

function updateDigitsCardProgramAccount(
    policyID: string,
    feedKey: keyof DigitsExport['cardProgramAccounts'],
    cardProgramAccountID: ValueOf<DigitsExport['cardProgramAccounts']>,
    oldCardProgramAccountID?: ValueOf<DigitsExport['cardProgramAccounts']>,
) {
    const onyxData = prepareDigitsCardProgramAccountOnyxData(policyID, feedKey, cardProgramAccountID, oldCardProgramAccountID ?? null);
    const parameters: UpdateDigitsCardProgramAccountParams = {
        policyID,
        feedKey,
        cardProgramAccountID,
    };
    write(WRITE_COMMANDS.UPDATE_DIGITS_CARD_PROGRAM_ACCOUNT, parameters, onyxData);
}

export {
    getDigitsSetupLink,
    clearDigitsErrorField,
    updateDigitsEnableNewCategories,
    updateDigitsFieldMapping,
    updateDigitsExporter,
    updateDigitsExportDate,
    updateDigitsDefaultVendor,
    updateDigitsCreditCardAccount,
    updateDigitsAutoSync,
    updateDigitsAccountingMethod,
    updateDigitsSyncReimbursedReports,
    updateDigitsBillPaymentAccount,
    updateDigitsSyncExpensifyCardSettlements,
    updateDigitsSettlementsAccount,
    updateDigitsSyncTravelInvoicingSettlements,
    updateDigitsTravelInvoicingSettlementsAccount,
    updateDigitsTravelInvoicingPayableAccount,
    updateDigitsExportToMultipleAccounts,
    updateDigitsCardProgramAccount,
};
