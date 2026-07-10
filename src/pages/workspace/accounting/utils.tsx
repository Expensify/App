import ConnectToCertiniaFlow from '@components/ConnectToCertiniaFlow';
import ConnectToNetSuiteFlow from '@components/ConnectToNetSuiteFlow';
import ConnectToQuickbooksDesktopFlow from '@components/ConnectToQuickbooksDesktopFlow';
import ConnectToQuickbooksOnlineFlow from '@components/ConnectToQuickbooksOnlineFlow';
import ConnectToRilletFlow from '@components/ConnectToRilletFlow';
import ConnectToSageIntacctFlow from '@components/ConnectToSageIntacctFlow';
import ConnectToXeroFlow from '@components/ConnectToXeroFlow';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {isAuthenticationError} from '@libs/actions/connections';
import {getCardsCustomExportPendingAction, areCardsCustomExportInErrorFields} from '@libs/CardFeedUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {canUseTaxNetSuite} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import type {ThemeStyles} from '@styles/index';

import {getTrackingCategories} from '@userActions/connections/Xero';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {CombinedCardFeeds, Policy, WorkspaceCardsList} from '@src/types/onyx';
import type {Account, ConnectionName, Connections, PolicyConnectionName, QBDNonReimbursableExportAccountType, QBDReimbursableExportAccountType} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {AccountingIntegration} from './types';

