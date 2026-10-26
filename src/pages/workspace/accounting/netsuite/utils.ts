import {isAuthenticationError} from '@libs/actions/connections';
import {canUseProvincialTaxNetSuite, canUseTaxNetSuite} from '@libs/NetSuiteUtils';
import {isArchivedPolicy} from '@libs/PolicyUtils/policyType';

import CONST from '@src/CONST';
import type {NetSuiteConnectionConfig, NetSuiteSubsidiary} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

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

function getInitialSubPageForNetsuiteTokenInput(policy: OnyxEntry<Policy>) {
    const netSuiteConnection = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE];
    const isTBAConnection = !!netSuiteConnection?.tokenID;
    const hasAuthError = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.NETSUITE);

    // TBA connections (with or without auth error) migrate through the OAuth wizard starting at INSTALL.
    // Only OAuth connections with an auth error jump straight to CREDENTIALS for re-authentication.
    if (!isTBAConnection && hasAuthError) {
        return CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.CREDENTIALS;
    }
    return CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.INSTALL;
}

type NetSuiteOAuthMigrationSeverity = 'info' | 'warning' | 'danger';

const NETSUITE_OAUTH_DEADLINE = new Date('2027-02-01');
const NETSUITE_OAUTH_DANGER_THRESHOLD_DAYS = 30;
const NETSUITE_OAUTH_WARNING_THRESHOLD_DAYS = 90;

function hasSimpleNetSuiteSyncConfiguration(policy?: Policy): boolean {
    const syncOptions = policy?.connections?.netsuite?.options?.config?.syncOptions;
    return (
        !!syncOptions &&
        !syncOptions.syncTax &&
        !syncOptions.syncReimbursedReports &&
        !syncOptions.syncCustomSegments &&
        !syncOptions.customSegments?.length &&
        !syncOptions.syncCustomLists &&
        !syncOptions.customLists?.length
    );
}

function shouldShowNetSuiteOAuthMigrationOption(policy: Policy | undefined): boolean {
    const netsuite = policy?.connections?.netsuite;
    return (
        !!netsuite &&
        netsuite.verified !== false &&
        netsuite.config?.authType !== CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.OAUTH2 &&
        !!netsuite.accountID &&
        !!netsuite.tokenID &&
        !!netsuite.tokenSecret
    );
}

function shouldShowNetSuiteOAuthMigrationNudge(policy: Policy | undefined, allPolicies: OnyxCollection<Policy> | undefined): boolean {
    const netsuite = policy?.connections?.netsuite;
    if (!netsuite || !shouldShowNetSuiteOAuthMigrationOption(policy) || !hasSimpleNetSuiteSyncConfiguration(policy) || !allPolicies) {
        return false;
    }

    // OAuth updates all policies that share a NetSuite account.
    // Therefore each policy must have a simple configuration before we show the nudge.
    return !Object.values(allPolicies).some((sharedPolicy) => {
        const sharedNetSuite = sharedPolicy?.connections?.netsuite;
        return (
            !!sharedPolicy &&
            sharedPolicy.role === CONST.POLICY.ROLE.ADMIN &&
            !isArchivedPolicy(sharedPolicy) &&
            sharedNetSuite?.accountID === netsuite.accountID &&
            sharedNetSuite.config?.authType !== CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.OAUTH2 &&
            !hasSimpleNetSuiteSyncConfiguration(sharedPolicy)
        );
    });
}

function getNetSuiteOAuthMigrationSeverity(): NetSuiteOAuthMigrationSeverity {
    const now = new Date();
    const daysRemaining = (NETSUITE_OAUTH_DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysRemaining <= NETSUITE_OAUTH_DANGER_THRESHOLD_DAYS) {
        return 'danger';
    }
    if (daysRemaining <= NETSUITE_OAUTH_WARNING_THRESHOLD_DAYS) {
        return 'warning';
    }
    return 'info';
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
    getInitialSubPageForNetsuiteTokenInput,
    shouldShowNetSuiteOAuthMigrationOption,
    shouldShowNetSuiteOAuthMigrationNudge,
    getNetSuiteOAuthMigrationSeverity,
};
