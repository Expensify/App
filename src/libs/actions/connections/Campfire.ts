import {write} from '@libs/API';
import type {ConnectPolicyToCampfireParams, UpdateCampfireSubsidiaryParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CampfireConnectionsConfig} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function connectToCampfire(policyID: string, apiKey: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.CAMPFIRE_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const parameters: ConnectPolicyToCampfireParams = {
        policyID,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_CAMPFIRE, parameters, {
        optimisticData,
    });
}

function clearCampfireErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function prepareCampfireOnyxData<TSettingName extends keyof CampfireConnectionsConfig>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<CampfireConnectionsConfig[TSettingName]>,
    oldSettingValue: Partial<CampfireConnectionsConfig[TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            pendingFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
                        config: {
                            [settingName]: oldSettingValue ?? null,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function updateCampfireSubsidiary(policyID: string, subsidiaryID: CampfireConnectionsConfig['subsidiaryID'], oldSubsidiaryID?: CampfireConnectionsConfig['subsidiaryID']) {
    const onyxData = prepareCampfireOnyxData(policyID, CONST.CAMPFIRE_CONFIG.SUBSIDIARY_ID, subsidiaryID, oldSubsidiaryID ?? null);
    const params: UpdateCampfireSubsidiaryParams = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_CAMPFIRE_SUBSIDIARY, params, onyxData);
}

export {connectToCampfire, clearCampfireErrorField, updateCampfireSubsidiary};
