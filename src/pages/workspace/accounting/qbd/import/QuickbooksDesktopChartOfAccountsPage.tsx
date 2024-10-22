import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksDesktopChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {canUseNewDotQBD} = usePermissions();
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={QuickbooksDesktopChartOfAccountsPage.displayName}
            headerTitle="workspace.accounting.accounts"
            title="workspace.qbd.accountsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] Will be removed when release
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.getRoute(policyID))}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                isActive
                onToggle={() => {}}
                disabled
                showLockIcon
            />
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.common.categories')}
                description={translate('workspace.common.displayedAs')}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt2]}
            />
            <Text style={styles.pv5}>{translate('workspace.qbd.accountsSwitchTitle')}</Text>
            <ToggleSettingOptionRow
                title={translate('workspace.common.enabled')}
                subtitle={translate('workspace.qbd.accountsSwitchDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                isActive={!!qbdConfig?.enableNewCategories}
                onToggle={() => QuickbooksDesktop.updateQuickbooksDesktopEnableNewCategories(policyID, !qbdConfig?.enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES], qbdConfig?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
        </ConnectionLayout>
    );
}

QuickbooksDesktopChartOfAccountsPage.displayName = 'QuickbooksDesktopChartOfAccountsPage';

export default withPolicyConnections(QuickbooksDesktopChartOfAccountsPage);
