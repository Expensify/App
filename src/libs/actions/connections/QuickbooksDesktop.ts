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

export {
    updateQuickbooksDesktopMarkChecksToBePrinted,
    updateQuickbooksDesktopShouldAutoCreateVendor,
    updateQuickbooksDesktopNonReimbursableExpensesAccount,
    updateQuickbooksDesktopExpensesExportDestination,
    updateQuickbooksDesktopReimbursableExpensesAccount,
    getQuickbooksDesktopCodatSetupLink,
    updateQuickbooksCompanyCardExpenseAccount,
};
