import type {ValueOf} from 'type-fest';
import {canUseProvincialTaxNetSuite, canUseTaxNetSuite} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {NetSuiteConnectionConfig, NetSuiteSubsidiary} from '@src/types/onyx/Policy';

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

function shouldShowInvoiceItemMenuItem(config?: NetSuiteConnectionConfig) {
    return config?.invoiceItemPreference === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT;
}

function shouldHideProvincialTaxPostingAccountSelect(selectedSubsidiary?: NetSuiteSubsidiary, config?: NetSuiteConnectionConfig) {
    return !!config?.suiteTaxEnabled || !config?.syncOptions.syncTax || !canUseProvincialTaxNetSuite(selectedSubsidiary?.country);
}

function shouldHideTaxPostingAccountSelect(canUseNetSuiteUSATax?: boolean, selectedSubsidiary?: NetSuiteSubsidiary, config?: NetSuiteConnectionConfig) {
    return !!config?.suiteTaxEnabled || !config?.syncOptions.syncTax || !canUseTaxNetSuite(canUseNetSuiteUSATax, selectedSubsidiary?.country);
}

function shouldHideExportForeignCurrencyAmount(config?: NetSuiteConnectionConfig) {
    return (
        config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT &&
        config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT
    );
}

function getImportCustomFieldsSettings(importField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>, config?: NetSuiteConnectionConfig) {
    const data = config?.syncOptions?.[importField] ?? [];
    return data.map((_, index) => `${importField}_${index}`);
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
    shouldShowInvoiceItemMenuItem,
    shouldHideProvincialTaxPostingAccountSelect,
    shouldHideTaxPostingAccountSelect,
    shouldHideExportForeignCurrencyAmount,
    getImportCustomFieldsSettings,
};
