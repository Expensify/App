import type {CONST as COMMON_CONST} from 'expensify-common';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToAccountingIntegrationParams, UpdateQuickbooksOnlineAccountingMethodParams} from '@libs/API/parameters';
import type UpdateQuickbooksOnlineAutoCreateVendorParams from '@libs/API/parameters/UpdateQuickbooksOnlineAutoCreateVendorParams';
import type UpdateQuickbooksOnlineGenericTypeParams from '@libs/API/parameters/UpdateQuickbooksOnlineGenericTypeParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections, QBOConnectionConfig} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

function getQuickbooksOnlineSetupLink(policyID: string) {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function shouldShowQBOReimbursableExportDestinationAccountError(policy: OnyxEntry<Policy>): boolean {
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    return isPolicyAdmin(policy) && !!qboConfig?.reimbursableExpensesExportDestination && !qboConfig.reimbursableExpensesAccount;
}

function buildOnyxDataForMultipleQuickbooksConfigurations<TConfigUpdate extends Partial<Connections['quickbooksOnline']['config']>>(
    policyID: string,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            ...configUpdate,
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE])),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            ...configCurrentData,
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map((settingName) => [settingName, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')]),
                            ),
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                        },
                    },
                },
            },
        },
    ];
    return {
        optimisticData,
        failureData,
        successData,
    };
}

function buildOnyxDataForQuickbooksConfiguration<TSettingName extends keyof Connections['quickbooksOnline']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksOnline']['config'][TSettingName]>,
    oldSettingValue?: Partial<Connections['quickbooksOnline']['config'][TSettingName]>,
) {
    const exporterOptimisticData = settingName === CONST.QUICKBOOKS_CONFIG.EXPORT ? {exporter: settingValue} : {};
    const exporterErrorData = settingName === CONST.QUICKBOOKS_CONFIG.EXPORT ? {exporter: oldSettingValue} : {};

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...exporterOptimisticData,
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...exporterErrorData,
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
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
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
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
    ];
    return {
        optimisticData,
        failureData,
        successData,
    };
}

function updateQuickbooksOnlineAutoSync<TSettingValue extends Connections['quickbooksOnline']['config']['autoSync']['enabled']>(policyID: string | undefined, settingValue: TSettingValue) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.AUTO_SYNC, {enabled: settingValue}, {enabled: !settingValue});

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.AUTO_SYNC),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_SYNC, parameters, onyxData);
}

function updateQuickbooksOnlineEnableNewCategories<TSettingValue extends Connections['quickbooksOnline']['config']['enableNewCategories']>(policyID: string, settingValue: TSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES, settingValue, !settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateQuickbooksOnlineAutoCreateVendor<TConfigUpdate extends Partial<Connections['quickbooksOnline']['config']>>(
    policyID: string | undefined,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForMultipleQuickbooksConfigurations(policyID, configUpdate, configCurrentData);

    const parameters: UpdateQuickbooksOnlineAutoCreateVendorParams = {
        policyID,
        autoCreateVendor: JSON.stringify(configUpdate.autoCreateVendor),
        nonReimbursableBillDefaultVendor: JSON.stringify(configUpdate.nonReimbursableBillDefaultVendor),
        idempotencyKey: CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR,
    };

    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR, parameters, onyxData);
}

function updateQuickbooksOnlineSyncPeople<TSettingValue extends Connections['quickbooksOnline']['config']['syncPeople']>(policyID: string | undefined, settingValue: TSettingValue) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_PEOPLE, settingValue, !settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.SYNC_PEOPLE),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_PEOPLE, parameters, onyxData);
}

function updateQuickbooksOnlineReimbursableExpensesAccount<TSettingValue extends Connections['quickbooksOnline']['config']['reimbursableExpensesAccount']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}

function updateQuickbooksOnlineSyncLocations<TSettingValue extends Connections['quickbooksOnline']['config']['syncLocations']>(
    policyID: string | undefined,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS, parameters, onyxData);
}

function updateQuickbooksOnlineSyncCustomers<TSettingValue extends Connections['quickbooksOnline']['config']['syncCustomers']>(
    policyID: string | undefined,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS, parameters, onyxData);
}

function updateQuickbooksOnlineSyncClasses<TSettingValue extends Connections['quickbooksOnline']['config']['syncClasses']>(
    policyID: string | undefined,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES, settingValue, oldSettingValue);
    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CLASSES, parameters, onyxData);
}

function updateQuickbooksOnlineNonReimbursableBillDefaultVendor<TSettingValue extends Connections['quickbooksOnline']['config']['nonReimbursableBillDefaultVendor']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, parameters, onyxData);
}

