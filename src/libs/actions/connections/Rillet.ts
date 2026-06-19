import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToRilletParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

function connectToRillet(policyID: string, apiKey: string) {
    const parameters: ConnectPolicyToRilletParams = {
        policyID,
        apiKey,
    };
    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_RILLET, parameters, {});
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
    API.write(WRITE_COMMANDS.UPDATE_RILLET_SUBSIDIARY, params, onyxData);
}

export {connectToRillet, clearRilletErrorField, updateRilletSubsidiary};
