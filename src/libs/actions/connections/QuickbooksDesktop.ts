import isObject from 'lodash/isObject';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToQuickBooksDesktopParams, UpdatePolicyConnectionConfigParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {Connections} from '@src/types/onyx/Policy';

function createPendingFields<TSettingName extends keyof Connections['quickbooksDesktop']['config']['export']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksDesktop']['config']['export'][TSettingName]>,
    pendingValue: OnyxCommon.PendingAction,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: pendingValue};
    }

    return Object.keys(settingValue).reduce<Record<string, OnyxCommon.PendingAction>>((acc, setting) => {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}

function createErrorFields<TSettingName extends keyof Connections['quickbooksDesktop']['config']['export']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksDesktop']['config']['export'][TSettingName]>,
    errorValue: OnyxCommon.Errors | null,
) {
    if (!isObject(settingValue)) {
        return {[settingName]: errorValue};
    }

    return Object.keys(settingValue).reduce<OnyxCommon.ErrorFields>((acc, setting) => {
        acc[setting] = errorValue;
        return acc;
    }, {});
}

// TODO: [QBD] Should be removed to use the new QBD API
function updateExportConnectionConfig<TSettingName extends keyof Connections['quickbooksDesktop']['config']['export']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksDesktop']['config']['export'][TSettingName]>,
    oldSettingValue?: Partial<Connections['quickbooksDesktop']['config']['export'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            export: {
                                [settingName]: settingValue ?? null,
                            },
                            pendingFields: createPendingFields(settingName, settingValue, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            errorFields: createErrorFields(settingName, settingValue, null),
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            export: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: createPendingFields(settingName, settingValue, null),
                            errorFields: createErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
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
                    [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                        config: {
                            pendingFields: createPendingFields(settingName, settingValue, null),
                            errorFields: createErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdatePolicyConnectionConfigParams = {
        policyID,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.QBD,
        settingName: String('export'),
        settingValue: JSON.stringify({[settingName]: settingValue}),
        idempotencyKey: String('export'),
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function getQuickbooksDesktopCodatSetupLink(policyID: string) {
    const params: ConnectPolicyToQuickBooksDesktopParams = {policyID};

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_DESKTOP, params);
}

export {updateExportConnectionConfig, getQuickbooksDesktopCodatSetupLink};