import {
    getImportCustomFieldsSettings,
    getInitialSubPageForNetsuiteTokenInput,
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
import getQuickbooksDesktopSetupEntryRoute from './qbd/utils';

function getAccountingIntegrationData(
    connectionName: PolicyConnectionName,
    policyID: string,
    translate: LocaleContextProps['translate'],
    existingConnections: {sageIntacct: boolean; qbd: boolean; certinia: boolean; rillet: boolean},
    policy?: Policy,
    key?: number,
    integrationToDisconnect?: ConnectionName,
    shouldDisconnectIntegrationBeforeConnecting?: boolean,
    canUseNetSuiteUSATax?: boolean,
    expensifyIcons?: Record<'IntacctSquare' | 'QBOSquare' | 'XeroSquare' | 'NetSuiteSquare' | 'QBDSquare' | 'CertiniaSquare' | 'RilletSquare', IconAsset>,
    cardFeeds?: CombinedCardFeeds,
    cardList?: Record<string, WorkspaceCardsList | undefined>,
): AccountingIntegration | undefined {
    const basePath = ROUTES.POLICY_ACCOUNTING.getRoute(policyID);
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const netsuiteConfig = policy?.connections?.netsuite?.options?.config;
    const netsuiteSelectedSubsidiary = (policy?.connections?.netsuite?.options?.data?.subsidiaryList ?? []).find((subsidiary) => subsidiary.internalID === netsuiteConfig?.subsidiaryID);
    const getBackToAfterWorkspaceUpgradeRouteForIntacct = () => {
        if (integrationToDisconnect) {
            return ROUTES.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting);
        }
        if (existingConnections.sageIntacct) {
            return ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID);
        }
        return createDynamicRoute(DYNAMIC_ROUTES.SAGE_INTACCT_PREREQUISITES.path, basePath);
    };
    const getBackToAfterWorkspaceUpgradeRouteForQBD = () => {
        if (integrationToDisconnect) {
            return ROUTES.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting);
        }
        if (existingConnections.qbd) {
            return ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXISTING_CONNECTIONS.getRoute(policyID);
        }
        return getQuickbooksDesktopSetupEntryRoute(policyID);
    };
    const getBackToAfterWorkspaceUpgradeRouteForCertinia = () => {
        if (integrationToDisconnect) {
            return ROUTES.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting);
        }
        if (existingConnections.certinia) {
            return ROUTES.POLICY_ACCOUNTING_CERTINIA_EXISTING_CONNECTIONS.getRoute(policyID);
        }
        return ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID);
    };
    const getBackToAfterWorkspaceUpgradeRouteForRillet = () => {
        if (integrationToDisconnect) {
            return ROUTES.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting);
        }
        if (existingConnections.rillet) {
            return ROUTES.POLICY_ACCOUNTING_RILLET_EXISTING_CONNECTIONS.getRoute(policyID);
        }
        return ROUTES.POLICY_ACCOUNTING_RILLET_SETUP.getRoute(policyID);
    };

    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO:
            return {
                title: translate('workspace.accounting.qbo'),
                icon: expensifyIcons?.QBOSquare,
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
                    CONST.QUICKBOOKS_CONFIG.SYNC_ITEMS,
                ],
                onExportPagePress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.path, basePath)),
                subscribedExportSettings: [
                    CONST.QUICKBOOKS_CONFIG.EXPORT,
                    CONST.QUICKBOOKS_CONFIG.EXPORT_DATE,
                    CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT,
                    CONST.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT,
                    CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT,
                    CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR,
                    CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT,
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
                pendingFields: {...qboConfig?.pendingFields, ...policy?.connections?.quickbooksOnline?.config?.pendingFields},
                errorFields: {...qboConfig?.errorFields, ...policy?.connections?.quickbooksOnline?.config?.errorFields},
            };
        case CONST.POLICY.CONNECTIONS.NAME.XERO:
            return {
                title: translate('workspace.accounting.xero'),
                icon: expensifyIcons?.XeroSquare,
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
                onExportPagePress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.path, basePath)),
                subscribedExportSettings: [
                    CONST.XERO_CONFIG.EXPORTER,
                    CONST.XERO_CONFIG.BILL_DATE,
                    CONST.XERO_CONFIG.BILL_STATUS,
                    CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT,
                    CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                ],
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
                icon: expensifyIcons?.NetSuiteSquare,
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
                onExportPagePress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.path)),
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
                    CONST.NETSUITE_CONFIG.ACCOUNTING_METHOD,
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
                        : ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID, getInitialSubPageForNetsuiteTokenInput(policy)),
                },
                pendingFields: {...netsuiteConfig?.pendingFields, ...policy?.connections?.netsuite?.config?.pendingFields, ...policy?.connections?.netsuite?.options?.config?.pendingFields},
                errorFields: {...netsuiteConfig?.errorFields, ...policy?.connections?.netsuite?.config?.errorFields, ...policy?.connections?.netsuite?.options?.config?.errorFields},
            };
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            return {
                title: translate('workspace.accounting.intacct'),
                icon: expensifyIcons?.IntacctSquare,
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
                onExportPagePress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID))),
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
                    backToAfterWorkspaceUpgradeRoute: getBackToAfterWorkspaceUpgradeRouteForIntacct(),
                },
                pendingFields: policy?.connections?.intacct?.config?.pendingFields,
                errorFields: policy?.connections?.intacct?.config?.errorFields,
            };
        case CONST.POLICY.CONNECTIONS.NAME.QBD:
            return {
                title: translate('workspace.accounting.qbd'),
                icon: expensifyIcons?.QBDSquare,
                setupConnectionFlow: (
                    <ConnectToQuickbooksDesktopFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.getRoute(policyID)),
                onExportPagePress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.path)),
                onAdvancedPagePress: () =>
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID))),
                subscribedImportSettings: [
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS,
                ],
                subscribedExportSettings: [
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR,
                    CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR,
                ],
                subscribedAdvancedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR, CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC],
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.quickbooksDesktop.alias,
                    backToAfterWorkspaceUpgradeRoute: getBackToAfterWorkspaceUpgradeRouteForQBD(),
                },
            };
        case CONST.POLICY.CONNECTIONS.NAME.CERTINIA: {
            const certiniaConnection = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA];
            const certiniaConfig = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.config;
            const certiniaSubscribedExportSettings = certiniaConfig?.hasPSA
                ? [CONST.CERTINIA_CONFIG.EXPORTER, CONST.CERTINIA_CONFIG.EXPORT_STATUS, CONST.CERTINIA_CONFIG.REIMBURSABLE, CONST.CERTINIA_CONFIG.NON_REIMBURSABLE]
                : [
                      CONST.CERTINIA_CONFIG.EXPORTER,
                      CONST.CERTINIA_CONFIG.EXPORT_STATUS,
                      CONST.CERTINIA_CONFIG.EXPORT_DATE,
                      CONST.CERTINIA_CONFIG.VENDOR_ACCOUNT,
                      CONST.CERTINIA_CONFIG.REIMBURSABLE,
                      CONST.CERTINIA_CONFIG.NON_REIMBURSABLE,
                  ];
            const certiniaSubscribedImportSettings = certiniaConfig?.hasPSA
                ? [CONST.CERTINIA_CONFIG.PARENT_TAG_MAPPING, CONST.CERTINIA_CONFIG.SYNC_MILESTONES]
                : [
                      CONST.CERTINIA_CONFIG.CODING_DIMENSION1,
                      CONST.CERTINIA_CONFIG.CODING_DIMENSION2,
                      CONST.CERTINIA_CONFIG.CODING_DIMENSION3,
                      CONST.CERTINIA_CONFIG.CODING_DIMENSION4,
                      CONST.CERTINIA_CONFIG.SYNC_TAX,
                  ];
            const certiniaSubscribedAdvancedSettings = certiniaConfig?.hasPSA
                ? [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED, CONST.CERTINIA_CONFIG.TAX_NON_BILLABLE, CONST.CERTINIA_CONFIG.EXPORT_FOREIGN_CURRENCY]
                : [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED, CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS];
            let certiniaTitle = translate('workspace.certinia.title');
            if (certiniaConnection && certiniaConfig?.hasPSA) {
                certiniaTitle = translate('workspace.certinia.titlePSA');
            } else if (certiniaConnection) {
                certiniaTitle = translate('workspace.certinia.titleFFA');
            }
            return {
                title: certiniaTitle,
                icon: expensifyIcons?.CertiniaSquare,
                setupConnectionFlow: (
                    <ConnectToCertiniaFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_IMPORT.getRoute(policyID)),
                subscribedImportSettings: certiniaSubscribedImportSettings,
                onExportPagePress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_EXPORT.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID))),
                subscribedExportSettings: certiniaSubscribedExportSettings,
                onAdvancedPagePress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_ADVANCED.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID))),
                subscribedAdvancedSettings: certiniaSubscribedAdvancedSettings,
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.CERTINIA)),
                pendingFields: certiniaConfig?.pendingFields,
                errorFields: certiniaConfig?.errorFields,
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING[CONST.POLICY.CONNECTIONS.NAME.CERTINIA].alias,
                    backToAfterWorkspaceUpgradeRoute: getBackToAfterWorkspaceUpgradeRouteForCertinia(),
                },
            } as AccountingIntegration;
        }
        case CONST.POLICY.CONNECTIONS.NAME.RILLET: {
            return {
                title: translate('workspace.accounting.rillet'),
                icon: expensifyIcons?.RilletSquare,
                setupConnectionFlow: (
                    <ConnectToRilletFlow
                        policyID={policyID}
                        key={key}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_IMPORT.getRoute(policyID)),
                subscribedImportSettings: [
                    CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST.RILLET_CONFIG.SYNC_TAX_RATES,
                    ...(policy?.connections?.rillet?.data?.fields?.map((field) => `${CONST.RILLET_CONFIG.FIELD_MAPPING_PREFIX}${field.id}`) ?? []),
                ],
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(policyID)),
                subscribedExportSettings: [
                    CONST.RILLET_CONFIG.EXPORTER,
                    CONST.RILLET_CONFIG.EXPORT_DATE,
                    CONST.RILLET_CONFIG.REIMBURSABLE,
                    CONST.RILLET_CONFIG.COMPANY_CARD,
                    CONST.RILLET_CONFIG.DEFAULT_VENDORID,
                    CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE,
                    CONST.RILLET_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS,
                    ...[CONST.EXPENSIFY_CARD.BANK, ...Object.values(CONST.COMPANY_CARD.FEED_BANK_NAME)].map((program) => `${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${program}`),
                ],
                externalSubscribedExportSettingsPendingAction: getCardsCustomExportPendingAction(
                    cardFeeds ?? {},
                    cardList ?? {},
                    CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
                ),
                externalSubscribedExportSettingsHasErrorFields: areCardsCustomExportInErrorFields(
                    cardFeeds ?? {},
                    cardList ?? {},
                    CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
                ),
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.RILLET)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_ADVANCED.getRoute(policyID)),
                subscribedAdvancedSettings: [
                    CONST.RILLET_CONFIG.ACCOUNTING_METHOD,
                    CONST.RILLET_CONFIG.AUTO_SYNC,
                    CONST.RILLET_CONFIG.SYNC_REIMBURSED_REPORTS,
                    CONST.RILLET_CONFIG.BILL_PAYMENT_ACCOUNT_CODE,
                    CONST.RILLET_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS,
                    CONST.RILLET_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID,
                    CONST.RILLET_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS,
                    CONST.RILLET_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID,
                ],
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.rillet.alias,
                    backToAfterWorkspaceUpgradeRoute: getBackToAfterWorkspaceUpgradeRouteForRillet(),
                },
                pendingFields: policy?.connections?.rillet?.config?.pendingFields,
                errorFields: policy?.connections?.rillet?.config?.errorFields,
            };
        }
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
                <Text style={[styles?.formError]}>{translate('workspace.common.authenticationError', CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName])} </Text>
                {connectionName in CONST.POLICY.CONNECTIONS.AUTH_HELP_LINKS && (
                    <>
                        <TextLink
                            style={[styles?.link, styles?.fontSizeLabel]}
                            href={CONST.POLICY.CONNECTIONS.AUTH_HELP_LINKS[connectionName as keyof typeof CONST.POLICY.CONNECTIONS.AUTH_HELP_LINKS]}
                        >
                            {translate('workspace.common.learnMore')}
                        </TextLink>
                        .
                    </>
                )}
            </Text>
        );
    }

    const syncError = translate('workspace.accounting.syncError', {connectionName});

    const connection = policy?.connections?.[connectionName];
    if (isSyncInProgress || isEmptyObject(connection?.lastSync) || connection?.lastSync?.isSuccessful !== false || !connection?.lastSync?.errorDate) {
        return;
    }

    return `${syncError} ("${connection?.lastSync?.errorMessage}")`;
}

function getQBDReimbursableAccounts(
    quickbooksDesktop?: Connections[typeof CONST.POLICY.CONNECTIONS.NAME.QBD],
    reimbursable?: QBDReimbursableExportAccountType | QBDNonReimbursableExportAccountType,
) {
    const {bankAccounts, journalEntryAccounts, payableAccounts, creditCardAccounts} = quickbooksDesktop?.data ?? {};

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
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            accounts = creditCardAccounts ?? [];
            break;
        default:
            accounts = [];
    }
    return accounts;
}

export {getAccountingIntegrationData, getSynchronizationErrorMessage, getQBDReimbursableAccounts};
