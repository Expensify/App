import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import {write} from '@libs/API';
import type {ConnectPolicyToRilletParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

function connectToRillet(policyID: string, apiKey: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.RILLET_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.RILLET,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const parameters: ConnectPolicyToRilletParams = {
        policyID,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_RILLET, parameters, {optimisticData});
}

function clearRilletErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {[CONST.POLICY.CONNECTIONS.NAME.RILLET]: {config: {errorFields: {[fieldName]: null}}}},
    });
}

function updateRilletSubsidiary(policyID: string, subsidiaryID: string, oldSubsidiaryID: string) {
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        rillet: {
                            config: {
                                subsidiaryID,
                                pendingFields: {
                                    subsidiaryID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                },
                                errorFields: {
                                    subsidiaryID: null,
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        rillet: {
                            config: {
                                pendingFields: {
                                    subsidiaryID: null,
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        rillet: {
                            config: {
                                subsidiaryID: oldSubsidiaryID,
                                pendingFields: {
                                    subsidiaryID: null,
                                },
                                errorFields: {
                                    subsidiaryID: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                },
                            },
                        },
                    },
                },
            },
        ],
    };

    const params = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SUBSIDIARY, params, onyxData);
}

export {connectToRillet, clearRilletErrorField, updateRilletSubsidiary};
