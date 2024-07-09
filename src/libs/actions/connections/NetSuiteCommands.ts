import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToNetSuiteParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections, NetSuiteCustomFormID} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

type SubsidiaryParam = {
    subsidiaryID: string;
    subsidiary: string;
};

function connectPolicyToNetSuite(policyID: string, credentials: Omit<ConnectPolicyToNetSuiteParams, 'policyID'>) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const parameters: ConnectPolicyToNetSuiteParams = {
        policyID,
        ...credentials,
    };
    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_NETSUITE, parameters, {optimisticData});
}

function updateNetSuiteOnyxData<TSettingName extends keyof Connections['netsuite']['options']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['netsuite']['options']['config'][TSettingName]>,
    oldSettingValue: Partial<Connections['netsuite']['options']['config'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
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
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                [settingName]: oldSettingValue ?? null,
                                pendingFields: {
                                    [settingName]: null,
                                },
                                errorFields: {
                                    [settingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                },
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                [settingName]: settingValue ?? null,
                                pendingFields: {
                                    [settingName]: null,
                                },
                                errorFields: {
                                    [settingName]: null,
                                },
                            },
                        },
                    },
                },
            },
        },
    ];
    return {optimisticData, failureData, successData};
}

function updateNetSuiteSyncOptionsOnyxData<TSettingName extends keyof Connections['netsuite']['options']['config']['syncOptions']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['netsuite']['options']['config']['syncOptions'][TSettingName]>,
    oldSettingValue: Partial<Connections['netsuite']['options']['config']['syncOptions'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                syncOptions: {
                                    [settingName]: settingValue ?? null,
                                    pendingFields: {
                                        [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                },
                                errorFields: {
                                    [settingName]: null,
                                },
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                syncOptions: {
                                    [settingName]: oldSettingValue ?? null,
                                    pendingFields: {
                                        [settingName]: null,
                                    },
                                },
                                errorFields: {
                                    [settingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                },
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                syncOptions: {
                                    [settingName]: settingValue ?? null,
                                    pendingFields: {
                                        [settingName]: null,
                                    },
                                },
                                errorFields: {
                                    [settingName]: null,
                                },
                            },
                        },
                    },
                },
            },
        },
    ];
    return {optimisticData, failureData, successData};
}

function updateNetSuiteSubsidiary(policyID: string, newSubsidiary: SubsidiaryParam, oldSubsidiary: SubsidiaryParam) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    pendingFields: {
                                        subsidiary: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: oldSubsidiary.subsidiary,
                                    subsidiaryID: oldSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
    };

    const params = {
        policyID,
        ...newSubsidiary,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_SUBSIDIARY, params, onyxData);
}

function updateNetSuiteImportMapping<TMappingName extends keyof Connections['netsuite']['options']['config']['syncOptions']['mapping']>(
    policyID: string,
    mappingName: TMappingName,
    mappingValue: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>,
    oldMappingValue?: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>,
) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: {
                                            [mappingName]: mappingValue,
                                            pendingFields: {
                                                [mappingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                            },
                                        },
                                    },
                                    errorFields: {
                                        [mappingName]: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: {
                                            [mappingName]: mappingValue,
                                            pendingFields: {
                                                [mappingName]: null,
                                            },
                                        },
                                    },
                                    errorFields: {
                                        [mappingName]: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: {
                                            [mappingName]: oldMappingValue,
                                            pendingFields: {
                                                [mappingName]: null,
                                            },
                                        },
                                    },
                                    errorFields: {
                                        [mappingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
    };

    const params = {
        policyID,
        mapping: mappingValue,
    };

    let commandName;
    switch (mappingName) {
        case 'departments':
            commandName = WRITE_COMMANDS.UPDATE_NETSUITE_DEPARTMENTS_MAPPING;
            break;
        case 'classes':
            commandName = WRITE_COMMANDS.UPDATE_NETSUITE_CLASSES_MAPPING;
            break;
        case 'locations':
            commandName = WRITE_COMMANDS.UPDATE_NETSUITE_LOCATIONS_MAPPING;
            break;
        case 'customers':
            commandName = WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOMERS_MAPPING;
            break;
        case 'jobs':
            commandName = WRITE_COMMANDS.UPDATE_NETSUITE_JOBS_MAPPING;
            break;
        default:
            return;
    }

    API.write(commandName, params, onyxData);
}

