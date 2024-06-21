import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections} from '@src/types/onyx/Policy';

function updateNetSuiteOnyxData<TSettingName extends keyof Connections['netsuite']['options']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['netsuite']['options']['config'][TSettingName]>,
    oldSettingValue: Partial<Connections['netsuite']['options']['config'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
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
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                [settingName]: oldSettingValue ?? null,
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
                    netsuite: {
                        options: {
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
        },
    ];
    return {optimisticData, failureData, successData};
}

function updateNetSuiteExporter(policyID: string, tokenSecret: string, exporter: string, oldExporter: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORTER, exporter, oldExporter);

    const parameters = {
        policyID,
        email: exporter,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORTER, parameters, onyxData);
}

function updateNetSuiteExportDate(policyID: string, tokenSecret: string, date: ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>, oldDate?: ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORT_DATE, date, oldDate);

    const parameters = {
        policyID,
        value: date,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_DATE, parameters, onyxData);
}

function updateNetSuiteReimbursableExpensesExportDestination(
    policyID: string,
    tokenSecret: string,
    destination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
    oldDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);

    const parameters = {
        policyID,
        value: destination,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateNetSuiteNonReimbursableExpensesExportDestination(
    policyID: string,
    tokenSecret: string,
    destination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
    oldDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);

    const parameters = {
        policyID,
        value: destination,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateNetSuiteDefaultVendor(policyID: string, tokenSecret: string, vendorID: string, oldVendorID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR, vendorID, oldVendorID);

    const parameters = {
        policyID,
        vendorID,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_DEFAULT_VENDOR, parameters, onyxData);
}

function updateNetSuiteReimbursablePayableAccount(policyID: string, tokenSecret: string, bankAccountID: string, oldBankAccountID: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_PAYABLE_ACCOUNT, parameters, onyxData);
}

function updateNetSuitePayableAcct(policyID: string, tokenSecret: string, bankAccountID: string, oldBankAccountID: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.PAYABLE_ACCT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_PAYABLE_ACCT, parameters, onyxData);
}

function updateNetSuiteJournalPostingPreference(
    policyID: string,
    tokenSecret: string,
    postingPreference: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>,
    oldPostingPreference?: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE, postingPreference, oldPostingPreference);

    const parameters = {
        policyID,
        value: postingPreference,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_JOURNAL_POSTING_PREFERENCE, parameters, onyxData);
}

function updateNetSuiteReceivableAccount(policyID: string, tokenSecret: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_RECEIVABLE_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteInvoiceItem(policyID: string, tokenSecret: string, itemID: string, oldItemID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM, itemID, oldItemID);

    const parameters = {
        policyID,
        itemID,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM, parameters, onyxData);
}

function updateNetSuiteTaxPostingAccount(policyID: string, tokenSecret: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_TAX_POSTING_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteProvincialTaxPostingAccount(policyID: string, tokenSecret: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteAllowForeignCurrency(policyID: string, tokenSecret: string, value: boolean, oldValue?: boolean) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY, value, oldValue);

    const parameters = {
        policyID,
        enabled: value,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_ALLOW_FOREIGN_CURRENCY, parameters, onyxData);
}

function updateNetSuiteExportToNextOpenPeriod(policyID: string, tokenSecret: string, value: boolean, oldValue: boolean) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD, value, oldValue);

    const parameters = {
        policyID,
        enabled: value,
        authToken: tokenSecret,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_TO_NEXT_OPEN_PERIOD, parameters, onyxData);
}

export {
    updateNetSuiteExporter,
    updateNetSuiteExportDate,
    updateNetSuiteReimbursableExpensesExportDestination,
    updateNetSuiteNonReimbursableExpensesExportDestination,
    updateNetSuiteDefaultVendor,
    updateNetSuiteReimbursablePayableAccount,
    updateNetSuitePayableAcct,
    updateNetSuiteJournalPostingPreference,
    updateNetSuiteReceivableAccount,
    updateNetSuiteInvoiceItem,
    updateNetSuiteTaxPostingAccount,
    updateNetSuiteProvincialTaxPostingAccount,
    updateNetSuiteAllowForeignCurrency,
    updateNetSuiteExportToNextOpenPeriod,
};
