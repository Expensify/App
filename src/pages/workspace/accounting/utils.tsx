import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConnectToNetSuiteFlow from '@components/ConnectToNetSuiteFlow';
import ConnectToQuickbooksOnlineFlow from '@components/ConnectToQuickbooksOnlineFlow';
import ConnectToSageIntacctFlow from '@components/ConnectToSageIntacctFlow';
import ConnectToXeroFlow from '@components/ConnectToXeroFlow';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {isAuthenticationError} from '@libs/actions/connections';
import * as Localize from '@libs/Localize';
import Navigation from '@navigation/Navigation';
import type {ThemeStyles} from '@styles/index';
import {getTrackingCategories} from '@userActions/connections/ConnectToXero';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {AccountingIntegration} from './types';

function getAccountingIntegrationData(
    connectionName: PolicyConnectionName,
    policyID: string,
    translate: LocaleContextProps['translate'],
    policy?: Policy,
    key?: number,
): AccountingIntegration | undefined {
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
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)),
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.QBO)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID)),
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
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)),
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID)),
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.netsuite.alias,
                    backToAfterWorkspaceUpgradeRoute: ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID),
                },
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
                    backToAfterWorkspaceUpgradeRoute: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID),
                },
                pendingFields: policy?.connections?.intacct?.config?.pendingFields,
                errorFields: policy?.connections?.intacct?.config?.errorFields,
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
    const syncError = Localize.translateLocal('workspace.accounting.syncError', connectionName);
    // NetSuite does not use the conventional lastSync object, so we need to check for lastErrorSyncDate
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.NETSUITE) {
        if (
            !isSyncInProgress &&
            (!!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE].lastErrorSyncDate || policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]?.verified === false)
        ) {
            return syncError;
        }
        return;
    }

    const connection = policy?.connections?.[connectionName];
    if (isSyncInProgress || isEmptyObject(connection?.lastSync) || connection?.lastSync?.isSuccessful) {
        return;
    }

    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT && isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT)) {
        return (
            <Text style={[styles?.formError]}>
                <Text style={[styles?.formError]}>{translate('workspace.sageIntacct.authenticationError')}</Text>
                <TextLink
                    style={[styles?.link, styles?.fontSizeLabel]}
                    href={CONST.SAGE_INTACCT_HELP_LINK}
                >
                    {translate('workspace.sageIntacct.learnMore')}
                </TextLink>
            </Text>
        );
    }
    return `${syncError} ("${connection?.lastSync?.errorMessage}")`;
}

export {getAccountingIntegrationData, getSynchronizationErrorMessage};
