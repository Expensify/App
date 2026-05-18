import type {CONST as COMMON_CONST} from 'expensify-common';
import isObject from 'lodash/isObject';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToAccountingIntegrationParams, UpdateXeroGenericTypeParams} from '@libs/API/parameters';
import type UpdateXeroAccountingMethodParams from '@libs/API/parameters/UpdateXeroAccountingMethodParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {Connections, XeroTrackingCategory} from '@src/types/onyx/Policy';

const getXeroSetupLink = (policyID: string) => {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_XERO, shouldSkipWebProxy: true});
    return commandURL + new URLSearchParams(params).toString();
};

const getTrackingCategories = (policy: OnyxEntry<OnyxTypes.Policy>): Array<XeroTrackingCategory & {value: string}> => {
    const {trackingCategories} = policy?.connections?.xero?.data ?? {};
    const {mappings} = policy?.connections?.xero?.config ?? {};

    if (!trackingCategories) {
        return [];
    }

    return trackingCategories.map((category) => ({
        ...category,
        value: mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`] ?? '',
    }));
};

function createXeroPendingFields<TSettingName extends keyof Connections['xero']['config']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config'][TSettingName]>,
    pendingValue: OnyxCommon.PendingAction,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: pendingValue};
    }

    return Object.keys(settingValue).reduce<Record<string, OnyxCommon.PendingAction>>((acc, setting) => {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}

function createXeroExportPendingFields<TSettingName extends keyof Connections['xero']['config']['export']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config']['export'][TSettingName]>,
    pendingValue: OnyxCommon.PendingAction,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: pendingValue};
    }

    return Object.keys(settingValue).reduce<Record<string, OnyxCommon.PendingAction>>((acc, setting) => {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}

function createXeroSyncPendingFields<TSettingName extends keyof Connections['xero']['config']['sync']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config']['sync'][TSettingName]>,
    pendingValue: OnyxCommon.PendingAction,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: pendingValue};
    }

    return Object.keys(settingValue).reduce<Record<string, OnyxCommon.PendingAction>>((acc, setting) => {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}

function createXeroErrorFields<TSettingName extends keyof Connections['xero']['config']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config'][TSettingName]>,
    errorValue: OnyxCommon.Errors | null,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: errorValue};
    }

    return Object.keys(settingValue).reduce<OnyxCommon.ErrorFields>((acc, setting) => {
        acc[setting] = errorValue;
        return acc;
    }, {});
}

function createXeroExportErrorFields<TSettingName extends keyof Connections['xero']['config']['export']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config']['export'][TSettingName]>,
    errorValue: OnyxCommon.Errors | null,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: errorValue};
    }

    return Object.keys(settingValue).reduce<OnyxCommon.ErrorFields>((acc, setting) => {
        acc[setting] = errorValue;
        return acc;
    }, {});
}

function createXeroSyncErrorFields<TSettingName extends keyof Connections['xero']['config']['sync']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config']['sync'][TSettingName]>,
    errorValue: OnyxCommon.Errors | null,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: errorValue};
    }

    return Object.keys(settingValue).reduce<OnyxCommon.ErrorFields>((acc, setting) => {
        acc[setting] = errorValue;
        return acc;
    }, {});
}

function prepareXeroOptimisticData<TSettingName extends keyof Connections['xero']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config'][TSettingName]>,
    oldSettingValue?: Partial<Connections['xero']['config'][TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    xero: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: createXeroPendingFields(settingName, settingValue, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            errorFields: createXeroErrorFields(settingName, settingValue, null),
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
                    xero: {
                        config: {
                            [settingName]: oldSettingValue ?? null,
                            pendingFields: createXeroPendingFields(settingName, settingValue, null),
                            errorFields: createXeroErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
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
                    xero: {
                        config: {
                            pendingFields: createXeroPendingFields(settingName, settingValue, null),
                            errorFields: createXeroErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function prepareXeroExportOptimisticData<TSettingName extends keyof Connections['xero']['config']['export']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config']['export'][TSettingName]>,
    oldSettingValue?: Partial<Connections['xero']['config']['export'][TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    xero: {
                        config: {
                            export: {
                                [settingName]: settingValue ?? null,
                            },
                            pendingFields: createXeroExportPendingFields(settingName, settingValue, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            errorFields: createXeroExportErrorFields(settingName, settingValue, null),
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
                    xero: {
                        config: {
                            export: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: createXeroExportPendingFields(settingName, settingValue, null),
                            errorFields: createXeroExportErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
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
                    xero: {
                        config: {
                            pendingFields: createXeroExportPendingFields(settingName, settingValue, null),
                            errorFields: createXeroExportErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function prepareXeroSyncOptimisticData<TSettingName extends keyof Connections['xero']['config']['sync']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config']['sync'][TSettingName]>,
    oldSettingValue?: Partial<Connections['xero']['config']['sync'][TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    xero: {
                        config: {
                            sync: {
                                [settingName]: settingValue ?? null,
                            },
                            pendingFields: createXeroSyncPendingFields(settingName, settingValue, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            errorFields: createXeroSyncErrorFields(settingName, settingValue, null),
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
                    xero: {
                        config: {
                            sync: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: createXeroSyncPendingFields(settingName, settingValue, null),
                            errorFields: createXeroSyncErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
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
                    xero: {
                        config: {
                            pendingFields: createXeroSyncPendingFields(settingName, settingValue, null),
                            errorFields: createXeroSyncErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function updateXeroImportTrackingCategories(
    policyID: string,
    importTrackingCategories: Partial<Connections['xero']['config']['importTrackingCategories']>,
    oldImportTrackingCategories?: Partial<Connections['xero']['config']['importTrackingCategories']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(importTrackingCategories),
        idempotencyKey: String(CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES),
    };

    const {optimisticData, failureData, successData} = prepareXeroOptimisticData(
        policyID,
        CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES,
        importTrackingCategories,
        oldImportTrackingCategories,
    );

    API.write(WRITE_COMMANDS.UPDATE_XERO_IMPORT_TRACKING_CATEGORIES, parameters, {optimisticData, failureData, successData});
}

function updateXeroImportTaxRates(
    policyID: string,
    importTaxesRate: Partial<Connections['xero']['config']['importTaxRates']>,
    oldImportTaxesRate?: Partial<Connections['xero']['config']['importTaxRates']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(importTaxesRate),
        idempotencyKey: String(CONST.XERO_CONFIG.IMPORT_TAX_RATES),
    };

    const {optimisticData, failureData, successData} = prepareXeroOptimisticData(policyID, CONST.XERO_CONFIG.IMPORT_TAX_RATES, importTaxesRate, oldImportTaxesRate);

    API.write(WRITE_COMMANDS.UPDATE_XERO_IMPORT_TAX_RATES, parameters, {optimisticData, failureData, successData});
}

function updateXeroTenantID(policyID: string, settingValue: string, oldSettingValue?: string) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.XERO_CONFIG.TENANT_ID),
    };

    const {optimisticData, successData, failureData} = prepareXeroOptimisticData(policyID, CONST.XERO_CONFIG.TENANT_ID, settingValue, oldSettingValue);

    API.write(WRITE_COMMANDS.UPDATE_XERO_TENANT_ID, parameters, {optimisticData, successData, failureData});
}

function updateXeroMappings(policyID: string, mappingValue: Partial<Connections['xero']['config']['mappings']>, oldMappingValue?: Partial<Connections['xero']['config']['mappings']>) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(mappingValue),
        idempotencyKey: String(CONST.XERO_CONFIG.MAPPINGS),
    };

    const {optimisticData, failureData, successData} = prepareXeroOptimisticData(policyID, CONST.XERO_CONFIG.MAPPINGS, mappingValue, oldMappingValue);

    API.write(WRITE_COMMANDS.UPDATE_XERO_MAPPING, parameters, {optimisticData, failureData, successData});
}

function updateXeroImportCustomers(
    policyID: string,
    importCustomers: Partial<Connections['xero']['config']['importCustomers']>,
    oldImportCustomers?: Partial<Connections['xero']['config']['importCustomers']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(importCustomers),
        idempotencyKey: String(CONST.XERO_CONFIG.IMPORT_CUSTOMERS),
    };

    const {optimisticData, failureData, successData} = prepareXeroOptimisticData(policyID, CONST.XERO_CONFIG.IMPORT_CUSTOMERS, importCustomers, oldImportCustomers);

    API.write(WRITE_COMMANDS.UPDATE_XERO_IMPORT_CUSTOMERS, parameters, {optimisticData, failureData, successData});
}

function updateXeroEnableNewCategories(
    policyID: string,
    enableNewCategories: Partial<Connections['xero']['config']['enableNewCategories']>,
    oldEnableNewCategories?: Partial<Connections['xero']['config']['enableNewCategories']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(enableNewCategories),
        idempotencyKey: String(CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES),
    };

    const {optimisticData, failureData, successData} = prepareXeroOptimisticData(policyID, CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES, enableNewCategories, oldEnableNewCategories);

    API.write(WRITE_COMMANDS.UPDATE_XERO_ENABLE_NEW_CATEGORIES, parameters, {optimisticData, failureData, successData});
}

function updateXeroAutoSync(policyID: string | undefined, autoSync: Partial<Connections['xero']['config']['autoSync']>, oldAutoSync?: Partial<Connections['xero']['config']['autoSync']>) {
    if (!policyID) {
        return;
    }

    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(autoSync),
        idempotencyKey: String(CONST.XERO_CONFIG.AUTO_SYNC),
    };

    const {optimisticData, failureData, successData} = prepareXeroOptimisticData(policyID, CONST.XERO_CONFIG.AUTO_SYNC, autoSync, oldAutoSync);

    API.write(WRITE_COMMANDS.UPDATE_XERO_AUTO_SYNC, parameters, {optimisticData, failureData, successData});
}

function updateXeroExportBillStatus(
    policyID: string,
    billStatus: Partial<Connections['xero']['config']['export']['billStatus']>,
    oldBillStatus?: Partial<Connections['xero']['config']['export']['billStatus']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(billStatus),
        idempotencyKey: String(CONST.XERO_CONFIG.BILL_STATUS),
    };

    const {optimisticData, failureData, successData} = prepareXeroExportOptimisticData(policyID, CONST.XERO_CONFIG.BILL_STATUS, billStatus, oldBillStatus);

    API.write(WRITE_COMMANDS.UPDATE_XERO_EXPORT_BILL_STATUS, parameters, {optimisticData, failureData, successData});
}

function updateXeroExportExporter(
    policyID: string,
    exporter: Partial<Connections['xero']['config']['export']['exporter']>,
    oldExporter?: Partial<Connections['xero']['config']['export']['exporter']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: exporter ?? '',
        idempotencyKey: String(CONST.XERO_CONFIG.EXPORTER),
    };

    const {optimisticData, failureData, successData} = prepareXeroExportOptimisticData(policyID, CONST.XERO_CONFIG.EXPORTER, exporter, oldExporter);

    API.write(WRITE_COMMANDS.UPDATE_XERO_EXPORT_EXPORTER, parameters, {optimisticData, failureData, successData});
}

function updateXeroExportBillDate(
    policyID: string,
    billDate: Partial<Connections['xero']['config']['export']['billDate']>,
    oldBillDate?: Partial<Connections['xero']['config']['export']['billDate']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: billDate,
        idempotencyKey: String(CONST.XERO_CONFIG.BILL_DATE),
    };

    const {optimisticData, failureData, successData} = prepareXeroExportOptimisticData(policyID, CONST.XERO_CONFIG.BILL_DATE, billDate, oldBillDate);

    API.write(WRITE_COMMANDS.UPDATE_XERO_EXPORT_BILL_DATE, parameters, {optimisticData, failureData, successData});
}

function updateXeroExportNonReimbursableAccount(
    policyID: string,
    nonReimbursableAccount: Partial<Connections['xero']['config']['export']['nonReimbursableAccount']>,
    oldNonReimbursableAccount?: Partial<Connections['xero']['config']['export']['nonReimbursableAccount']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: nonReimbursableAccount,
        idempotencyKey: String(CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT),
    };

    const {optimisticData, failureData, successData} = prepareXeroExportOptimisticData(
        policyID,
        CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT,
        nonReimbursableAccount,
        oldNonReimbursableAccount,
    );

    API.write(WRITE_COMMANDS.UPDATE_XERO_EXPORT_NON_REIMBURSABLE_ACCOUNT, parameters, {optimisticData, failureData, successData});
}

function updateXeroSyncInvoiceCollectionsAccountID(
    policyID: string,
    invoiceCollectionsAccountID: Partial<Connections['xero']['config']['sync']['invoiceCollectionsAccountID']>,
    oldInvoiceCollectionsAccountID?: Partial<Connections['xero']['config']['sync']['invoiceCollectionsAccountID']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: invoiceCollectionsAccountID,
        idempotencyKey: String(CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID),
    };

    const {optimisticData, failureData, successData} = prepareXeroSyncOptimisticData(
        policyID,
        CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID,
        invoiceCollectionsAccountID,
        oldInvoiceCollectionsAccountID,
    );

    API.write(WRITE_COMMANDS.UPDATE_XERO_SYNC_INVOICE_COLLECTIONS_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}

function updateXeroSyncReimbursementAccountID(
    policyID: string,
    reimbursementAccountID: Partial<Connections['xero']['config']['sync']['reimbursementAccountID']>,
    oldReimbursementAccountID?: Partial<Connections['xero']['config']['sync']['reimbursementAccountID']>,
) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: reimbursementAccountID,
        idempotencyKey: String(CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
    };

    const {optimisticData, failureData, successData} = prepareXeroSyncOptimisticData(policyID, CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID, reimbursementAccountID, oldReimbursementAccountID);

    API.write(WRITE_COMMANDS.UPDATE_XERO_SYNC_REIMBURSEMENT_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}

function updateXeroSyncSyncReimbursedReports(
    policyID: string | undefined,
    syncReimbursedReports: Partial<Connections['xero']['config']['sync']['syncReimbursedReports']>,
    oldSyncReimbursedReports?: Partial<Connections['xero']['config']['sync']['syncReimbursedReports']>,
) {
    if (!policyID) {
        return;
    }

    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(syncReimbursedReports),
        idempotencyKey: String(CONST.XERO_CONFIG.SYNC_REIMBURSED_REPORTS),
    };

    const {optimisticData, failureData, successData} = prepareXeroSyncOptimisticData(policyID, CONST.XERO_CONFIG.SYNC_REIMBURSED_REPORTS, syncReimbursedReports, oldSyncReimbursedReports);

    API.write(WRITE_COMMANDS.UPDATE_XERO_SYNC_SYNC_REIMBURSED_REPORTS, parameters, {optimisticData, failureData, successData});
}

function updateXeroAccountingMethod(
    policyID: string | undefined,
    accountingMethod: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>,
    oldAccountingMethod: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>,
) {
    if (!policyID) {
        return;
    }

    const parameters: UpdateXeroAccountingMethodParams = {
        policyID,
        accountingMethod,
    };

    const {optimisticData, failureData, successData} = prepareXeroExportOptimisticData(policyID, CONST.XERO_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod);

    API.write(WRITE_COMMANDS.UPDATE_XERO_ACCOUNTING_METHOD, parameters, {optimisticData, failureData, successData});
}

export {
    getXeroSetupLink,
    getTrackingCategories,
    updateXeroImportTrackingCategories,
    updateXeroImportTaxRates,
    updateXeroTenantID,
    updateXeroMappings,
    updateXeroImportCustomers,
    updateXeroEnableNewCategories,
    updateXeroAutoSync,
    updateXeroAccountingMethod,
    updateXeroExportBillStatus,
    updateXeroExportExporter,
    updateXeroExportBillDate,
    updateXeroExportNonReimbursableAccount,
    updateXeroSyncInvoiceCollectionsAccountID,
    updateXeroSyncSyncReimbursedReports,
    updateXeroSyncReimbursementAccountID,
};
