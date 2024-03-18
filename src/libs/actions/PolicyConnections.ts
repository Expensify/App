import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type UpdateConnectionConfigParams from '@libs/API/parameters/UpdateConnectionConfigParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionConfig, ConnectionName} from '@src/types/onyx/Policy';

function updatePolicyConnectionConfig({
    policyID,
    connectionName,
    updatedField,
    updatedPartialConfig,
    originalPartialConfig,
}: {
    policyID: string;
    connectionName: ConnectionName;
    updatedField: string;
    updatedPartialConfig: Partial<ConnectionConfig>;
    originalPartialConfig: Partial<ConnectionConfig>;
}) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    [updatedField]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                connections: {
                    [connectionName]: {
                        config: updatedPartialConfig,
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
                    [updatedField]: null,
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
                    [updatedField]: null,
                },
                errorFields: {
                    [updatedField]: ErrorUtils.getMicroSecondOnyxError('workspace.connection.error.genericUpdate'),
                },
                connections: {
                    [connectionName]: {
                        config: originalPartialConfig,
                    },
                },
            },
        },
    ];

    const parameters: UpdateConnectionConfigParams = {
        policyId: policyID,
        connectionName,
        config: updatedPartialConfig,
        idempotencyKey: updatedField,
    };

    API.write(WRITE_COMMANDS.UPDATE_CONNECTION_CONFIG, parameters, {optimisticData, successData, failureData});
}

export default {updatePolicyConnectionConfig};