function updateNetSuiteSyncTaxConfiguration(policyID: string, isSyncTaxEnabled: boolean) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX, isSyncTaxEnabled, !isSyncTaxEnabled);

    const params = {
        policyID,
        enabled: isSyncTaxEnabled,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_TAX_CONFIGURATION, params, onyxData);
}

function updateNetSuiteCrossSubsidiaryCustomersConfiguration(policyID: string, isCrossSubsidiaryCustomersEnabled: boolean) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(
        policyID,
        CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS,
        isCrossSubsidiaryCustomersEnabled,
        !isCrossSubsidiaryCustomersEnabled,
    );

    const params = {
        policyID,
        enabled: isCrossSubsidiaryCustomersEnabled,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_CROSS_SUBSIDIARY_CUSTOMER_CONFIGURATION, params, onyxData);
}

function updateNetSuiteExporter(policyID: string, exporter: string, oldExporter: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORTER, exporter, oldExporter);

    const parameters = {
        policyID,
        email: exporter,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORTER, parameters, onyxData);
}

function updateNetSuiteExportDate(policyID: string, date: ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>, oldDate?: ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORT_DATE, date, oldDate);

    const parameters = {
        policyID,
        value: date,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_DATE, parameters, onyxData);
}

function updateNetSuiteReimbursableExpensesExportDestination(
    policyID: string,
    destination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
    oldDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);

    const parameters = {
        policyID,
        value: destination,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateNetSuiteNonReimbursableExpensesExportDestination(
    policyID: string,
    destination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
    oldDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);

    const parameters = {
        policyID,
        value: destination,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateNetSuiteDefaultVendor(policyID: string, vendorID: string, oldVendorID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR, vendorID, oldVendorID);

    const parameters = {
        policyID,
        vendorID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_DEFAULT_VENDOR, parameters, onyxData);
}

function updateNetSuiteReimbursablePayableAccount(policyID: string, bankAccountID: string, oldBankAccountID: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_PAYABLE_ACCOUNT, parameters, onyxData);
}

function updateNetSuitePayableAcct(policyID: string, bankAccountID: string, oldBankAccountID: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.PAYABLE_ACCT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_PAYABLE_ACCT, parameters, onyxData);
}

function updateNetSuiteJournalPostingPreference(
    policyID: string,
    postingPreference: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>,
    oldPostingPreference?: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE, postingPreference, oldPostingPreference);

    const parameters = {
        policyID,
        value: postingPreference,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_JOURNAL_POSTING_PREFERENCE, parameters, onyxData);
}

function updateNetSuiteReceivableAccount(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_RECEIVABLE_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteInvoiceItemPreference(
    policyID: string,
    value: ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>,
    oldValue?: ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE, value, oldValue);

    const parameters = {
        policyID,
        value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM_PREFERENCE, parameters, onyxData);
}

function updateNetSuiteInvoiceItem(policyID: string, itemID: string, oldItemID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM, itemID, oldItemID);

    const parameters = {
        policyID,
        itemID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM, parameters, onyxData);
}

function updateNetSuiteTaxPostingAccount(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_TAX_POSTING_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteProvincialTaxPostingAccount(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteAllowForeignCurrency(policyID: string, value: boolean, oldValue?: boolean) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY, value, oldValue);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_ALLOW_FOREIGN_CURRENCY, parameters, onyxData);
}

function updateNetSuiteExportToNextOpenPeriod(policyID: string, value: boolean, oldValue: boolean) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD, value, oldValue);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_TO_NEXT_OPEN_PERIOD, parameters, onyxData);
}

function updateNetSuiteAutoSync(policyID: string, value: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        config: {
                            autoSync: {
                                enabled: value,
                            },
                            pendingFields: {
                                autoSync: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                autoSync: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        config: {
                            autoSync: {
                                enabled: !value,
                            },
                            pendingFields: {
                                autoSync: null,
                            },
                            errorFields: {
                                autoSync: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        config: {
                            autoSync: {
                                enabled: value,
                            },
                            pendingFields: {
                                autoSync: null,
                            },
                            errorFields: {
                                autoSync: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_AUTO_SYNC, parameters, {optimisticData, failureData, successData});
}

function updateNetSuiteSyncReimbursedReports(policyID: string, value: boolean) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS, value, !value);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateNetSuiteSyncPeople(policyID: string, value: boolean) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE, value, !value);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_PEOPLE, parameters, onyxData);
}

function updateNetSuiteAutoCreateEntities(policyID: string, value: boolean) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES, value, !value);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_AUTO_CREATE_ENTITIES, parameters, onyxData);
}

