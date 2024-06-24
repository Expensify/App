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

function prepareOnyxDataForExport(policyID: string, settingValue: Partial<Connections['intacct']['config']['export']>) {
    return prepareOnyxData(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST.SAGE_INTACCT_CONFIG.EXPORT, settingValue);
}

function prepareParametersForExport(policyID: string, settingValue: Partial<Connections['intacct']['config']['export']>) {
    return {
        policyID,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        settingName: CONST.SAGE_INTACCT_CONFIG.EXPORT,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: CONST.SAGE_INTACCT_CONFIG.EXPORT,
    };
}

function updateSageIntacctExport(policyID: string, settingValue: Partial<Connections['intacct']['config']['export']>) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExport(policyID, settingValue);
    const parameters = prepareParametersForExport(policyID, settingValue);

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctExporter(policyID: string, exporter: string) {
    updateSageIntacctExport(policyID, {exporter});
}

function updateSageIntacctExportDate(policyID: string, date: ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE>) {
    updateSageIntacctExport(policyID, {exportDate: date});
}

function updateSageIntacctExportReimbursableExpense(policyID: string, reimbursable: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>) {
    updateSageIntacctExport(policyID, {reimbursable});
}

function updateSageIntacctDefaultVendor(policyID: string, settingValue: Partial<Connections['intacct']['config']['export']>) {
    updateSageIntacctExport(policyID, settingValue);
}

function updateSageIntacctExportNonReimbursableExpense(policyID: string, nonReimbursable: ValueOf<typeof CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE>) {
    updateSageIntacctExport(policyID, {nonReimbursable});
}

function updateSageIntacctExportNonReimbursableAccount(policyID: string, nonReimbursableAccount: string) {
    updateSageIntacctExport(policyID, {nonReimbursableAccount});
}

export {
    updateSageIntacctExporter,
    updateSageIntacctExportDate,
    updateSageIntacctExportReimbursableExpense,
    updateSageIntacctDefaultVendor,
    updateSageIntacctExportNonReimbursableExpense,
    updateSageIntacctExportNonReimbursableAccount,
};
