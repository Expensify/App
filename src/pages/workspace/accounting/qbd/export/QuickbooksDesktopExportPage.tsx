import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksDesktopExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner ?? '';
    const qbdConfig = policy?.connections?.quickbooksOnline?.config; // TODO: should be updated to use the new connections object
    const errorFields = qbdConfig?.errorFields;
    const {canUseNewDotQBD} = usePermissions();

    const shouldShowVendorMenuItems = useMemo(
        () => qbdConfig?.nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
        [qbdConfig?.nonReimbursableExpensesExportDestination],
    );
    const menuItems = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER.getRoute(policyID)), // TODO: should be updated to use new routes
            title: qbdConfig?.export?.exporter ?? policyOwner,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.EXPORT],
        },
        {
            description: translate('workspace.qbo.date'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.getRoute(policyID)), // TODO: should be updated to use new routes
            title: qbdConfig?.exportDate ? translate(`workspace.qbo.exportDate.values.${qbdConfig?.exportDate}.label`) : undefined,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.EXPORT_DATE],
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)),
            title: qbdConfig?.reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qbdConfig?.reimbursableExpensesExportDestination}`) : undefined, // TODO: should be updated to use new routes
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT],
        },
        {
            description: translate('workspace.qbo.exportInvoices'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.getRoute(policyID)), // TODO: should be updated to use new routes
            title: qbdConfig?.receivableAccount?.name,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT],
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)), // TODO: should be updated to use new routes
            brickRoadIndicator: qbdConfig?.errorFields?.exportCompanyCard ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: qbdConfig?.nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qbdConfig?.nonReimbursableExpensesExportDestination}`) : undefined,
            subscribedSettings: [
                CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT,
                ...(shouldShowVendorMenuItems ? [CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR] : []),
                ...(shouldShowVendorMenuItems && qbdConfig?.autoCreateVendor ? [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] : []),
            ],
        },
        {
            description: translate('workspace.qbo.exportExpensifyCard'),
            title: translate('workspace.qbo.accounts.credit_card'),
            shouldShowRightIcon: false,
            interactive: false,
        },
    ];

    return (
        <ConnectionLayout
            displayName={QuickbooksDesktopExportPage.displayName}
            headerTitle="workspace.accounting.export"
            title="workspace.qbd.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: remove it once the QBD beta is done
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO} // TODO: should be updated to use the new connection
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID))}
        >
            {menuItems.map((menuItem) => (
                <OfflineWithFeedback
                    key={menuItem.description}
                    pendingAction={PolicyUtils.settingsPendingAction(menuItem?.subscribedSettings, qbdConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={menuItem.title}
                        interactive={menuItem?.interactive ?? true}
                        description={menuItem.description}
                        shouldShowRightIcon={menuItem?.shouldShowRightIcon ?? true}
                        onPress={menuItem?.onPress}
                        brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(menuItem?.subscribedSettings, errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}
            <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb5, styles.mt2]}>
                <Text style={[styles.mutedNormalTextLabel]}>{translate('workspace.qbo.deepDiveExpensifyCard')}</Text>
                <TextLink
                    onPress={() => Link.openExternalLink(CONST.DEEP_DIVE_EXPENSIFY_CARD)}
                    style={[styles.mutedNormalTextLabel, styles.link]}
                >
                    {` ${translate('workspace.qbo.deepDiveExpensifyCardIntegration')}`}
                </TextLink>
            </Text>
        </ConnectionLayout>
    );
}

QuickbooksDesktopExportPage.displayName = 'QuickbooksDesktopExportPage';

export default withPolicyConnections(QuickbooksDesktopExportPage);
