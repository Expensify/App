import {write} from '@libs/API';
import type {
    ConnectPolicyToBusinessCentralParams,
    UpdateBusinessCentralCompanyParams,
    UpdateBusinessCentralDefaultVendorParams,
    UpdateBusinessCentralEnableNewCategoriesParams,
    UpdateBusinessCentralExportDateParams,
    UpdateBusinessCentralExporterParams,
    UpdateBusinessCentralFieldMappingParams,
    UpdateBusinessCentralNonreimbursableAccountParams,
    UpdateBusinessCentralNonreimbursableExpensesExportDestinationParams,
    UpdateBusinessCentralPaymentMethodParams,
    UpdateBusinessCentralReimbursableAccountParams,
    UpdateBusinessCentralReimbursableExpensesExportDestinationParams,
    UpdateBusinessCentralSyncItemsParams,
    UpdateBusinessCentralSyncTaxRatesParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BusinessCentralCoding, BusinessCentralCodingOfflineFeedbackKeys, BusinessCentralExport} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

type BusinessCentralMappingValue = ValueOf<typeof CONST.BUSINESS_CENTRAL_MAPPING_VALUE>;

/** Coding values a single update writes. `null` clears a value that did not exist before the update when the request is rolled back. */
type BusinessCentralCodingUpdate = {
    [TSetting in keyof Omit<BusinessCentralCoding, 'fieldMappings'>]?: BusinessCentralCoding[TSetting] | null;
} & {
    fieldMappings?: Record<string, BusinessCentralMappingValue | null>;
};

function connectToBusinessCentral(policyID: string, credentials: Omit<ConnectPolicyToBusinessCentralParams, 'policyID'>) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.BUSINESS_CENTRAL_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: null,
        },
    ];
    const parameters: ConnectPolicyToBusinessCentralParams = {
        policyID,
        tenantID: credentials.tenantID,
        environmentName: credentials.environmentName,
        clientID: credentials.clientID,
        clientSecret: credentials.clientSecret,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_BUSINESS_CENTRAL, parameters, {optimisticData, failureData});
}

function clearBusinessCentralErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function updateBusinessCentralCompany(policyID: string, companyID: string, oldCompanyID?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: companyID,
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: oldCompanyID ?? null,
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateBusinessCentralCompanyParams = {policyID, companyID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_COMPANY, parameters, {optimisticData, successData, failureData});
}

function updateBusinessCentralEnableNewCategories(policyID: string, enabled: boolean, oldEnabled?: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: enabled,
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: oldEnabled ?? null,
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateBusinessCentralEnableNewCategoriesParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_ENABLE_NEW_CATEGORIES, parameters, {optimisticData, successData, failureData});
}

/**
 * Builds the Onyx updates for a change to the coding settings. The pending and error state lives under `pendingField`,
 * which for a dimension mapping is the prefixed dimension code so only that row shows the indicator.
 */
function prepareBusinessCentralCodingOnyxData(
    policyID: string,
    pendingField: BusinessCentralCodingOfflineFeedbackKeys,
    coding: BusinessCentralCodingUpdate,
    oldCoding: BusinessCentralCodingUpdate,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            coding,
                            pendingFields: {
                                [pendingField]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [pendingField]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            pendingFields: {
                                [pendingField]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            coding: oldCoding,
                            pendingFields: {
                                [pendingField]: null,
                            },
                            errorFields: {
                                [pendingField]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function updateBusinessCentralSyncTaxRates(policyID: string, enabled: boolean, oldEnabled?: boolean) {
    const onyxData = prepareBusinessCentralCodingOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES, {syncTaxRates: enabled}, {syncTaxRates: oldEnabled ?? null});
    const parameters: UpdateBusinessCentralSyncTaxRatesParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_SYNC_TAX_RATES, parameters, onyxData);
}

function updateBusinessCentralSyncItems(policyID: string, enabled: boolean, oldEnabled?: boolean) {
    const onyxData = prepareBusinessCentralCodingOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS, {syncItems: enabled}, {syncItems: oldEnabled ?? null});
    const parameters: UpdateBusinessCentralSyncItemsParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_SYNC_ITEMS, parameters, onyxData);
}

function updateBusinessCentralFieldMapping(policyID: string, dimensionCode: string, mapping: BusinessCentralMappingValue, oldMapping?: BusinessCentralMappingValue) {
    const onyxData = prepareBusinessCentralCodingOnyxData(
        policyID,
        `${CONST.BUSINESS_CENTRAL_CONFIG.FIELD_MAPPING_PREFIX}${dimensionCode}`,
        {fieldMappings: {[dimensionCode]: mapping}},
        {fieldMappings: {[dimensionCode]: oldMapping ?? null}},
    );
    const parameters: UpdateBusinessCentralFieldMappingParams = {policyID, dimensionCode, mapping};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_FIELD_MAPPING, parameters, onyxData);
}

