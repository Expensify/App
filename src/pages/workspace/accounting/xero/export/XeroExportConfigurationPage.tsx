import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {findCurrentXeroOrganization, getXeroTenants} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';

type MenuItem = MenuItemProps & {pendingAction?: OfflineWithFeedbackProps['pendingAction']};

function XeroExportConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const policyOwner = policy?.owner ?? '';

    const {export: exportConfiguration, errorFields, pendingFields} = policy?.connections?.xero?.config ?? {};
    const tenants = useMemo(() => getXeroTenants(policy ?? undefined), [policy]);
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);

    const menuItems: MenuItem[] = [
        {
            description: translate('workspace.xero.preferredExporter'),
            onPress: () => {},
            brickRoadIndicator: errorFields?.exporter ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportConfiguration?.exporter ?? policyOwner,
            pendingAction: pendingFields?.export,
            error: errorFields?.exporter ? translate('common.genericErrorMessage') : undefined,
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
            brickRoadIndicator: errorFields?.billDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportConfiguration?.billDate,
            pendingAction: pendingFields?.export,
            error: errorFields?.billDate ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.xero.advancedConfig.purchaseBillStatusTitle'),
            onPress: () => {},
            title: exportConfiguration?.billStatus?.purchase,
            pendingAction: pendingFields?.export,
            error: errorFields?.purchase ? translate('common.genericErrorMessage') : undefined,
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
            onPress: () => {},
            brickRoadIndicator: errorFields?.nonReimbursableAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: undefined,
            pendingAction: pendingFields?.export,
            error: undefined,
        },
    ];

    return (
        <ConnectionLayout
            displayName={XeroExportConfigurationPage.displayName}
            headerTitle="workspace.xero.export"
            headerSubtitle={currentXeroOrganization?.name}
            title="workspace.xero.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
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
                        error={menuItem?.error}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

XeroExportConfigurationPage.displayName = 'XeroExportConfigurationPage';

export default withPolicyConnections(XeroExportConfigurationPage);
