import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksDesktopItemsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {canUseNewDotQBD} = usePermissions();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;

    return (
        <ConnectionLayout
            displayName={QuickbooksDesktopItemsPage.displayName}
            headerTitle="workspace.qbd.items"
            title="workspace.qbd.classesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] Will be removed when release
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.getRoute(policyID))}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.qbd.items')}
                isActive={!!qbdConfig?.importItems}
                onToggle={(isEnabled) => QuickbooksDesktop.updateQuickbooksDesktopSyncItems(policyID, isEnabled, !!qbdConfig?.importItems)}
                pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS], qbdConfig?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS)}
                onCloseError={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS)}
            />
        </ConnectionLayout>
    );
}

QuickbooksDesktopItemsPage.displayName = 'QuickbooksDesktopItemsPage';

export default withPolicyConnections(QuickbooksDesktopItemsPage);
