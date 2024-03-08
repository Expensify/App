import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';

function updatePolicyConnectionConfig({
    policyID,
    connectionName,
    updatedField,
    updatedPartialConfig,
    originalPartialConfig,
}: {
    policyID: string;
    connectionName: string;
    updatedField: string;
    updatedPartialConfig: Partial<QBOConnectionConfig>;
    originalPartialConfig: Partial<QBOConnectionConfig>;
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
                connections: {
                    [connectionName]: {
                        config: updatedPartialConfig,
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

    API.write(
        WRITE_COMMANDS.UPDATE_CONNECTION_CONFIG,
        {
            policyId: policyID,
            connectionName,
            config: updatedPartialConfig,
            idempotencyKey: updatedField,
        },
        {optimisticData, successData, failureData},
    );
}

export default {updatePolicyConnectionConfig};
