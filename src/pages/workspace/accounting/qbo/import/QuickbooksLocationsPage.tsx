import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksLocationsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const isSwitchOn = !!(qboConfig?.syncLocations && qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const canImportLocation =
        qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY &&
        qboConfig?.nonReimbursableExpensesExportDestination !== CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
    const shouldBeDisabled = !canImportLocation && !isSwitchOn;
    const isReportFieldsSelected = qboConfig?.syncLocations === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;

    return (
        <ConnectionLayout
            displayName={QuickbooksLocationsPage.displayName}
            headerTitle="workspace.qbo.locations"
            title="workspace.qbo.locationsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[[styles.pb2, styles.ph5]]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID))}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.qbo.locations')}
                isActive={isSwitchOn}
                disabled={shouldBeDisabled}
                onToggle={() =>
                    QuickbooksOnline.updateQuickbooksOnlineSyncLocations(
                        policyID,
                        isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                        qboConfig?.syncLocations,
                    )
                }
                errors={ErrorUtils.getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
                pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.pendingFields)}
            />
            {isSwitchOn && (
                <MenuItemWithTopDescription
                    interactive={false}
                    title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                    description={translate('workspace.common.displayedAs')}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                />
            )}
            {shouldBeDisabled && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt3]}>
                    <Text style={styles.mutedTextLabel}>{translate('workspace.qbo.locationsAdditionalDescription')}</Text>
                </View>
            )}
        </ConnectionLayout>
    );
}

QuickbooksLocationsPage.displayName = 'QuickbooksLocationsPage';

export default withPolicyConnections(QuickbooksLocationsPage);
