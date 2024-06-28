import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections} from '@src/types/onyx/Policy';

function prepareOnyxData(policyID: string, settingName: keyof Connections['intacct']['config'], settingValue: string | boolean | null) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            [settingName]: settingValue,
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
                    intacct: {
                        config: {
                            [settingName]: settingValue,
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
                    intacct: {
                        config: {
                            [settingName]: settingValue,
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
    const {optimisticData, failureData, successData} = prepareOnyxData(policyID, CONST.SAGE_INTACCT_CONFIG.IS_AUTO_SYNC_ENABLED, enabled);
    const parameters = {
        policyID,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        settingName: CONST.SAGE_INTACCT_CONFIG.IS_AUTO_SYNC_ENABLED,
        settingValue: JSON.stringify(enabled),
        idempotencyKey: CONST.SAGE_INTACCT_CONFIG.IS_AUTO_SYNC_ENABLED,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctImportEmployees(policyID: string, enabled: boolean) {
    const {optimisticData, failureData, successData} = prepareOnyxData(policyID, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES, enabled);
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
    const {optimisticData, failureData, successData} = prepareOnyxData(policyID, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE, approvalModeSettingValue);
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
