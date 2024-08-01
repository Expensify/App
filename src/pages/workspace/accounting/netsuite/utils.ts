import CONST from '@src/CONST';
import type {NetSuiteConnectionConfig} from '@src/types/onyx/Policy';

function shouldHideReimbursedReportsSection(config?: NetSuiteConnectionConfig) {
    return config?.reimbursableExpensesExportDestination === CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}

function shouldHideReportsExportTo(config?: NetSuiteConnectionConfig) {
    return config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT;
}

function shouldHideExportVendorBillsTo(config?: NetSuiteConnectionConfig) {
    return (
        config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL &&
        config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL
    );
}

function shouldHideExportJournalsTo(config?: NetSuiteConnectionConfig) {
    return (
        config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY &&
        config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
    );
}

function shouldHideCustomFormIDOptions(config?: NetSuiteConnectionConfig) {
    return !config?.customFormIDOptions?.enabled;
}

function exportExpensesDestinationSettingName(isReimbursable: boolean) {
    return isReimbursable ? CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION : CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION;
}

function shouldHideReimbursableDefaultVendor(isReimbursable: boolean, config?: NetSuiteConnectionConfig) {
    return isReimbursable || config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL;
}

function shouldHideNonReimbursableJournalPostingAccount(isReimbursable: boolean, config?: NetSuiteConnectionConfig) {
    return isReimbursable || config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}

function shouldHideReimbursableJournalPostingAccount(isReimbursable: boolean, config?: NetSuiteConnectionConfig) {
    return !isReimbursable || config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}

function shouldHideJournalPostingPreference(isReimbursable: boolean, config?: NetSuiteConnectionConfig) {
    return config?.[exportExpensesDestinationSettingName(isReimbursable)] !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}

export {
    shouldHideReimbursedReportsSection,
    shouldHideReportsExportTo,
    shouldHideExportVendorBillsTo,
    shouldHideExportJournalsTo,
    shouldHideCustomFormIDOptions,
    exportExpensesDestinationSettingName,
    shouldHideReimbursableDefaultVendor,
    shouldHideNonReimbursableJournalPostingAccount,
    shouldHideReimbursableJournalPostingAccount,
    shouldHideJournalPostingPreference,
};
