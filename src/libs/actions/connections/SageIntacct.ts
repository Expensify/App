import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
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
    const sync = auto ? CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC : CONST.SAGE_INTACCT_CONFIG.SYNC;
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

function prepareOnyxDataForExportUpdate(policyID: string, settingName: keyof Connections['intacct']['config']['export'], settingValue: string | null) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            export: {
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
                            export: {
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
                            export: {
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
        },
    ];

    return {optimisticData, failureData, successData};
}

function updateSageIntacctExporter(policyID: string, exporter: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.EXPORTER, exporter);
    const parameters = {
        policyID,
        email: exporter,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORTER, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctExportDate(policyID: string, date: ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE>) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE, date);
    const parameters = {
        policyID,
        value: date,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORT_DATE, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctReimbursableExpensesExportDestination(policyID: string, reimbursable: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE, reimbursable);
    const parameters = {
        policyID,
        value: reimbursable,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesExportDestination(policyID: string, nonReimbursable: ValueOf<typeof CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE>) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE, nonReimbursable);
    const parameters = {
        policyID,
        value: nonReimbursable,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctReimbursableExpensesReportExportDefaultVendor(policyID: string, vendor: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR, vendor);
    const parameters = {
        policyID,
        vendorID: vendor,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_REPORT_EXPORT_DEFAULT_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesCreditCardChargeExportDefaultVendor(policyID: string, vendor: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR, vendor);
    const parameters = {
        policyID,
        vendorID: vendor,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_CREDIT_CARD_CHARGE_EXPORT_DEFAULT_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesExportAccount(policyID: string, nonReimbursableAccount: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT, nonReimbursableAccount);
    const parameters = {
        policyID,
        creditCardAccountID: nonReimbursableAccount,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_ACCOUNT, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesExportVendor(policyID: string, vendor: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR, vendor);
    const parameters = {
        policyID,
        vendorID: vendor,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctDefaultVendor(policyID: string, settingName: keyof Connections['intacct']['config']['export'], vendor: string) {
    if (settingName === CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR) {
        updateSageIntacctReimbursableExpensesReportExportDefaultVendor(policyID, vendor);
    } else if (settingName === CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR) {
        updateSageIntacctNonreimbursableExpensesCreditCardChargeExportDefaultVendor(policyID, vendor);
    } else if (settingName === CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR) {
        updateSageIntacctNonreimbursableExpensesExportVendor(policyID, vendor);
    }
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
    const approvalModeSettingValue = enabled ? CONST.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL : '';
    const {optimisticData, failureData, successData} = prepareOnyxDataForConfigUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE, approvalModeSettingValue);
    const parameters = {
        policyID,
        value: approvalModeSettingValue,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_APPROVAL_MODE, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncReimbursedReports(policyID: string, enabled: boolean) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS, enabled);
    const parameters = {
        policyID,
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSED_REPORTS, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncReimbursementAccountID(policyID: string, vendorID: string | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID, vendorID);
    const parameters = {
        policyID,
        vendorID,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSEMENT_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}

export {
    connectToSageIntacct,
    updateSageIntacctExporter,
    updateSageIntacctExportDate,
    updateSageIntacctReimbursableExpensesExportDestination,
    updateSageIntacctNonreimbursableExpensesExportDestination,
    updateSageIntacctNonreimbursableExpensesExportAccount,
    updateSageIntacctDefaultVendor,
    updateSageIntacctAutoSync,
    updateSageIntacctImportEmployees,
    updateSageIntacctApprovalMode,
    updateSageIntacctSyncReimbursedReports,
    updateSageIntacctSyncReimbursementAccountID,
};
