import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {RemovePolicyConnectionParams, UpdateManyPolicyConnectionConfigurationsParams, UpdatePolicyConnectionConfigParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName, Connections, PolicyConnectionName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

type ConnectionNameExceptNetSuite = Exclude<ConnectionName, typeof CONST.POLICY.CONNECTIONS.NAME.NETSUITE>;

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

function updatePolicyConnectionConfig<TConnectionName extends ConnectionNameExceptNetSuite, TSettingName extends keyof Connections[TConnectionName]['config']>(
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
 * This method returns read command and stage in progres for a given accounting integration.
 *
 * @param policyID - ID of the policy for which the sync is needed
 * @param connectionName - Name of the connection, QBO/Xero
 */
function getSyncConnectionParameters(connectionName: PolicyConnectionName) {
    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO: {
            return {readCommand: READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_ONLINE, stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT_QBO};
        }
        case CONST.POLICY.CONNECTIONS.NAME.XERO: {
            return {readCommand: READ_COMMANDS.SYNC_POLICY_TO_XERO, stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT_XERO};
        }
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE: {
            return {readCommand: READ_COMMANDS.SYNC_POLICY_TO_NETSUITE, stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION};
        }
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
            return {readCommand: READ_COMMANDS.SYNC_POLICY_TO_SAGE_INTACCT, stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.SAGE_INTACCT_SYNC_CHECK_CONNECTION};
        }
        default:
            return undefined;
    }
}

/**
 * This method helps in syncing policy to the connected accounting integration.
 *
 * @param policyID - ID of the policy for which the sync is needed
 * @param connectionName - Name of the connection, QBO/Xero
 */
function syncConnection(policyID: string, connectionName: PolicyConnectionName | undefined) {
    if (!connectionName) {
        return;
    }
    const syncConnectionData = getSyncConnectionParameters(connectionName);

    if (!syncConnectionData) {
        return;
    }
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: syncConnectionData?.stageInProgress,
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

    API.read(
        syncConnectionData.readCommand,
        {
            policyID,
            idempotencyKey: policyID,
        },
        {
            optimisticData,
            failureData,
        },
    );
}

function updateManyPolicyConnectionConfigs<TConnectionName extends ConnectionNameExceptNetSuite, TConfigUpdate extends Partial<Connections[TConnectionName]['config']>>(
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
    // NetSuite does not use the conventional lastSync object, so we need to check for lastErrorSyncDate
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.NETSUITE) {
        return !isSyncInProgress && !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE].lastErrorSyncDate;
    }
    return !isSyncInProgress && policy?.connections?.[connectionName]?.lastSync?.isSuccessful === false;
}

function copyExistingPolicyConnection(connectedPolicyID: string, targetPolicyID: string, connectionName: ConnectionName) {
    let stageInProgress;
    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
            stageInProgress = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION;
            break;
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            stageInProgress = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.SAGE_INTACCT_SYNC_CHECK_CONNECTION;
            break;
        default:
            stageInProgress = null;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${targetPolicyID}`,
            value: {
                stageInProgress,
                connectionName,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    API.write(
        WRITE_COMMANDS.COPY_EXISTING_POLICY_CONNECTION,
        {
            policyID: connectedPolicyID,
            targetPolicyID,
            connectionName,
        },
        {optimisticData},
    );
}

export {removePolicyConnection, updatePolicyConnectionConfig, updateManyPolicyConnectionConfigs, hasSynchronizationError, syncConnection, copyExistingPolicyConnection};
