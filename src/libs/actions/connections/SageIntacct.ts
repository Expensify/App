import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName, Connections} from '@src/types/onyx/Policy';

function prepareOnyxData<TConnectionName extends ConnectionName, TSettingName extends keyof Connections[TConnectionName]['config']>(
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

    return {optimisticData, failureData, successData};
}

function updateSageIntacctAutoSync(policyID: string, enabled: boolean) {
    const autoSyncSettingValue = {enabled};
    const {optimisticData, failureData, successData} = prepareOnyxData(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC, autoSyncSettingValue);
    const parameters = {
        policyID,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        settingName: CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC,
        settingValue: JSON.stringify(autoSyncSettingValue),
        idempotencyKey: CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctImportEmployees(policyID: string, enabled: boolean) {
    const {optimisticData, failureData, successData} = prepareOnyxData(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES, enabled);
    const parameters = {
        policyID,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        settingName: CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES,
        settingValue: JSON.stringify(enabled),
        idempotencyKey: CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctApprovalMode(policyID: string, enabled: boolean) {
    const approvalModeSettingValue = enabled ? CONST.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL : null;
    const {optimisticData, failureData, successData} = prepareOnyxData(
        policyID,
        CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
        approvalModeSettingValue,
    );
    const parameters = {
        policyID,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        settingName: CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
        settingValue: JSON.stringify(approvalModeSettingValue),
        idempotencyKey: CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncReimbursedReports(policyID: string, enabled: boolean) {
    const approvalModeSettingValue = enabled ? CONST.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL : null;
    const {optimisticData, failureData, successData} = prepareOnyxData(
        policyID,
        CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
        approvalModeSettingValue,
    );
    const parameters = {
        policyID,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        settingName: CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
        settingValue: JSON.stringify(approvalModeSettingValue),
        idempotencyKey: CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

export {updateSageIntacctAutoSync, updateSageIntacctImportEmployees, updateSageIntacctApprovalMode};
