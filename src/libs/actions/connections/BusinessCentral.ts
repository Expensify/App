import {write} from '@libs/API';
import type {
    ConnectPolicyToBusinessCentralParams,
    UpdateBusinessCentralAccountingMethodParams,
    UpdateBusinessCentralAutoCreateEntitiesParams,
    UpdateBusinessCentralAutoSyncParams,
    UpdateBusinessCentralCardProgramAccountParams,
    UpdateBusinessCentralCompanyParams,
    UpdateBusinessCentralCustomerMappingParams,
    UpdateBusinessCentralDefaultVendorParams,
    UpdateBusinessCentralEnableNewCategoriesParams,
    UpdateBusinessCentralExportDateParams,
    UpdateBusinessCentralExporterParams,
    UpdateBusinessCentralExportToMultipleAccountsParams,
    UpdateBusinessCentralExportToNextOpenPeriodParams,
    UpdateBusinessCentralFieldMappingParams,
    UpdateBusinessCentralNonreimbursableAccountParams,
    UpdateBusinessCentralNonreimbursableExpensesExportDestinationParams,
    UpdateBusinessCentralPaymentMethodParams,
    UpdateBusinessCentralPostingModeParams,
    UpdateBusinessCentralReimbursableAccountParams,
    UpdateBusinessCentralReimbursableExpensesExportDestinationParams,
    UpdateBusinessCentralReimbursementBankAccountParams,
    UpdateBusinessCentralSettlementsBankAccountParams,
    UpdateBusinessCentralSyncExpensifyCardSettlementsParams,
    UpdateBusinessCentralSyncItemsParams,
    UpdateBusinessCentralSyncReimbursedReportsParams,
    UpdateBusinessCentralSyncTaxRatesParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {BusinessCentralCoding, BusinessCentralCodingOfflineFeedbackKeys, BusinessCentralCustomerMappings, BusinessCentralExport, BusinessCentralSync} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

type BusinessCentralMappingValue = ValueOf<typeof CONST.BUSINESS_CENTRAL_MAPPING_VALUE>;
type BusinessCentralCustomerMappingName = ValueOf<typeof CONST.BUSINESS_CENTRAL_FIELD_MAPPING>;

/** Coding values a single update writes. `null` clears a value that did not exist before the update when the request is rolled back. */
type BusinessCentralCodingUpdate = {
    [TSetting in keyof Omit<BusinessCentralCoding, 'fieldMappings' | 'customerMappings'>]?: BusinessCentralCoding[TSetting] | null;
} & {
    fieldMappings?: Record<string, BusinessCentralMappingValue | null>;
    customerMappings?: Partial<Record<keyof BusinessCentralCustomerMappings, BusinessCentralMappingValue | null>>;
};

/** Config sections whose settings each update on their own */
type BusinessCentralConfigSections = {
    export: BusinessCentralExport;
    sync: BusinessCentralSync;
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

function updateBusinessCentralCustomerMapping(
    policyID: string,
    mappingName: BusinessCentralCustomerMappingName,
    mapping: BusinessCentralMappingValue,
    oldMapping?: BusinessCentralMappingValue,
) {
    const pendingField = mappingName;
    const onyxData = prepareBusinessCentralCodingOnyxData(policyID, pendingField, {customerMappings: {[mappingName]: mapping}}, {customerMappings: {[mappingName]: oldMapping ?? null}});
    const parameters: UpdateBusinessCentralCustomerMappingParams = {policyID, mapping};
    const command =
        mappingName === CONST.BUSINESS_CENTRAL_FIELD_MAPPING.CUSTOMERS ? WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_CUSTOMERS_MAPPING : WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_PROJECTS_MAPPING;
    write(command, parameters, onyxData);
}

/**
 * Builds the Onyx updates for a change to one export or payment sync setting. The pending and error state lives under the setting's own key.
 */
function prepareBusinessCentralConfigSectionOnyxData<TSection extends keyof BusinessCentralConfigSections, TSettingName extends keyof BusinessCentralConfigSections[TSection]>(
    policyID: string,
    section: TSection,
    settingName: TSettingName,
    settingValue: BusinessCentralConfigSections[TSection][TSettingName],
    oldSettingValue: BusinessCentralConfigSections[TSection][TSettingName] | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            [section]: {
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
                            [section]: {
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
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.EXPORTER, email, oldEmail ?? null);
    const parameters: UpdateBusinessCentralExporterParams = {policyID, email};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_EXPORTER, parameters, onyxData);
}

function updateBusinessCentralExportDate(policyID: string, value: BusinessCentralExport['exportDate'], oldValue?: BusinessCentralExport['exportDate']) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_DATE, value, oldValue ?? null);
    const parameters: UpdateBusinessCentralExportDateParams = {policyID, value};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_EXPORT_DATE, parameters, onyxData);
}

