import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {RemovePolicyConnectionParams, UpdatePolicyConnectionConfigParams} from '@libs/API/parameters';
import {SyncPolicyToQuickbooksOnlineParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName, Connections, PolicyConnectionName} from '@src/types/onyx/Policy';

function removePolicyConnection(policyID: string, connectionName: PolicyConnectionName) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [connectionName]: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: null,
        },
    ];
    const failureData: OnyxUpdate[] = [
        // {
        //     onyxMethod: Onyx.METHOD.MERGE,
        //     key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        //     value: {
        //         errorFields: {
        //             avatar: ErrorUtils.getMicroSecondOnyxError('avatarWithImagePicker.deleteWorkspaceError'),
        //         },
        //     },
        // },
    ];
    const parameters: RemovePolicyConnectionParams = {
        policyID,
        connectionName,
    };
    API.write(WRITE_COMMANDS.REMOVE_POLICY_CONNECTION, parameters, {optimisticData, failureData});
}
function updatePolicyConnectionConfig<TConnectionName extends ConnectionName, TSettingName extends keyof Connections[TConnectionName]['config']>(
    policyID: string,
    connectionName: TConnectionName,
    settingName: TSettingName,
    settingValue: Partial<Connections[TConnectionName]['config'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [connectionName]: {
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
                    [connectionName]: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage'),
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
                    [connectionName]: {
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

    const parameters: UpdatePolicyConnectionConfigParams = {
        policyID,
        connectionName,
        settingName: String(settingName),
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(settingName),
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function syncConnection(policyID: string, connectionName: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT,
                connectionName: connectionName,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: null,
        },
    ];
    const parameters: SyncPolicyToQuickbooksOnlineParams = {
        policyID,
        idempotencyKey: policyID,
    };

    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO) {
        API.read(READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_ONLINE, parameters, {optimisticData, failureData});
    } else if (connectionName === CONST.POLICY.CONNECTIONS.NAME.XERO) {
        // Update this when SYNC_POLICY_TO_XERO is available
    }
}

export {removePolicyConnection, updatePolicyConnectionConfig, syncConnection};
