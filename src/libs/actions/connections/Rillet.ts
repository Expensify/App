import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import {write} from '@libs/API';
import type {ConnectPolicyToRilletParams, UpdateRilletGenericTypeParams, UpdateRilletSubsidiaryParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections} from '@src/types/onyx/Policy';

function connectToRillet(policyID: string, apiKey: string) {
    const parameters: ConnectPolicyToRilletParams = {
        policyID,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_RILLET, parameters, {});
}

function clearRilletErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {[CONST.POLICY.CONNECTIONS.NAME.RILLET]: {config: {errorFields: {[fieldName]: null}}}},
    });
}

function prepareRilletOptimisticData<TSettingName extends keyof Connections['rillet']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['rillet']['config'][TSettingName]>,
    oldSettingValue?: Partial<Connections['rillet']['config'][TSettingName]> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    rillet: {
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
                    rillet: {
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
                    rillet: {
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

function updateRilletSubsidiary(policyID: string, subsidiaryID: Connections['rillet']['config']['subsidiaryID'], oldSubsidiaryID: Connections['rillet']['config']['subsidiaryID']) {
    const onyxData = prepareRilletOptimisticData(policyID, CONST.RILLET_CONFIG.SUBSIDIARY_ID, subsidiaryID, oldSubsidiaryID);
    const params: UpdateRilletSubsidiaryParams = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_SUBSIDIARY, params, onyxData);
}

function updateRilletEnableNewCategories(
    policyID: string,
    enableNewCategories: Connections['rillet']['config']['enableNewCategories'],
    oldEnableNewCategories: Connections['rillet']['config']['enableNewCategories'],
) {
    const onyxData = prepareRilletOptimisticData(policyID, CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES, enableNewCategories, oldEnableNewCategories);
    const parameters: UpdateRilletGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(enableNewCategories),
        idempotencyKey: CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES,
    };
    write(WRITE_COMMANDS.UPDATE_RILLET_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

export {connectToRillet, clearRilletErrorField, updateRilletSubsidiary, updateRilletEnableNewCategories};