function updateBusinessCentralReimbursableExpensesExportDestination(policyID: string, value: BusinessCentralExport['reimbursable'], oldValue?: BusinessCentralExport['reimbursable']) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE, value, oldValue ?? null);
    const parameters: UpdateBusinessCentralReimbursableExpensesExportDestinationParams = {policyID, value};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateBusinessCentralNonReimbursableExpensesExportDestination(
    policyID: string,
    value: BusinessCentralExport['nonReimbursable'],
    oldValue?: BusinessCentralExport['nonReimbursable'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE, value, oldValue ?? null);
    const parameters: UpdateBusinessCentralNonreimbursableExpensesExportDestinationParams = {policyID, value};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateBusinessCentralReimbursableAccount(
    policyID: string,
    bankAccountID: BusinessCentralExport['reimbursableAccount'],
    oldBankAccountID?: BusinessCentralExport['reimbursableAccount'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE_ACCOUNT, bankAccountID, oldBankAccountID ?? null);
    const parameters: UpdateBusinessCentralReimbursableAccountParams = {policyID, value: bankAccountID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_REIMBURSABLE_ACCOUNT, parameters, onyxData);
}

function updateBusinessCentralNonReimbursableAccount(
    policyID: string,
    bankAccountID: BusinessCentralExport['nonReimbursableAccount'],
    oldBankAccountID?: BusinessCentralExport['nonReimbursableAccount'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE_ACCOUNT, bankAccountID, oldBankAccountID ?? null);
    const parameters: UpdateBusinessCentralNonreimbursableAccountParams = {policyID, value: bankAccountID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_NONREIMBURSABLE_ACCOUNT, parameters, onyxData);
}

function updateBusinessCentralDefaultVendor(policyID: string, vendorID: BusinessCentralExport['defaultVendorID'], oldVendorID?: BusinessCentralExport['defaultVendorID']) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.DEFAULT_VENDOR_ID, vendorID, oldVendorID ?? null);
    const parameters: UpdateBusinessCentralDefaultVendorParams = {policyID, vendorID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_DEFAULT_VENDOR, parameters, onyxData);
}

/** An empty `paymentMethodCode` clears the payment method. */
function updateBusinessCentralPaymentMethod(
    policyID: string,
    paymentMethodCode: BusinessCentralExport['paymentMethodCode'],
    oldPaymentMethodCode?: BusinessCentralExport['paymentMethodCode'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.PAYMENT_METHOD_CODE, paymentMethodCode, oldPaymentMethodCode ?? null);
    const parameters: UpdateBusinessCentralPaymentMethodParams = {policyID, value: paymentMethodCode};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_PAYMENT_METHOD, parameters, onyxData);
}

function updateBusinessCentralExportToMultipleAccounts(
    policyID: string,
    enabled: BusinessCentralExport['exportToMultipleAccounts'],
    oldEnabled?: BusinessCentralExport['exportToMultipleAccounts'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS, enabled, oldEnabled ?? null);
    const parameters: UpdateBusinessCentralExportToMultipleAccountsParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_EXPORT_TO_MULTIPLE_ACCOUNTS, parameters, onyxData);
}

/**
 * An empty `cardProgramAccountID` clears the feed's override, so the feed exports to the workspace's company card account.
 * The pending and error state lives under the prefixed feed key so only that feed's row shows the indicator.
 */
