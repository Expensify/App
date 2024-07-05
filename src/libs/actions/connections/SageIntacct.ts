import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type ConnectPolicyToSageIntacctParams from '@libs/API/parameters/ConnectPolicyToSageIntacctParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections, SageIntacctConnectiosConfig} from '@src/types/onyx/Policy';

type SageIntacctCredentials = {companyID: string; userID: string; password: string};

function connectToSageIntacct(policyID: string, credentials: SageIntacctCredentials) {
    const parameters: ConnectPolicyToSageIntacctParams = {
        policyID,
        intacctCompanyID: credentials.companyID,
        intacctUserID: credentials.userID,
        intacctPassword: credentials.password,
    };
    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_SAGE_INTACCT, parameters, {});
}

function prepareOnyxDataForConfigUpdate(policyID: string, settingName: keyof SageIntacctConnectiosConfig, settingValue: string | boolean | null) {
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

function prepareOnyxDataForSyncUpdate(
    policyID: string,
    settingName: keyof Connections['intacct']['config']['sync'] | keyof Connections['intacct']['config']['autoSync'],
    settingValue: string | boolean | null,
    auto = false,
) {
    const sync = auto ? 'autoSync' : 'sync';
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            [sync]: {
                                [settingName]: settingValue,
                            },
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
    const {optimisticData, failureData, successData} = prepareOnyxDataForSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED, enabled, true);
    const parameters = {
        policyID,
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_AUTO_SYNC, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctImportEmployees(policyID: string, enabled: boolean) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForConfigUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES, enabled);
    const parameters = {
        policyID,
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_IMPORT_EMPLOYEES, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctApprovalMode(policyID: string, enabled: boolean) {
    const approvalModeSettingValue = enabled ? CONST.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL : null;
    const {optimisticData, failureData, successData} = prepareOnyxDataForConfigUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE, approvalModeSettingValue);
    const parameters = {
        policyID,
        value: approvalModeSettingValue,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_APPROVAL_MODE, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncReimbursedReports(policyID: string, vendorID: string | false) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS, vendorID);
    const parameters = {
        policyID,
        value: vendorID,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSED_REPORTS, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncReimbursementAccountID(policyID: string, vendorID: string | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBUSERED_ACCOUNT_ID, vendorID);
    const parameters = {
        policyID,
        value: vendorID,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSED_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}

export {
    connectToSageIntacct,
    updateSageIntacctAutoSync,
    updateSageIntacctImportEmployees,
    updateSageIntacctApprovalMode,
    updateSageIntacctSyncReimbursedReports,
    updateSageIntacctSyncReimbursementAccountID,
};
