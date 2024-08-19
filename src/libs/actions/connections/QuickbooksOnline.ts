import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToAccountingIntegrationParams} from '@libs/API/parameters';
import type UpdateQuickbooksOnlineGenericTypeParams from '@libs/API/parameters/UpdateQuickbooksOnlineGenericTypeParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName, Connections, IntegrationEntityMap} from '@src/types/onyx/Policy';

type ConnectionNameExceptNetSuite = Exclude<ConnectionName, typeof CONST.POLICY.CONNECTIONS.NAME.NETSUITE>;

function getQuickbooksOnlineSetupLink(policyID: string) {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function updateQuickbooksOnlineEnableNewCategories(policyID: string, settingValue: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineAutoCreateVendor(policyID: string, settingValue: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineReimbursableExpensesAccount<TConnectionName extends ConnectionNameExceptNetSuite, TSettingName extends keyof Connections[TConnectionName]['config']>(
    policyID: string,
    settingValue: Partial<Connections[TConnectionName]['config'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineSyncLocations(policyID: string, settingValue: IntegrationEntityMap) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineSyncCustomers(policyID: string, settingValue: IntegrationEntityMap) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineSyncClasses(policyID: string, settingValue: IntegrationEntityMap) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CLASSES, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineNonReimbursableBillDefaultVendor(policyID: string, settingValue: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineSyncTax(policyID: string, settingValue: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: null,
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_TAX]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_TAX),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_TAX, parameters, {optimisticData, failureData, successData});
}

export {
    getQuickbooksOnlineSetupLink,
    updateQuickbooksOnlineEnableNewCategories,
    updateQuickbooksOnlineAutoCreateVendor,
    updateQuickbooksOnlineReimbursableExpensesAccount,
    updateQuickbooksOnlineNonReimbursableBillDefaultVendor,
    updateQuickbooksOnlineSyncTax,
    updateQuickbooksOnlineSyncClasses,
    updateQuickbooksOnlineSyncLocations,
    updateQuickbooksOnlineSyncCustomers,
};
