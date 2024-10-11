import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksDesktopChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {canUseNewDotQBD} = usePermissions();

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
            {/* TODO: [QBD] Temporary hide this menu item until BE supports this option
                more details: https://github.com/Expensify/App/pull/50545#issuecomment-2406554260 */}
            {/* <Text style={styles.pv5}>{translate('workspace.qbd.accountsSwitchTitle')}</Text>
            <ToggleSettingOptionRow
                title={translate('workspace.common.enabled')}
                subtitle={translate('workspace.qbd.accountsSwitchDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                isActive
                onToggle={() => {}}
                disabled
                showLockIcon
            /> */}
        </ConnectionLayout>
    );
}

QuickbooksDesktopChartOfAccountsPage.displayName = 'QuickbooksDesktopChartOfAccountsPage';

export default withPolicyConnections(QuickbooksDesktopChartOfAccountsPage);
