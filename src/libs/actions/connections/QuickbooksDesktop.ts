import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    ConnectPolicyToQuickBooksDesktopParams,
    UpdateQuickbooksDesktopCompanyCardExpenseAccountTypeParams,
    UpdateQuickbooksDesktopExpensesExportDestinationTypeParams,
    UpdateQuickbooksDesktopGenericTypeParams,
} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections, QBDNonReimbursableExportAccountType, QBDReimbursableExportAccountType} from '@src/types/onyx/Policy';

function buildOnyxDataForMultipleQuickbooksExportConfigurations<TConfigUpdate extends Partial<Connections['quickbooksDesktop']['config']['export']>>(
    policyID: string,
    configUpdate: TConfigUpdate,
    configCurrentData: Partial<TConfigUpdate>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            export: configUpdate,
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            export: configCurrentData,
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
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

function buildOnyxDataForQuickbooksExportConfiguration<TSettingName extends keyof Connections['quickbooksDesktop']['config']['export']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksDesktop']['config']['export'][TSettingName]>,
    oldSettingValue?: Partial<Connections['quickbooksDesktop']['config']['export'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            export: {
                                [settingName]: oldSettingValue ?? null,
                            },
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            export: {
                                [settingName]: settingValue ?? null,
                            },
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

function buildOnyxDataForQuickbooksDesktopMappingsConfiguration<TSettingName extends keyof Connections['quickbooksDesktop']['config']['mappings']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksDesktop']['config']['mappings'][TSettingName]>,
    oldSettingValue?: Partial<Connections['quickbooksDesktop']['config']['mappings'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            mappings: {
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            mappings: {
                                [settingName]: oldSettingValue ?? null,
                            },
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
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

function buildOnyxDataForQuickbooksConfiguration<TSettingName extends keyof Connections['quickbooksDesktop']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksDesktop']['config'][TSettingName]>,
    oldSettingValue?: Partial<Connections['quickbooksDesktop']['config'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
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

function getQuickbooksDesktopCodatSetupLink(policyID: string) {
    const params: ConnectPolicyToQuickBooksDesktopParams = {policyID};

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_DESKTOP, params);
}

function updateQuickbooksDesktopExpensesExportDestination<TConfigUpdate extends {reimbursable: QBDReimbursableExportAccountType; reimbursableAccount: string}>(
    policyID: string,
    configUpdate: TConfigUpdate,
    configCurrentData: Partial<TConfigUpdate>,
) {
    const onyxData = buildOnyxDataForMultipleQuickbooksExportConfigurations(policyID, configUpdate, configCurrentData);

    const parameters: UpdateQuickbooksDesktopExpensesExportDestinationTypeParams = {
        policyID,
        reimbursableExpensesExportDestination: configUpdate.reimbursable,
        reimbursableExpensesAccount: configUpdate.reimbursableAccount,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE),
    };

    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateQuickbooksCompanyCardExpenseAccount<
    TConfigUpdate extends {nonReimbursable: QBDNonReimbursableExportAccountType; nonReimbursableAccount: string; nonReimbursableBillDefaultVendor: string},
>(policyID: string, configUpdate: TConfigUpdate, configCurrentData: Partial<TConfigUpdate>) {
    const onyxData = buildOnyxDataForMultipleQuickbooksExportConfigurations(policyID, configUpdate, configCurrentData);

    const parameters: UpdateQuickbooksDesktopCompanyCardExpenseAccountTypeParams = {
        policyID,
        nonReimbursableExpensesExportDestination: configUpdate.nonReimbursable,
        nonReimbursableExpensesAccount: configUpdate.nonReimbursableAccount,
        nonReimbursableBillDefaultVendor: configUpdate.nonReimbursableBillDefaultVendor,
        idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION),
    };

    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateQuickbooksDesktopShouldAutoCreateVendor<TSettingValue extends Connections['quickbooksDesktop']['config']['shouldAutoCreateVendor']>(
    policyID: string,
    settingValue: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR, settingValue, !settingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR),
    };

    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_AUTO_CREATE_VENDOR, parameters, onyxData);
}

function updateQuickbooksDesktopMarkChecksToBePrinted<TSettingValue extends Connections['quickbooksDesktop']['config']['markChecksToBePrinted']>(
    policyID: string,
    settingValue: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED, settingValue, !settingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_MARK_CHECKS_TO_BE_PRINTED, parameters, onyxData);
}

function updateQuickbooksDesktopReimbursableExpensesAccount<TSettingValue extends Connections['quickbooksDesktop']['config']['export']['reimbursableAccount']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}

function updateQuickbooksDesktopEnableNewCategories<TSettingValue extends Connections['quickbooksDesktop']['config']['enableNewCategories']>(policyID: string, settingValue: TSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES, settingValue, !settingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateQuickbooksDesktopSyncClasses<TSettingValue extends Connections['quickbooksDesktop']['config']['mappings']['classes']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksDesktopMappingsConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES, settingValue, oldSettingValue);
    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_CLASSES, parameters, onyxData);
}

function updateQuickbooksDesktopSyncCustomers<TSettingValue extends Connections['quickbooksDesktop']['config']['mappings']['customers']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksDesktopMappingsConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS, settingValue, oldSettingValue);
    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_CUSTOMERS, parameters, onyxData);
}

function updateQuickbooksDesktopSyncItems<TSettingValue extends Connections['quickbooksDesktop']['config']['importItems']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS, settingValue, oldSettingValue);
    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_ITEMS, parameters, onyxData);
}

function updateQuickbooksDesktopPreferredExporter<TSettingValue extends Connections['quickbooksDesktop']['config']['export']['exporter']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_EXPORT, parameters, onyxData);
}

function updateQuickbooksDesktopNonReimbursableExpensesAccount<TSettingValue extends Connections['quickbooksDesktop']['config']['export']['nonReimbursableAccount']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}

function updateQuickbooksDesktopNonReimbursableBillDefaultVendor<TSettingValue extends Connections['quickbooksDesktop']['config']['export']['nonReimbursableBillDefaultVendor']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, parameters, onyxData);
}

function updateQuickbooksDesktopExportDate<TSettingValue extends Connections['quickbooksDesktop']['config']['export']['exportDate']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_EXPORT_DATE, parameters, onyxData);
}

function updateQuickbooksDesktopAutoSync<TSettingValue extends Connections['quickbooksDesktop']['config']['autoSync']['enabled']>(policyID: string, settingValue: TSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC, {enabled: settingValue}, {enabled: !settingValue});

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_AUTO_SYNC, parameters, onyxData);
}

export {
    updateQuickbooksDesktopAutoSync,
    updateQuickbooksDesktopPreferredExporter,
    updateQuickbooksDesktopMarkChecksToBePrinted,
    updateQuickbooksDesktopNonReimbursableBillDefaultVendor,
    updateQuickbooksDesktopShouldAutoCreateVendor,
    updateQuickbooksDesktopNonReimbursableExpensesAccount,
    updateQuickbooksDesktopExpensesExportDestination,
    updateQuickbooksDesktopReimbursableExpensesAccount,
    getQuickbooksDesktopCodatSetupLink,
    updateQuickbooksCompanyCardExpenseAccount,
    updateQuickbooksDesktopEnableNewCategories,
    updateQuickbooksDesktopExportDate,
    updateQuickbooksDesktopSyncClasses,
    updateQuickbooksDesktopSyncCustomers,
    updateQuickbooksDesktopSyncItems,
};
