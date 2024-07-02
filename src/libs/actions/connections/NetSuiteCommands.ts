import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

type SubsidiaryParam = {
    subsidiaryID: string;
    subsidiary: string;
};

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
        },
    ];
    return {optimisticData, failureData, successData};
}

function updateNetSuiteSubsidiary(policyID: string, newSubsidiary: SubsidiaryParam, oldSubsidiary: SubsidiaryParam) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    pendingFields: {
                                        subsidiary: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: oldSubsidiary.subsidiary,
                                    subsidiaryID: oldSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
    };

    const params = {
        policyID,
        ...newSubsidiary,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_SUBSIDIARY, params, onyxData);
}

function updateNetSuiteExporter(policyID: string, exporter: string, oldExporter: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORTER, exporter, oldExporter);

    const parameters = {
        policyID,
        email: exporter,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORTER, parameters, onyxData);
}

function updateNetSuiteExportDate(policyID: string, date: ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>, oldDate?: ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORT_DATE, date, oldDate);

    const parameters = {
        policyID,
        value: date,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_DATE, parameters, onyxData);
}

function updateNetSuiteReimbursableExpensesExportDestination(
    policyID: string,
    destination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
    oldDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);

    const parameters = {
        policyID,
        value: destination,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateNetSuiteNonReimbursableExpensesExportDestination(
    policyID: string,
    destination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
    oldDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);

    const parameters = {
        policyID,
        value: destination,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}

function updateNetSuiteDefaultVendor(policyID: string, vendorID: string, oldVendorID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR, vendorID, oldVendorID);

    const parameters = {
        policyID,
        vendorID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_DEFAULT_VENDOR, parameters, onyxData);
}

function updateNetSuiteReimbursablePayableAccount(policyID: string, bankAccountID: string, oldBankAccountID: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_PAYABLE_ACCOUNT, parameters, onyxData);
}

function updateNetSuitePayableAcct(policyID: string, bankAccountID: string, oldBankAccountID: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.PAYABLE_ACCT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_PAYABLE_ACCT, parameters, onyxData);
}

function updateNetSuiteJournalPostingPreference(
    policyID: string,
    postingPreference: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>,
    oldPostingPreference?: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE, postingPreference, oldPostingPreference);

    const parameters = {
        policyID,
        value: postingPreference,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_JOURNAL_POSTING_PREFERENCE, parameters, onyxData);
}

function updateNetSuiteReceivableAccount(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_RECEIVABLE_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteInvoiceItemPreference(
    policyID: string,
    value: ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>,
    oldValue?: ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>,
) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE, value, oldValue);

    const parameters = {
        policyID,
        value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM_PREFERENCE, parameters, onyxData);
}

function updateNetSuiteInvoiceItem(policyID: string, itemID: string, oldItemID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM, itemID, oldItemID);

    const parameters = {
        policyID,
        itemID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM, parameters, onyxData);
}

function updateNetSuiteTaxPostingAccount(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_TAX_POSTING_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteProvincialTaxPostingAccount(policyID: string, bankAccountID: string, oldBankAccountID?: string) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);

    const parameters = {
        policyID,
        bankAccountID,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT, parameters, onyxData);
}

function updateNetSuiteAllowForeignCurrency(policyID: string, value: boolean, oldValue?: boolean) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY, value, oldValue);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_ALLOW_FOREIGN_CURRENCY, parameters, onyxData);
}

function updateNetSuiteExportToNextOpenPeriod(policyID: string, value: boolean, oldValue: boolean) {
    const onyxData = updateNetSuiteOnyxData(policyID, CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD, value, oldValue);

    const parameters = {
        policyID,
        enabled: value,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_TO_NEXT_OPEN_PERIOD, parameters, onyxData);
}

export {
    updateNetSuiteSubsidiary,
    updateNetSuiteExporter,
    updateNetSuiteExportDate,
    updateNetSuiteReimbursableExpensesExportDestination,
    updateNetSuiteNonReimbursableExpensesExportDestination,
    updateNetSuiteDefaultVendor,
    updateNetSuiteReimbursablePayableAccount,
    updateNetSuitePayableAcct,
    updateNetSuiteJournalPostingPreference,
    updateNetSuiteReceivableAccount,
    updateNetSuiteInvoiceItemPreference,
    updateNetSuiteInvoiceItem,
    updateNetSuiteTaxPostingAccount,
    updateNetSuiteProvincialTaxPostingAccount,
    updateNetSuiteAllowForeignCurrency,
    updateNetSuiteExportToNextOpenPeriod,
};
