import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentXeroOrganizationName} from '@libs/PolicyUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroExportConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const policyOwner = policy?.owner ?? '';

    const {export: exportConfiguration, errorFields, pendingFields} = policy?.connections?.xero?.config ?? {};

    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const selectedBankAccountName = useMemo(() => {
        const selectedAccount = (bankAccounts ?? []).find((bank) => bank.id === exportConfiguration?.nonReimbursableAccount);
        return selectedAccount?.name ?? bankAccounts?.[0]?.name ?? '';
    }, [bankAccounts, exportConfiguration?.nonReimbursableAccount]);

    const currentXeroOrganizationName = useMemo(() => getCurrentXeroOrganizationName(policy ?? undefined), [policy]);

    const menuItems = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT.getRoute(policyID));
            },
            hasError: PolicyUtils.areSettingsInErrorFields([CONST.XERO_CONFIG.EXPORTER], errorFields),
            title: exportConfiguration?.exporter ?? policyOwner,
            pendingAction: pendingFields?.exporter,
        },
        {
            description: translate('workspace.xero.exportExpenses'),
            title: translate('workspace.xero.purchaseBill'),
            interactive: false,
            shouldShowRightIcon: false,
            helperText: translate('workspace.xero.exportExpensesDescription'),
        },
        {
            description: translate('workspace.xero.purchaseBillDate'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT.getRoute(policyID)),
            hasError: PolicyUtils.areSettingsInErrorFields([CONST.XERO_CONFIG.BILL_DATE], errorFields),
            title: exportConfiguration?.billDate ? translate(`workspace.xero.exportDate.values.${exportConfiguration.billDate}.label`) : undefined,
            pendingAction: pendingFields?.billDate,
        },
        {
            description: translate('workspace.xero.advancedConfig.purchaseBillStatusTitle'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR.getRoute(policyID)),
            hasError: PolicyUtils.areSettingsInErrorFields([CONST.XERO_CONFIG.BILL_STATUS], errorFields),
            title: exportConfiguration?.billStatus?.purchase ? translate(`workspace.xero.invoiceStatus.values.${exportConfiguration.billStatus.purchase}`) : undefined,
            pendingAction: pendingFields?.billStatus,
        },
        {
            description: translate('workspace.xero.exportInvoices'),
            title: translate('workspace.xero.salesInvoice'),
            interactive: false,
            shouldShowRightIcon: false,
            helperText: translate('workspace.xero.exportInvoicesDescription'),
        },
        {
            description: translate('workspace.xero.exportCompanyCard'),
            title: translate('workspace.xero.bankTransactions'),
            shouldShowRightIcon: false,
            interactive: false,
            helperText: translate('workspace.xero.exportDeepDiveCompanyCard'),
        },
        {
            description: translate('workspace.xero.xeroBankAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT.getRoute(policyID)),
            hasError: PolicyUtils.areSettingsInErrorFields([CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT], errorFields),
            title: selectedBankAccountName,
            pendingAction: pendingFields?.nonReimbursableAccount,
        },
    ];

    return (
        <ConnectionLayout
            displayName={XeroExportConfigurationPage.displayName}
            headerTitle="workspace.accounting.export"
            headerSubtitle={currentXeroOrganizationName}
            title="workspace.xero.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            {menuItems.map((menuItem) => (
                <OfflineWithFeedback
                    key={menuItem.description}
                    pendingAction={menuItem.pendingAction}
                >
                    <MenuItemWithTopDescription
                        title={menuItem.title}
                        interactive={menuItem?.interactive ?? true}
                        description={menuItem.description}
                        shouldShowRightIcon={menuItem?.shouldShowRightIcon ?? true}
                        onPress={menuItem?.onPress}
                        brickRoadIndicator={menuItem?.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        helperText={menuItem?.helperText}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

XeroExportConfigurationPage.displayName = 'XeroExportConfigurationPage';

export default withPolicyConnections(XeroExportConfigurationPage);
