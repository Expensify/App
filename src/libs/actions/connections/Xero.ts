import isObject from 'lodash/isObject';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToAccountingIntegrationParams, UpdateXeroGenericTypeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {Connections, XeroTrackingCategory} from '@src/types/onyx/Policy';

const getXeroSetupLink = (policyID: string) => {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_XERO, shouldSkipWebProxy: true});
    return commandURL + new URLSearchParams(params).toString();
};

const getTrackingCategories = (policy: OnyxEntry<OnyxTypes.Policy>): Array<XeroTrackingCategory & {value: string}> => {
    const {trackingCategories} = policy?.connections?.xero?.data ?? {};
    const {mappings} = policy?.connections?.xero?.config ?? {};

    if (!trackingCategories) {
        return [];
    }

    return trackingCategories.map((category) => ({
        ...category,
        value: mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`] ?? '',
    }));
};

function createXeroPendingFields<TSettingName extends keyof Connections['xero']['config']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config'][TSettingName]>,
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

function createXeroErrorFields<TSettingName extends keyof Connections['xero']['config']>(
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config'][TSettingName]>,
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

function prepareXeroOptimisticData<TSettingName extends keyof Connections['xero']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['xero']['config'][TSettingName]>,
    oldSettingValue?: Partial<Connections['xero']['config'][TSettingName]> | null,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    xero: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: createXeroPendingFields(settingName, settingValue, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            errorFields: createXeroErrorFields(settingName, settingValue, null),
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
                    xero: {
                        config: {
                            [settingName]: oldSettingValue ?? null,
                            pendingFields: createXeroPendingFields(settingName, settingValue, null),
                            errorFields: createXeroErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
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
                    xero: {
                        config: {
                            pendingFields: createXeroPendingFields(settingName, settingValue, null),
                            errorFields: createXeroErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function updateXeroImportTrackingCategories() {}

function updateXeroImportTaxRates() {}

function updateXeroTenantID(policyID: string, settingValue: string, oldSettingValue?: string) {
    const parameters: UpdateXeroGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.XERO_CONFIG.TENANT_ID),
    };

    const {optimisticData, successData, failureData} = prepareXeroOptimisticData(policyID, CONST.XERO_CONFIG.TENANT_ID, settingValue, oldSettingValue);

    API.write(WRITE_COMMANDS.UPDATE_XERO_TENANT_ID, parameters, {optimisticData, successData, failureData});
}

function updateXeroMappings() {}

export {getXeroSetupLink, getTrackingCategories, updateXeroImportTrackingCategories, updateXeroImportTaxRates, updateXeroTenantID, updateXeroMappings};
