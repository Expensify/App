import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConnectToNetSuiteFlow from '@components/ConnectToNetSuiteFlow';
import ConnectToQuickbooksDesktopFlow from '@components/ConnectToQuickbooksDesktopFlow';
import ConnectToQuickbooksOnlineFlow from '@components/ConnectToQuickbooksOnlineFlow';
import ConnectToSageIntacctFlow from '@components/ConnectToSageIntacctFlow';
import ConnectToXeroFlow from '@components/ConnectToXeroFlow';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {isAuthenticationError} from '@libs/actions/connections';
import * as Localize from '@libs/Localize';
import {canUseTaxNetSuite} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {ThemeStyles} from '@styles/index';
import {getTrackingCategories} from '@userActions/connections/Xero';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {Account, ConnectionName, Connections, PolicyConnectionName, QBDReimbursableExportAccountType} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {
    getImportCustomFieldsSettings,
    shouldHideCustomFormIDOptions,
    shouldHideExportForeignCurrencyAmount,
    shouldHideExportJournalsTo,
    shouldHideExportVendorBillsTo,
    shouldHideJournalPostingPreference,
    shouldHideNonReimbursableJournalPostingAccount,
    shouldHideProvincialTaxPostingAccountSelect,
    shouldHideReimbursableDefaultVendor,
    shouldHideReimbursableJournalPostingAccount,
    shouldHideReimbursedReportsSection,
    shouldHideReportsExportTo,
    shouldHideTaxPostingAccountSelect,
    shouldShowInvoiceItemMenuItem,
} from './netsuite/utils';
import type {AccountingIntegration} from './types';

