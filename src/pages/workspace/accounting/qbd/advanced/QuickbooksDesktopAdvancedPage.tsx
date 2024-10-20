import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksDesktopAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {canUseNewDotQBD} = usePermissions();

    const qbdToggleSettingItems = [
        {
            title: translate('workspace.accounting.autoSync'),
            subtitle: translate('workspace.qbd.advancedConfig.autoSyncDescription'),
            switchAccessibilityLabel: translate('workspace.qbd.advancedConfig.autoSyncDescription'),
            isActive: !!qbdConfig?.autoSync?.enabled,
            onToggle: (isOn: boolean) => QuickbooksDesktop.updateQuickbooksDesktopAutoSync(policyID, isOn),
            subscribedSetting: CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC,
            errors: ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC),
            pendingAction: settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC], qbdConfig?.pendingFields),
        },
        {
            title: translate('workspace.qbd.advancedConfig.createEntities'),
            subtitle: translate('workspace.qbd.advancedConfig.createEntitiesDescription'),
            switchAccessibilityLabel: translate('workspace.qbd.advancedConfig.createEntitiesDescription'),
            isActive: !!qbdConfig?.shouldAutoCreateVendor,
            onToggle: (isOn: boolean) => {
                QuickbooksDesktop.updateQuickbooksDesktopShouldAutoCreateVendor(policyID, isOn);
            },
            subscribedSetting: CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR,
            errors: ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR),
            pendingAction: settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR], qbdConfig?.pendingFields),
        },
    ];

    return (
        <ConnectionLayout
            displayName={QuickbooksDesktopAdvancedPage.displayName}
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID))}
        >
            {qbdToggleSettingItems.map((item) => (
                <ToggleSettingOptionRow
                    key={item.title}
                    title={item.title}
                    subtitle={item.subtitle}
                    switchAccessibilityLabel={item.switchAccessibilityLabel}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={styles.mv3}
                    isActive={item.isActive}
                    onToggle={item.onToggle}
                    pendingAction={item.pendingAction}
                    errors={item.errors}
                    onCloseError={() => clearQBDErrorField(policyID, item.subscribedSetting)}
                />
            ))}
        </ConnectionLayout>
    );
}

QuickbooksDesktopAdvancedPage.displayName = 'QuickbooksDesktopAdvancedPage';

export default withPolicyConnections(QuickbooksDesktopAdvancedPage);
