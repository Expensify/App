import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import goBackFromExportConnection from '@navigation/helpers/goBackFromExportConnection';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function QuickbooksExportConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT>>();
    const backTo = route?.params?.backTo;
    const policyID = policy?.id;
    const policyOwner = policy?.owner ?? '';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const errorFields = qboConfig?.errorFields;

    const shouldShowVendorMenuItems = useMemo(
        () => qboConfig?.nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
        [qboConfig?.nonReimbursableExpensesExportDestination],
    );

    const goBack = useCallback(() => {
        return goBackFromExportConnection(shouldShowVendorMenuItems, backTo);
    }, [backTo, shouldShowVendorMenuItems]);

    const menuItems = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: !policyID ? undefined : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER.getRoute(policyID, Navigation.getActiveRoute())),
            title: qboConfig?.export?.exporter ?? policyOwner,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.EXPORT],
        },
        {
            description: translate('workspace.qbo.date'),
            onPress: !policyID ? undefined : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.getRoute(policyID, Navigation.getActiveRoute())),
            title: qboConfig?.exportDate ? translate(`workspace.qbo.exportDate.values.${qboConfig?.exportDate}.label`) : undefined,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.EXPORT_DATE],
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: !policyID
                ? undefined
                : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID, Navigation.getActiveRoute())),
            title: qboConfig?.reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qboConfig?.reimbursableExpensesExportDestination}`) : undefined,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT],
        },
        {
            description: translate('workspace.qbo.exportInvoices'),
            onPress: !policyID ? undefined : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.getRoute(policyID, Navigation.getActiveRoute())),
            title: qboConfig?.receivableAccount?.name,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT],
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: !policyID
                ? undefined
                : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID, Navigation.getActiveRoute())),
            brickRoadIndicator: qboConfig?.errorFields?.exportCompanyCard ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: qboConfig?.nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qboConfig?.nonReimbursableExpensesExportDestination}`) : undefined,
            subscribedSettings: [
                CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT,
                ...(shouldShowVendorMenuItems ? [CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR] : []),
                ...(shouldShowVendorMenuItems && qboConfig?.autoCreateVendor ? [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] : []),
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
            displayName="QuickbooksExportConfigurationPage"
            headerTitle="workspace.accounting.export"
            title="workspace.qbo.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            onBackButtonPress={goBack}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
        >
            {menuItems.map((menuItem) => (
                <OfflineWithFeedback
                    key={menuItem.description}
                    pendingAction={settingsPendingAction(menuItem?.subscribedSettings, qboConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={menuItem.title}
                        interactive={menuItem?.interactive ?? true}
                        description={menuItem.description}
                        shouldShowRightIcon={menuItem?.shouldShowRightIcon ?? true}
                        onPress={menuItem?.onPress}
                        brickRoadIndicator={
                            areSettingsInErrorFields(menuItem?.subscribedSettings, errorFields) ||
                            (menuItem.subscribedSettings?.some((setting) => setting === CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION) &&
                                shouldShowQBOReimbursableExportDestinationAccountError(policy))
                                ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                : undefined
                        }
                    />
                </OfflineWithFeedback>
            ))}
            <View style={[styles.renderHTML, styles.ph5, styles.pb5, styles.mt2]}>
                <RenderHTML html={translate('workspace.common.deepDiveExpensifyCard')} />
            </View>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksExportConfigurationPage);