function getAccountingIntegrationData(
    connectionName: PolicyConnectionName,
    policyID: string,
    translate: LocaleContextProps['translate'],
    policy?: Policy,
    key?: number,
    integrationToDisconnect?: ConnectionName,
    shouldDisconnectIntegrationBeforeConnecting?: boolean,
    canUseNetSuiteUSATax?: boolean,
): AccountingIntegration | undefined {
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const netsuiteConfig = policy?.connections?.netsuite?.options?.config;
    const netsuiteSelectedSubsidiary = (policy?.connections?.netsuite?.options?.data?.subsidiaryList ?? []).find((subsidiary) => subsidiary.internalID === netsuiteConfig?.subsidiaryID);

    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO:
            return {
                title: translate('workspace.accounting.qbo'),
                icon: Expensicons.QBOSquare,
                setupConnectionFlow: (
                    <ConnectToQuickbooksOnlineFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID)),
                subscribedImportSettings: [
                    CONST.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES,
                    CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS,
                    CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS,
                    CONST.QUICKBOOKS_CONFIG.SYNC_TAX,
                ],
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)),
                subscribedExportSettings: [
                    CONST.QUICKBOOKS_CONFIG.EXPORT,
                    CONST.QUICKBOOKS_CONFIG.EXPORT_DATE,
                    CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT,
                    CONST.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT,
                    CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT,
                    ...(qboConfig?.nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL
                        ? [CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR]
                        : []),
                    ...(qboConfig?.nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL &&
                    policy?.connections?.quickbooksOnline?.config?.autoCreateVendor
                        ? [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]
                        : []),
                ],
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.QBO)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID)),
                subscribedAdvancedSettings: [
                    CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID,
                    CONST.QUICKBOOKS_CONFIG.AUTO_SYNC,
                    CONST.QUICKBOOKS_CONFIG.SYNC_PEOPLE,
                    CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR,
                    ...(qboConfig?.collectionAccountID ? [CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID] : []),
                ],
            };
        case CONST.POLICY.CONNECTIONS.NAME.XERO:
            return {
                title: translate('workspace.accounting.xero'),
                icon: Expensicons.XeroSquare,
                setupConnectionFlow: (
                    <ConnectToXeroFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_IMPORT.getRoute(policyID)),
                subscribedImportSettings: [
                    CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES,
                    CONST.XERO_CONFIG.IMPORT_CUSTOMERS,
                    CONST.XERO_CONFIG.IMPORT_TAX_RATES,
                    ...getTrackingCategories(policy).map((category) => `${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`),
                ],
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)),
                subscribedExportSettings: [CONST.XERO_CONFIG.EXPORTER, CONST.XERO_CONFIG.BILL_DATE, CONST.XERO_CONFIG.BILL_STATUS, CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT],
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.XERO)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID)),
                subscribedAdvancedSettings: [
                    CONST.XERO_CONFIG.ENABLED,
                    CONST.XERO_CONFIG.SYNC_REIMBURSED_REPORTS,
                    CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID,
                    CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID,
                ],
                pendingFields: policy?.connections?.xero?.config?.pendingFields,
                errorFields: policy?.connections?.xero?.config?.errorFields,
            };
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
            return {
                title: translate('workspace.accounting.netsuite'),
                icon: Expensicons.NetSuiteSquare,
                setupConnectionFlow: (
                    <ConnectToNetSuiteFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID)),
                subscribedImportSettings: [
                    ...CONST.NETSUITE_CONFIG.IMPORT_FIELDS,
                    CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS,
                    CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS,
                    CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS,
                    ...(canUseTaxNetSuite(canUseNetSuiteUSATax, netsuiteSelectedSubsidiary?.country) ? [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX] : []),
                    ...getImportCustomFieldsSettings(CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS, netsuiteConfig),
                    ...getImportCustomFieldsSettings(CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS, netsuiteConfig),
                ],
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)),
                subscribedExportSettings: [
                    CONST.NETSUITE_CONFIG.EXPORTER,
                    CONST.NETSUITE_CONFIG.EXPORT_DATE,
                    CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    ...(!shouldHideReimbursableDefaultVendor(true, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.DEFAULT_VENDOR] : []),
                    ...(!shouldHideNonReimbursableJournalPostingAccount(true, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.PAYABLE_ACCT] : []),
                    ...(!shouldHideReimbursableJournalPostingAccount(true, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []),
                    ...(!shouldHideJournalPostingPreference(true, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []),
                    CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    ...(!shouldHideReimbursableDefaultVendor(false, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.DEFAULT_VENDOR] : []),
                    ...(!shouldHideNonReimbursableJournalPostingAccount(false, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.PAYABLE_ACCT] : []),
                    ...(!shouldHideReimbursableJournalPostingAccount(false, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []),
                    ...(!shouldHideJournalPostingPreference(false, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []),
                    CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT,
                    CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE,
                    ...(shouldShowInvoiceItemMenuItem(netsuiteConfig) ? [CONST.NETSUITE_CONFIG.INVOICE_ITEM] : []),
                    ...(!shouldHideProvincialTaxPostingAccountSelect(netsuiteSelectedSubsidiary, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT] : []),
                    ...(!shouldHideTaxPostingAccountSelect(canUseNetSuiteUSATax, netsuiteSelectedSubsidiary, netsuiteConfig) ? [CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT] : []),
                    ...(!shouldHideExportForeignCurrencyAmount(netsuiteConfig) ? [CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY] : []),
                    CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD,
                ],
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID)),
                subscribedAdvancedSettings: [
                    CONST.NETSUITE_CONFIG.AUTO_SYNC,
                    ...(!shouldHideReimbursedReportsSection(netsuiteConfig)
                        ? [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS, CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID, CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT]
                        : []),
                    CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE,
                    CONST.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES,
                    CONST.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES,
                    ...(!shouldHideReportsExportTo(netsuiteConfig) ? [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO] : []),
                    ...(!shouldHideExportVendorBillsTo(netsuiteConfig) ? [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO] : []),
                    ...(!shouldHideExportJournalsTo(netsuiteConfig) ? [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO] : []),
                    CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT,
                    CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED,
                    ...(!shouldHideCustomFormIDOptions(netsuiteConfig)
                        ? [CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.REIMBURSABLE, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.NON_REIMBURSABLE]
                        : []),
                ],
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.netsuite.alias,
                    backToAfterWorkspaceUpgradeRoute: integrationToDisconnect
                        ? ROUTES.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting)
                        : ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID),
                },
                pendingFields: {...netsuiteConfig?.pendingFields, ...policy?.connections?.netsuite?.config?.pendingFields},
                errorFields: {...netsuiteConfig?.errorFields, ...policy?.connections?.netsuite?.config?.errorFields},
            };
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            return {
                title: translate('workspace.accounting.intacct'),
                icon: Expensicons.IntacctSquare,
                setupConnectionFlow: (
                    <ConnectToSageIntacctFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID)),
                subscribedImportSettings: [
                    CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS,
                    ...Object.values(CONST.SAGE_INTACCT_CONFIG.MAPPINGS),
                    CONST.SAGE_INTACCT_CONFIG.TAX,
                    ...(policy?.connections?.intacct?.config?.mappings?.dimensions ?? []).map((dimension) => `${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimension.dimension}`),
                ],
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)),
                subscribedExportSettings: [
                    CONST.SAGE_INTACCT_CONFIG.EXPORTER,
                    CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE,
                    CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE,
                    CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR,
                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE,
                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                    policy?.connections?.intacct?.config?.export?.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                        ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                        : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                ],
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID)),
                subscribedAdvancedSettings: [
                    CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED,
                    CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES,
                    CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
                    CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS,
                    CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID,
                ],
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.intacct.alias,
                    backToAfterWorkspaceUpgradeRoute: integrationToDisconnect
                        ? ROUTES.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting)
                        : ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID),
                },
                pendingFields: policy?.connections?.intacct?.config?.pendingFields,
                errorFields: policy?.connections?.intacct?.config?.errorFields,
            };
        case CONST.POLICY.CONNECTIONS.NAME.QBD:
            return {
                title: translate('workspace.accounting.qbd'),
                icon: Expensicons.QBDSquare,
                setupConnectionFlow: (
                    <ConnectToQuickbooksDesktopFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.getRoute(policyID)),
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID)),
                onCardReconciliationPagePress: () => {},
                onAdvancedPagePress: () => {},
                // TODO: [QBD] Make sure all values are passed to subscribedSettings
                subscribedImportSettings: [],
                subscribedExportSettings: [
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED,
                ],
                subscribedAdvancedSettings: [],
            };
        default:
            return undefined;
    }
}

