import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={QuickbooksChartOfAccountsPage.displayName}
            headerTitle="workspace.accounting.accounts"
            title="workspace.qbo.accountsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID))}
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
            <Text style={styles.pv5}>{translate('workspace.qbo.accountsSwitchTitle')}</Text>
            <ToggleSettingOptionRow
                title={translate('workspace.common.enabled')}
                subtitle={translate('workspace.qbo.accountsSwitchDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                isActive={!!qboConfig?.enableNewCategories}
                onToggle={() => QuickbooksOnline.updateQuickbooksOnlineEnableNewCategories(policyID, !qboConfig?.enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES], qboConfig?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
        </ConnectionLayout>
    );
}

QuickbooksChartOfAccountsPage.displayName = 'QuickbooksChartOfAccountsPage';

export default withPolicyConnections(QuickbooksChartOfAccountsPage);