function updateQuickbooksOnlineReceivableAccount<TSettingValue extends QBOConnectionConfig['receivableAccount']>(
    policyID: string | undefined,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    if (!policyID) {
        return;
    }
    const {optimisticData, failureData, successData} = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_RECEIVABLE_ACCOUNT, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineExportDate<TSettingValue extends QBOConnectionConfig['exportDate']>(policyID: string, settingValue: TSettingValue, oldSettingValue?: TSettingValue) {
    const {optimisticData, failureData, successData} = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.EXPORT_DATE, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.EXPORT_DATE),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT_DATE, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineNonReimbursableExpensesAccount<TSettingValue extends QBOConnectionConfig['nonReimbursableExpensesAccount']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const {optimisticData, failureData, successData} = buildOnyxDataForQuickbooksConfiguration(
        policyID,
        CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT,
        settingValue,
        oldSettingValue,
    );

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineCollectionAccountID<TSettingValue extends QBOConnectionConfig['collectionAccountID']>(
    policyID: string | undefined,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    if (settingValue === oldSettingValue || !policyID) {
        return;
    }

    const {optimisticData, failureData, successData} = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineSyncReimbursedReports(
    policyID: string | undefined,
    settingValue: QBOConnectionConfig['collectionAccountID'],
    oldCollectionAccountID?: QBOConnectionConfig['collectionAccountID'],
    oldReimbursementAccountID?: QBOConnectionConfig['reimbursementAccountID'],
) {
    const shouldSkipUpdate = !policyID || (settingValue === oldCollectionAccountID && settingValue === oldReimbursementAccountID);
    if (shouldSkipUpdate) {
        Log.warn('Skipping updateQuickbooksOnlineSyncReimbursedReports because the values are the same', {policyID, settingValue, oldCollectionAccountID, oldReimbursementAccountID});
        return;
    }

    const sharedAccountConfigUpdate: Partial<QBOConnectionConfig> = {
        [CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]: settingValue,
        [CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: settingValue,
    };
    const sharedAccountConfigCurrentData: Partial<QBOConnectionConfig> = {
        [CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]: oldCollectionAccountID,
        [CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: oldReimbursementAccountID,
    };
    const onyxData = buildOnyxDataForMultipleQuickbooksConfigurations(policyID, sharedAccountConfigUpdate, sharedAccountConfigCurrentData);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}

function updateQuickbooksOnlineAccountingMethod(
    policyID: string | undefined,
    accountingMethod: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>,
    oldAccountingMethod: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>,
) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod);

    const parameters: UpdateQuickbooksOnlineAccountingMethodParams = {
        policyID,
        accountingMethod,
    };

    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD, parameters, onyxData);
}

function updateQuickbooksOnlineSyncTax<TSettingValue extends Connections['quickbooksOnline']['config']['syncTax']>(policyID: string, settingValue: TSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_TAX, settingValue, !settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.SYNC_TAX),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_TAX, parameters, onyxData);
}

function updateQuickbooksOnlineReimbursementAccountID<TSettingValue extends Connections['quickbooksOnline']['config']['reimbursementAccountID']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    if (settingValue === oldSettingValue) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSEMENT_ACCOUNT_ID, parameters, onyxData);
}

function updateQuickbooksOnlinePreferredExporter<TSettingValue extends Connections['quickbooksOnline']['config']['export']>(
    policyID: string | undefined,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.EXPORT, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: settingValue?.exporter ?? '',
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.EXPORT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT, parameters, onyxData);
}

export {
    shouldShowQBOReimbursableExportDestinationAccountError,
    getQuickbooksOnlineSetupLink,
    updateQuickbooksOnlineEnableNewCategories,
    updateQuickbooksOnlineAutoCreateVendor,
    updateQuickbooksOnlineReimbursableExpensesAccount,
    updateQuickbooksOnlineAutoSync,
    updateQuickbooksOnlineSyncPeople,
    updateQuickbooksOnlineReimbursementAccountID,
    updateQuickbooksOnlinePreferredExporter,
    updateQuickbooksOnlineReceivableAccount,
    updateQuickbooksOnlineExportDate,
    updateQuickbooksOnlineNonReimbursableExpensesAccount,
    updateQuickbooksOnlineCollectionAccountID,
    updateQuickbooksOnlineSyncReimbursedReports,
    updateQuickbooksOnlineNonReimbursableBillDefaultVendor,
    updateQuickbooksOnlineSyncTax,
    updateQuickbooksOnlineSyncClasses,
    updateQuickbooksOnlineSyncLocations,
    updateQuickbooksOnlineSyncCustomers,
    updateQuickbooksOnlineAccountingMethod,
};
