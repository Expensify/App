import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuItem = MenuItemProps & {pendingAction?: OfflineWithFeedbackProps['pendingAction']};

function XeroExportConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const policyOwner = policy?.owner ?? '';
    const {export: exportConfiguration, errorFields, pendingFields} = policy?.connections?.xero?.config ?? {};
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
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT.getRoute(policyID)),
            brickRoadIndicator: errorFields?.billDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportConfiguration?.billDate ? translate(`workspace.xero.exportDate.values.${exportConfiguration.billDate}.label`) : undefined,
            pendingAction: pendingFields?.export,
            error: errorFields?.billDate ? translate('common.genericErrorMessage') : undefined,
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
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={XeroExportConfigurationPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.xero.export')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.exportDescription')}</Text>
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
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroExportConfigurationPage.displayName = 'XeroExportConfigurationPage';

export default withPolicyConnections(XeroExportConfigurationPage);