function updateBusinessCentralCardProgramAccount(
    policyID: string,
    feedKey: CardFeedWithNumber,
    cardProgramAccountID: ValueOf<BusinessCentralExport['cardProgramAccounts']>,
    oldCardProgramAccountID?: ValueOf<BusinessCentralExport['cardProgramAccounts']>,
) {
    const pendingField = `${CONST.BUSINESS_CENTRAL_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            export: {
                                cardProgramAccounts: {
                                    [feedKey]: cardProgramAccountID || null,
                                },
                            },
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
                            export: {
                                cardProgramAccounts: {
                                    [feedKey]: oldCardProgramAccountID ?? null,
                                },
                            },
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

    const parameters: UpdateBusinessCentralCardProgramAccountParams = {policyID, feedKey, cardProgramAccountID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_CARD_PROGRAM_ACCOUNT, parameters, {optimisticData, successData, failureData});
}

function updateBusinessCentralExportToNextOpenPeriod(
    policyID: string,
    enabled: BusinessCentralExport['exportToNextOpenPeriod'],
    oldEnabled?: BusinessCentralExport['exportToNextOpenPeriod'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD, enabled, oldEnabled ?? null);
    const parameters: UpdateBusinessCentralExportToNextOpenPeriodParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_EXPORT_TO_NEXT_OPEN_PERIOD, parameters, onyxData);
}

function updateBusinessCentralAccountingMethod(
    policyID: string,
    accountingMethod: BusinessCentralExport['accountingMethod'],
    oldAccountingMethod?: BusinessCentralExport['accountingMethod'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod ?? null);
    const parameters: UpdateBusinessCentralAccountingMethodParams = {policyID, accountingMethod};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_ACCOUNTING_METHOD, parameters, onyxData);
}

function updateBusinessCentralPostingMode(policyID: string, postingMode: BusinessCentralExport['postingMode'], oldPostingMode?: BusinessCentralExport['postingMode']) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.POSTING_MODE, postingMode, oldPostingMode ?? null);
    const parameters: UpdateBusinessCentralPostingModeParams = {policyID, postingMode};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_POSTING_MODE, parameters, onyxData);
}

function updateBusinessCentralAutoCreateEntities(policyID: string, enabled: BusinessCentralExport['autoCreateEntities'], oldEnabled?: BusinessCentralExport['autoCreateEntities']) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'export', CONST.BUSINESS_CENTRAL_CONFIG.AUTO_CREATE_ENTITIES, enabled, oldEnabled ?? null);
    const parameters: UpdateBusinessCentralAutoCreateEntitiesParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_AUTO_CREATE_ENTITIES, parameters, onyxData);
}

/** The pending and error state of the auto-sync toggle lives under the `autoSync` key. */
function updateBusinessCentralAutoSync(policyID: string, enabled: boolean, oldEnabled?: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            autoSync: {enabled},
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC]: null,
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
                                [CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC]: null,
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
                            autoSync: {enabled: oldEnabled ?? null},
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateBusinessCentralAutoSyncParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_AUTO_SYNC, parameters, {optimisticData, successData, failureData});
}

function updateBusinessCentralSyncReimbursedReports(policyID: string, enabled: BusinessCentralSync['syncReimbursedReports'], oldEnabled?: BusinessCentralSync['syncReimbursedReports']) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'sync', CONST.BUSINESS_CENTRAL_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, oldEnabled ?? null);
    const parameters: UpdateBusinessCentralSyncReimbursedReportsParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateBusinessCentralReimbursementBankAccount(
    policyID: string,
    bankAccountID: BusinessCentralSync['reimbursementBankAccountID'],
    oldBankAccountID?: BusinessCentralSync['reimbursementBankAccountID'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'sync', CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSEMENT_BANK_ACCOUNT_ID, bankAccountID, oldBankAccountID ?? null);
    const parameters: UpdateBusinessCentralReimbursementBankAccountParams = {policyID, reimbursementBankAccountID: bankAccountID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_REIMBURSEMENT_BANK_ACCOUNT, parameters, onyxData);
}

function updateBusinessCentralSyncExpensifyCardSettlements(
    policyID: string,
    enabled: BusinessCentralSync['syncExpensifyCardSettlements'],
    oldEnabled?: BusinessCentralSync['syncExpensifyCardSettlements'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'sync', CONST.BUSINESS_CENTRAL_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS, enabled, oldEnabled ?? null);
    const parameters: UpdateBusinessCentralSyncExpensifyCardSettlementsParams = {policyID, enabled};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_SYNC_EXPENSIFY_CARD_SETTLEMENTS, parameters, onyxData);
}

function updateBusinessCentralSettlementsBankAccount(
    policyID: string,
    bankAccountID: BusinessCentralSync['settlementsBankAccountID'],
    oldBankAccountID?: BusinessCentralSync['settlementsBankAccountID'],
) {
    const onyxData = prepareBusinessCentralConfigSectionOnyxData(policyID, 'sync', CONST.BUSINESS_CENTRAL_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID, bankAccountID, oldBankAccountID ?? null);
    const parameters: UpdateBusinessCentralSettlementsBankAccountParams = {policyID, settlementsBankAccountID: bankAccountID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_SETTLEMENTS_BANK_ACCOUNT, parameters, onyxData);
}

export {
    connectToBusinessCentral,
    clearBusinessCentralErrorField,
    updateBusinessCentralCompany,
    updateBusinessCentralEnableNewCategories,
    updateBusinessCentralSyncTaxRates,
    updateBusinessCentralSyncItems,
    updateBusinessCentralFieldMapping,
    updateBusinessCentralCustomerMapping,
    updateBusinessCentralExporter,
    updateBusinessCentralExportDate,
    updateBusinessCentralReimbursableExpensesExportDestination,
    updateBusinessCentralNonReimbursableExpensesExportDestination,
    updateBusinessCentralReimbursableAccount,
    updateBusinessCentralNonReimbursableAccount,
    updateBusinessCentralDefaultVendor,
    updateBusinessCentralPaymentMethod,
    updateBusinessCentralExportToNextOpenPeriod,
    updateBusinessCentralAccountingMethod,
    updateBusinessCentralPostingMode,
    updateBusinessCentralAutoCreateEntities,
    updateBusinessCentralAutoSync,
    updateBusinessCentralSyncReimbursedReports,
    updateBusinessCentralReimbursementBankAccount,
    updateBusinessCentralSyncExpensifyCardSettlements,
    updateBusinessCentralSettlementsBankAccount,
    updateBusinessCentralExportToMultipleAccounts,
    updateBusinessCentralCardProgramAccount,
};
