"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldHideReimbursedReportsSection = shouldHideReimbursedReportsSection;
exports.shouldHideReportsExportTo = shouldHideReportsExportTo;
exports.shouldHideExportVendorBillsTo = shouldHideExportVendorBillsTo;
exports.shouldHideExportJournalsTo = shouldHideExportJournalsTo;
exports.shouldHideCustomFormIDOptions = shouldHideCustomFormIDOptions;
exports.exportExpensesDestinationSettingName = exportExpensesDestinationSettingName;
exports.shouldHideReimbursableDefaultVendor = shouldHideReimbursableDefaultVendor;
exports.shouldHideNonReimbursableJournalPostingAccount = shouldHideNonReimbursableJournalPostingAccount;
exports.shouldHideReimbursableJournalPostingAccount = shouldHideReimbursableJournalPostingAccount;
exports.shouldHideJournalPostingPreference = shouldHideJournalPostingPreference;
exports.shouldShowInvoiceItemMenuItem = shouldShowInvoiceItemMenuItem;
exports.shouldHideProvincialTaxPostingAccountSelect = shouldHideProvincialTaxPostingAccountSelect;
exports.shouldHideTaxPostingAccountSelect = shouldHideTaxPostingAccountSelect;
exports.shouldHideExportForeignCurrencyAmount = shouldHideExportForeignCurrencyAmount;
exports.getImportCustomFieldsSettings = getImportCustomFieldsSettings;
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
function shouldHideReimbursedReportsSection(config) {
    return (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) === CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}
function shouldHideReportsExportTo(config) {
    return (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT;
}
function shouldHideExportVendorBillsTo(config) {
    return ((config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL &&
        (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
}
function shouldHideExportJournalsTo(config) {
    return ((config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY &&
        (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY);
}
function shouldHideCustomFormIDOptions(config) {
    var _a;
    return !((_a = config === null || config === void 0 ? void 0 : config.customFormIDOptions) === null || _a === void 0 ? void 0 : _a.enabled);
}
function exportExpensesDestinationSettingName(isReimbursable) {
    return isReimbursable ? CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION : CONST_1.default.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION;
}
function shouldHideReimbursableDefaultVendor(isReimbursable, config) {
    return isReimbursable || (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL;
}
function shouldHideNonReimbursableJournalPostingAccount(isReimbursable, config) {
    return isReimbursable || (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}
function shouldHideReimbursableJournalPostingAccount(isReimbursable, config) {
    return !isReimbursable || (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}
function shouldHideJournalPostingPreference(isReimbursable, config) {
    return (config === null || config === void 0 ? void 0 : config[exportExpensesDestinationSettingName(isReimbursable)]) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY;
}
function shouldShowInvoiceItemMenuItem(config) {
    return (config === null || config === void 0 ? void 0 : config.invoiceItemPreference) === CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT;
}
function shouldHideProvincialTaxPostingAccountSelect(selectedSubsidiary, config) {
    return !!(config === null || config === void 0 ? void 0 : config.suiteTaxEnabled) || !(config === null || config === void 0 ? void 0 : config.syncOptions.syncTax) || !(0, PolicyUtils_1.canUseProvincialTaxNetSuite)(selectedSubsidiary === null || selectedSubsidiary === void 0 ? void 0 : selectedSubsidiary.country);
}
function shouldHideTaxPostingAccountSelect(canUseNetSuiteUSATax, selectedSubsidiary, config) {
    return !!(config === null || config === void 0 ? void 0 : config.suiteTaxEnabled) || !(config === null || config === void 0 ? void 0 : config.syncOptions.syncTax) || !(0, PolicyUtils_1.canUseTaxNetSuite)(canUseNetSuiteUSATax, selectedSubsidiary === null || selectedSubsidiary === void 0 ? void 0 : selectedSubsidiary.country);
}
function shouldHideExportForeignCurrencyAmount(config) {
    return ((config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT &&
        (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT);
}
function getImportCustomFieldsSettings(importField, config) {
    var _a, _b;
    var data = (_b = (_a = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _a === void 0 ? void 0 : _a[importField]) !== null && _b !== void 0 ? _b : [];
    return data.map(function (_, index) { return "".concat(importField, "_").concat(index); });
}
