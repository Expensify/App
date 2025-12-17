import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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

function QuickbooksDesktopExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner ?? '';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const errorFields = qbdConfig?.errorFields;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT>>();
    const backTo = route?.params?.backTo;

    const shouldShowVendorMenuItems = useMemo(
        () => qbdConfig?.export?.nonReimbursable === CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
        [qbdConfig?.export?.nonReimbursable],
    );

    const shouldGoBackToSpecificRoute = useMemo(
        () => qbdConfig?.export?.nonReimbursable === CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK || shouldShowVendorMenuItems,
        [qbdConfig?.export?.nonReimbursable, shouldShowVendorMenuItems],
    );

    const goBack = useCallback(() => {
        return goBackFromExportConnection(shouldGoBackToSpecificRoute, backTo);
    }, [backTo, shouldGoBackToSpecificRoute]);

    const menuItems = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER.getRoute(policyID, Navigation.getActiveRoute())),
            // We use the logical OR (||) here instead of ?? because `exporter` could be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            title: qbdConfig?.export?.exporter || policyOwner,
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER],
        },
        {
            description: translate('workspace.qbd.date'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT.getRoute(policyID, Navigation.getActiveRoute())),
            title: qbdConfig?.export?.exportDate ? translate(`workspace.qbd.exportDate.values.${qbdConfig?.export.exportDate}.label`) : undefined,
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE],
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID, Navigation.getActiveRoute())),
            title: qbdConfig?.export.reimbursable ? translate(`workspace.qbd.accounts.${qbdConfig?.export.reimbursable}`) : undefined,
            subscribedSettings: [
                CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE,
                CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT,
                CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED,
            ],
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID, Navigation.getActiveRoute())),
            brickRoadIndicator: qbdConfig?.errorFields?.exportCompanyCard ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: qbdConfig?.export?.nonReimbursable ? translate(`workspace.qbd.accounts.${qbdConfig?.export?.nonReimbursable}`) : undefined,
            subscribedSettings: [
                CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE,
                CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                ...(shouldShowVendorMenuItems ? [CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR] : []),
                ...(shouldShowVendorMenuItems && qbdConfig?.shouldAutoCreateVendor ? [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] : []),
            ],
        },
        {
            description: translate('workspace.qbd.exportExpensifyCard'),
            title: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}`),
            shouldShowRightIcon: false,
            interactive: false,
        },
    ];

    return (
        <ConnectionLayout
            displayName="QuickbooksDesktopExportPage"
            headerTitle="workspace.accounting.export"
            title="workspace.qbd.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={goBack}
        >
            {menuItems.map((menuItem) => (
                <OfflineWithFeedback
                    key={menuItem.description}
                    pendingAction={settingsPendingAction(menuItem?.subscribedSettings, qbdConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={menuItem.title}
                        interactive={menuItem?.interactive ?? true}
                        description={menuItem.description}
                        shouldShowRightIcon={menuItem?.shouldShowRightIcon ?? true}
                        onPress={menuItem?.onPress}
                        brickRoadIndicator={areSettingsInErrorFields(menuItem?.subscribedSettings, errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}
            <View style={[styles.renderHTML, styles.ph5, styles.pb5, styles.mt2]}>
                <RenderHTML html={translate('workspace.common.deepDiveExpensifyCard')} />
            </View>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksDesktopExportPage);