function updateNetSuiteEnableNewCategories(policyID: string, value: boolean) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES, value, !value);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateNetSuiteCustomFormIDOptionsEnabled(policyID: string, value: boolean) {
    const data = {
        enabled: value,
    };
    const oldData = {
        enabled: !value,
    };
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS, data, oldData);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_ENABLED, parameters, onyxData);
}

function updateNetSuiteReimbursementAccountID(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSEMENT_ACCOUNT_ID, parameters, onyxData);
}

function updateNetSuiteCollectionAccount(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_COLLECTION_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteExportReportsTo(
    policyID: string,
    approvalLevel: ValueOf<typeof CONST.NETSUITE_REPORTS_APPROVAL_LEVEL>,
    oldApprovalLevel: ValueOf<typeof CONST.NETSUITE_REPORTS_APPROVAL_LEVEL>,
) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO, approvalLevel, oldApprovalLevel);

    const parameters = {
        policyID,
        value: approvalLevel,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_REPORTS_TO, parameters, onyxData);
}

function updateNetSuiteExportVendorBillsTo(
    policyID: string,
    approvalLevel: ValueOf<typeof CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL>,
    oldApprovalLevel: ValueOf<typeof CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL>,
) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO, approvalLevel, oldApprovalLevel);

    const parameters = {
        policyID,
        value: approvalLevel,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_VENDOR_BILLS_TO, parameters, onyxData);
}

function updateNetSuiteExportJournalsTo(
    policyID: string,
    approvalLevel: ValueOf<typeof CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL>,
    oldApprovalLevel: ValueOf<typeof CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL>,
) {
    const onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO, approvalLevel, oldApprovalLevel);

    const parameters = {
        policyID,
        value: approvalLevel,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_JOURNALS_TO, parameters, onyxData);
}

function updateNetSuiteApprovalAccount(policyID: string, value: string, oldValue: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT, value, oldValue);

    const parameters = {
        policyID,
        value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_APPROVAL_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteCustomFormIDOptions(
    policyID: string,
    value: string,
    isReimbursable: boolean,
    exportDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
    oldCustomFormID?: NetSuiteCustomFormID,
) {
    const customFormIDKey = isReimbursable ? CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.REIMBURSABLE : CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.NON_REIMBURSABLE;
    const data = {
        [customFormIDKey]: {
            [CONST.NETSUITE_MAP_EXPORT_DESTINATION[exportDestination]]: value,
        },
    };
    const oldData = {
        [customFormIDKey]: oldCustomFormID?.[customFormIDKey] ?? null,
    };
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS, data, oldData);

    const commandName = isReimbursable ? WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_REIMBURSABLE : WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_NON_REIMBURSABLE;
    const parameters = {
        policyID,
        formType: CONST.NETSUITE_MAP_EXPORT_DESTINATION[exportDestination],
        formID: value,
    };
    API.write(commandName, parameters, onyxData);
}

export {
    connectPolicyToNetSuite,
    updateNetSuiteSubsidiary,
    updateNetSuiteSyncTaxConfiguration,
    updateNetSuiteExporter,
    updateNetSuiteExportDate,
    updateNetSuiteReimbursableExpensesExportDestination,
    updateNetSuiteNonReimbursableExpensesExportDestination,
    updateNetSuiteDefaultVendor,
    updateNetSuiteReimbursablePayableAccount,
    updateNetSuitePayableAcct,
    updateNetSuiteJournalPostingPreference,
    updateNetSuiteReceivableAccount,
    updateNetSuiteInvoiceItemPreference,
    updateNetSuiteInvoiceItem,
    updateNetSuiteTaxPostingAccount,
    updateNetSuiteProvincialTaxPostingAccount,
    updateNetSuiteAllowForeignCurrency,
    updateNetSuiteExportToNextOpenPeriod,
    updateNetSuiteImportMapping,
    updateNetSuiteCrossSubsidiaryCustomersConfiguration,
    updateNetSuiteAutoSync,
    updateNetSuiteSyncReimbursedReports,
    updateNetSuiteSyncPeople,
    updateNetSuiteAutoCreateEntities,
    updateNetSuiteEnableNewCategories,
    updateNetSuiteCustomFormIDOptionsEnabled,
    updateNetSuiteReimbursementAccountID,
    updateNetSuiteCollectionAccount,
    updateNetSuiteExportReportsTo,
    updateNetSuiteExportVendorBillsTo,
    updateNetSuiteExportJournalsTo,
    updateNetSuiteApprovalAccount,
    updateNetSuiteCustomFormIDOptions,
};
