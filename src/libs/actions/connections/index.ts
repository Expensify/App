import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    RemovePolicyConnectionParams,
    SyncPolicyToQuickbooksOnlineParams,
    SyncPolicyToXeroParams,
    UpdateManyPolicyConnectionConfigurationsParams,
    UpdatePolicyConnectionConfigParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName, Connections, PolicyConnectionName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

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

    const parameters: RemovePolicyConnectionParams = {
        policyID,
        connectionName,
    };
    API.write(WRITE_COMMANDS.REMOVE_POLICY_CONNECTION, parameters, {optimisticData});
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

/**
 * This method helps in syncing policy to the connected accounting integration.
 *
 * @param policyID - ID of the policy for which the sync is needed
 * @param connectionName - Name of the connection, QBO/Xero
 */
function syncConnection(policyID: string, connectionName: PolicyConnectionName | undefined) {
    const isQBOConnection = connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO;
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: isQBOConnection ? CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT_QBO : CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT_XERO,
                connectionName,
                timestamp: new Date().toISOString(),
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

    const parameters: SyncPolicyToQuickbooksOnlineParams | SyncPolicyToXeroParams = isQBOConnection
        ? ({
              policyID,
              idempotencyKey: policyID,
          } as SyncPolicyToQuickbooksOnlineParams)
        : ({
              policyID,
              idempotencyKey: policyID,
          } as SyncPolicyToXeroParams);

    API.read(isQBOConnection ? READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_ONLINE : READ_COMMANDS.SYNC_POLICY_TO_XERO, parameters, {
        optimisticData,
        failureData,
    });
}

function updateManyPolicyConnectionConfigs<TConnectionName extends ConnectionName, TConfigUpdate extends Partial<Connections[TConnectionName]['config']>>(
    policyID: string,
    connectionName: TConnectionName,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [connectionName]: {
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
                    [connectionName]: {
                        config: {
                            ...configCurrentData,
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')])),
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
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateManyPolicyConnectionConfigurationsParams = {
        policyID,
        connectionName,
        configUpdate: JSON.stringify(configUpdate),
        idempotencyKey: Object.keys(configUpdate).join(','),
    };
    API.write(WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS, parameters, {optimisticData, failureData, successData});
}

function hasSynchronizationError(policy: OnyxEntry<Policy>, connectionName: PolicyConnectionName, isSyncInProgress: boolean): boolean {
    return !isSyncInProgress && policy?.connections?.[connectionName]?.lastSync?.isSuccessful === false;
}

export {removePolicyConnection, updatePolicyConnectionConfig, updateManyPolicyConnectionConfigs, hasSynchronizationError, syncConnection};
