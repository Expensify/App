import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentXeroOrganizationName} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuItem = MenuItemProps & {pendingAction?: OfflineWithFeedbackProps['pendingAction']};

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

    const menuItems: MenuItem[] = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT.getRoute(policyID));
            },
            brickRoadIndicator: errorFields?.exporter ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportConfiguration?.exporter ?? policyOwner,
            pendingAction: pendingFields?.export,
            errorText: errorFields?.exporter ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            title: translate('workspace.xero.purchaseBill'),
            interactive: false,
            shouldShowRightIcon: false,
            helperText: translate('workspace.xero.exportExpensesDescription'),
        },
        {
            description: translate('workspace.xero.purchaseBillDate'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT.getRoute(policyID)),
            brickRoadIndicator: errorFields?.billDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportConfiguration?.billDate ? translate(`workspace.xero.exportDate.values.${exportConfiguration.billDate}.label`) : undefined,
            pendingAction: pendingFields?.export,
            errorText: errorFields?.billDate ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.xero.advancedConfig.purchaseBillStatusTitle'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR.getRoute(policyID)),
            title: exportConfiguration?.billStatus?.purchase ? translate(`workspace.xero.invoiceStatus.values.${exportConfiguration.billStatus.purchase}`) : undefined,
            pendingAction: pendingFields?.export,
            errorText: errorFields?.purchase ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.xero.exportInvoices'),
            title: translate('workspace.xero.salesInvoice'),
            interactive: false,
            shouldShowRightIcon: false,
            helperText: translate('workspace.xero.exportInvoicesDescription'),
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            title: translate('workspace.xero.bankTransactions'),
            shouldShowRightIcon: false,
            interactive: false,
            helperText: translate('workspace.xero.exportDeepDiveCompanyCard'),
        },
        {
            description: translate('workspace.xero.xeroBankAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: errorFields?.nonReimbursableAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedBankAccountName,
            pendingAction: pendingFields?.export,
            errorText: errorFields?.nonReimbursableAccount ? translate('common.genericErrorMessage') : undefined,
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
                        brickRoadIndicator={menuItem?.brickRoadIndicator}
                        helperText={menuItem?.helperText}
                        errorText={menuItem?.errorText}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

XeroExportConfigurationPage.displayName = 'XeroExportConfigurationPage';

export default withPolicyConnections(XeroExportConfigurationPage);