function getSynchronizationErrorMessage(
    policy: OnyxEntry<Policy>,
    connectionName: PolicyConnectionName,
    isSyncInProgress: boolean,
    translate: LocaleContextProps['translate'],
    styles?: ThemeStyles,
): React.ReactNode | undefined {
    if (isAuthenticationError(policy, connectionName)) {
        return (
            <Text style={[styles?.formError]}>
                <Text style={[styles?.formError]}>{translate('workspace.common.authenticationError', {connectionName: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]})} </Text>
                {connectionName in CONST.POLICY.CONNECTIONS.AUTH_HELP_LINKS && (
                    <TextLink
                        style={[styles?.link, styles?.fontSizeLabel]}
                        href={CONST.POLICY.CONNECTIONS.AUTH_HELP_LINKS[connectionName as keyof typeof CONST.POLICY.CONNECTIONS.AUTH_HELP_LINKS]}
                    >
                        {translate('workspace.common.learnMore')}
                    </TextLink>
                )}
            </Text>
        );
    }

    const syncError = Localize.translateLocal('workspace.accounting.syncError', {connectionName});

    const connection = policy?.connections?.[connectionName];
    if (isSyncInProgress || isEmptyObject(connection?.lastSync) || connection?.lastSync?.isSuccessful !== false || !connection?.lastSync?.errorDate) {
        return;
    }

    return `${syncError} ("${connection?.lastSync?.errorMessage}")`;
}

function getQBDReimbursableAccounts(quickbooksDesktop?: Connections[typeof CONST.POLICY.CONNECTIONS.NAME.QBD], reimbursable?: QBDReimbursableExportAccountType | undefined) {
    const {bankAccounts, journalEntryAccounts, payableAccounts} = quickbooksDesktop?.data ?? {};

    let accounts: Account[];
    switch (reimbursable ?? quickbooksDesktop?.config?.export.reimbursable) {
        case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
            accounts = bankAccounts ?? [];
            break;
        case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
            // Journal entry accounts include payable accounts, other current liabilities, and other current assets
            accounts = [...(payableAccounts ?? []), ...(journalEntryAccounts ?? [])];
            break;
        case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
            accounts = payableAccounts ?? [];
            break;
        default:
            accounts = [];
    }
    return accounts;
}

export {getAccountingIntegrationData, getSynchronizationErrorMessage, getQBDReimbursableAccounts};
