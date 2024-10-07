import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type UpdateQuickbooksDesktopGenericTypeParams from '@libs/API/parameters/UpdateQuickbooksDesktopGenericTypeParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections} from '@src/types/onyx/Policy';

function buildOnyxDataForMultipleQuickbooksConfigurations<TConfigUpdate extends Partial<Connections['quickbooksDesktop']['config']>>(
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
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

function updateQuickbooksDesktopReceivableAccount<TSettingValue extends Connections['quickbooksDesktop']['config']['receivableAccount']>(
    policyID: string,
    settingValue: TSettingValue,
    oldSettingValue?: TSettingValue,
) {
    const {optimisticData, failureData, successData} = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.RECEIVABLE_ACCOUNT, settingValue, oldSettingValue);

    const parameters: UpdateQuickbooksDesktopGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.RECEIVABLE_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_RECEIVABLE_ACCOUNT, parameters, {optimisticData, failureData, successData});
}

export {updateQuickbooksDesktopReceivableAccount, buildOnyxDataForMultipleQuickbooksConfigurations};
