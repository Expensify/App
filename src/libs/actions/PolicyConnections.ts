import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type UpdateConnectionConfigParams from '@libs/API/parameters/UpdatePolicyConnectionConfigurationParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName, Connections} from '@src/types/onyx/Policy';

function updatePolicyConnectionConfig<TConnectionName extends ConnectionName, TSettingName extends keyof Connections[TConnectionName]['config']>({
    policyID,
    connectionName,
    settingName,
    settingValue,
    originalSettingValue,
}: {
    policyID: string;
    connectionName: TConnectionName;
    settingName: TSettingName;
    settingValue: Connections[TConnectionName]['config'][TSettingName];
    originalSettingValue: Connections[TConnectionName]['config'][TSettingName];
}) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                connections: {
                    [connectionName]: {
                        config: {
                            [settingName]: settingValue,
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
                pendingFields: {
                    [settingName]: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    [settingName]: null,
                },
                errorFields: {
                    [settingName]: ErrorUtils.getMicroSecondOnyxError('workspace.connection.error.genericUpdate'),
                },
                connections: {
                    [connectionName]: {
                        config: {
                            [settingName]: originalSettingValue,
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateConnectionConfigParams<TConnectionName, TSettingName> = {
        policyID,
        connectionName,
        settingName,
        settingValue,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIGURATION, parameters, {optimisticData, successData, failureData});
}

export default {updatePolicyConnectionConfig};
