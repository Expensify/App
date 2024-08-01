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

export {shouldHideReimbursedReportsSection, shouldHideReportsExportTo, shouldHideExportVendorBillsTo, shouldHideExportJournalsTo, shouldHideCustomFormIDOptions};
