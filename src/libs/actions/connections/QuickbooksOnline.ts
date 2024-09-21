import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToAccountingIntegrationParams} from '@libs/API/parameters';
import type UpdateQuickbooksOnlineAutoCreateVendorParams from '@libs/API/parameters/UpdateQuickbooksOnlineAutoCreateVendorParams';
import type UpdateQuickbooksOnlineGenericTypeParams from '@libs/API/parameters/UpdateQuickbooksOnlineGenericTypeParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections, QBOConnectionConfig} from '@src/types/onyx/Policy';

function getQuickbooksOnlineSetupLink(policyID: string) {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function buildOnyxDataForMultipleQuickbooksConfigurations<TConfigUpdate extends Partial<Connections['quickbooksOnline']['config']>>(
    policyID: string,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    const optimisticData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
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
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
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

    const successData: OnyxUpdate[] = [
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
    policyID: string,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    const onyxData = buildOnyxDataForMultipleQuickbooksConfigurations(policyID, configUpdate, configCurrentData);

    const parameters: UpdateQuickbooksOnlineAutoCreateVendorParams = {
        policyID,
        autoCreateVendor: JSON.stringify(configUpdate.autoCreateVendor),
        nonReimbursableBillDefaultVendor: JSON.stringify(configUpdate.nonReimbursableBillDefaultVendor),
        idempotencyKey: CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR,
    };

    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR, parameters, onyxData);
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
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS, parameters, onyxData);
}

function updateQuickbooksOnlineSyncCustomers<TSettingValue extends Connections['quickbooksOnline']['config']['syncCustomers']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS, parameters, onyxData);
}

function updateQuickbooksOnlineSyncClasses<TSettingValue extends Connections['quickbooksOnline']['config']['syncClasses']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
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
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
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
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const {optimisticData, failureData, successData} = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
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

export {
    getQuickbooksOnlineSetupLink,
    updateQuickbooksOnlineEnableNewCategories,
    updateQuickbooksOnlineAutoCreateVendor,
    updateQuickbooksOnlineReimbursableExpensesAccount,
    updateQuickbooksOnlineReceivableAccount,
    updateQuickbooksOnlineExportDate,
    updateQuickbooksOnlineNonReimbursableExpensesAccount,
    updateQuickbooksOnlineCollectionAccountID,
    updateQuickbooksOnlineNonReimbursableBillDefaultVendor,
    updateQuickbooksOnlineSyncTax,
    updateQuickbooksOnlineSyncClasses,
    updateQuickbooksOnlineSyncLocations,
    updateQuickbooksOnlineSyncCustomers,
};
