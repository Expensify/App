import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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

function QuickbooksClassesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const isSwitchOn = !!(qboConfig?.syncClasses && qboConfig.syncClasses !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isReportFieldsSelected = qboConfig?.syncClasses === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;

    return (
        <ConnectionLayout
            displayName={QuickbooksClassesPage.displayName}
            headerTitle="workspace.qbo.classes"
            title="workspace.qbo.classesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID))}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.qbo.classes')}
                isActive={isSwitchOn}
                onToggle={() =>
                    QuickbooksOnline.updateQuickbooksOnlineSyncClasses(
                        policyID,
                        isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                        qboConfig?.syncClasses,
                    )
                }
                pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES], qboConfig?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES)}
            />
            {isSwitchOn && (
                <MenuItemWithTopDescription
                    interactive={false}
                    title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                    description={translate('workspace.common.displayedAs')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]}
                />
            )}
        </ConnectionLayout>
    );
}

QuickbooksClassesPage.displayName = 'QuickbooksClassesPage';

export default withPolicyConnections(QuickbooksClassesPage);