/**
 * Builds the Onyx updates for a change to one export setting. The pending and error state lives under the setting's own key.
 */
function prepareBusinessCentralExportOnyxData<TSettingName extends keyof BusinessCentralExport>(
    policyID: string,
    settingName: TSettingName,
    settingValue: BusinessCentralExport[TSettingName],
    oldSettingValue: BusinessCentralExport[TSettingName] | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            export: {
                                [settingName]: settingValue,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            export: {
                                [settingName]: oldSettingValue,
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

function updateBusinessCentralExporter(policyID: string, email: BusinessCentralExport['exporter'], oldEmail?: BusinessCentralExport['exporter']) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateBusinessCentralExporterParams = {policyID, email};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_EXPORTER, parameters, onyxData);
}

function updateBusinessCentralExportDate(policyID: string, value: BusinessCentralExport['exportDate'], oldValue?: BusinessCentralExport['exportDate']) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateBusinessCentralExportDateParams = {policyID, value};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_EXPORT_DATE, parameters, onyxData);
}

function updateBusinessCentralReimbursableExpensesExportDestination(policyID: string, value: BusinessCentralExport['reimbursable'], oldValue?: BusinessCentralExport['reimbursable']) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE, value, oldValue ?? null);
    const parameters: UpdateBusinessCentralReimbursableExpensesExportDestinationParams = {policyID, value};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateBusinessCentralNonReimbursableExpensesExportDestination(
    policyID: string,
    value: BusinessCentralExport['nonReimbursable'],
    oldValue?: BusinessCentralExport['nonReimbursable'],
) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE, value, oldValue ?? null);
    const parameters: UpdateBusinessCentralNonreimbursableExpensesExportDestinationParams = {policyID, value};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateBusinessCentralReimbursableAccount(
    policyID: string,
    bankAccountID: BusinessCentralExport['reimbursableAccount'],
    oldBankAccountID?: BusinessCentralExport['reimbursableAccount'],
) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE_ACCOUNT, bankAccountID, oldBankAccountID ?? null);
    const parameters: UpdateBusinessCentralReimbursableAccountParams = {policyID, value: bankAccountID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_REIMBURSABLE_ACCOUNT, parameters, onyxData);
}

function updateBusinessCentralNonReimbursableAccount(
    policyID: string,
    bankAccountID: BusinessCentralExport['nonReimbursableAccount'],
    oldBankAccountID?: BusinessCentralExport['nonReimbursableAccount'],
) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE_ACCOUNT, bankAccountID, oldBankAccountID ?? null);
    const parameters: UpdateBusinessCentralNonreimbursableAccountParams = {policyID, value: bankAccountID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_NONREIMBURSABLE_ACCOUNT, parameters, onyxData);
}

function updateBusinessCentralDefaultVendor(policyID: string, vendorID: BusinessCentralExport['defaultVendorID'], oldVendorID?: BusinessCentralExport['defaultVendorID']) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.DEFAULT_VENDOR_ID, vendorID, oldVendorID ?? null);
    const parameters: UpdateBusinessCentralDefaultVendorParams = {policyID, vendorID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_DEFAULT_VENDOR, parameters, onyxData);
}

/** An empty `paymentMethodCode` clears the payment method. */
function updateBusinessCentralPaymentMethod(
    policyID: string,
    paymentMethodCode: BusinessCentralExport['paymentMethodCode'],
    oldPaymentMethodCode?: BusinessCentralExport['paymentMethodCode'],
) {
    const onyxData = prepareBusinessCentralExportOnyxData(policyID, CONST.BUSINESS_CENTRAL_CONFIG.PAYMENT_METHOD_CODE, paymentMethodCode, oldPaymentMethodCode ?? null);
    const parameters: UpdateBusinessCentralPaymentMethodParams = {policyID, value: paymentMethodCode};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_PAYMENT_METHOD, parameters, onyxData);
}

export {
    connectToBusinessCentral,
    clearBusinessCentralErrorField,
    updateBusinessCentralCompany,
    updateBusinessCentralEnableNewCategories,
    updateBusinessCentralSyncTaxRates,
    updateBusinessCentralSyncItems,
    updateBusinessCentralFieldMapping,
    updateBusinessCentralExporter,
    updateBusinessCentralExportDate,
    updateBusinessCentralReimbursableExpensesExportDestination,
    updateBusinessCentralNonReimbursableExpensesExportDestination,
    updateBusinessCentralReimbursableAccount,
    updateBusinessCentralNonReimbursableAccount,
    updateBusinessCentralDefaultVendor,
    updateBusinessCentralPaymentMethod,
};
