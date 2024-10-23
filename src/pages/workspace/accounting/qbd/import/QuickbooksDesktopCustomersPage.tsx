import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
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

function QuickbooksDesktopCustomersPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {canUseNewDotQBD} = usePermissions();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const isSwitchOn = !!(qbdConfig?.mappings?.customers && qbdConfig.mappings.customers !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isReportFieldsSelected = qbdConfig?.mappings?.customers === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;

    return (
        <ConnectionLayout
            displayName={QuickbooksDesktopCustomersPage.displayName}
            headerTitle="workspace.qbd.customers"
            title="workspace.qbd.customersDescription"
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
                switchAccessibilityLabel={translate('workspace.qbd.customers')}
                isActive={isSwitchOn}
                onToggle={() =>
                    QuickbooksDesktop.updateQuickbooksDesktopSyncCustomers(
                        policyID,
                        isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                        qbdConfig?.mappings?.classes,
                    )
                }
                pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS], qbdConfig?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS)}
                onCloseError={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS)}
            />
            {isSwitchOn && (
                <OfflineWithFeedback pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS], qbdConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                        description={translate('workspace.common.displayedAs')}
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS.getRoute(policyID))}
                        brickRoadIndicator={
                            PolicyUtils.areSettingsInErrorFields([CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS], qbdConfig?.errorFields)
                                ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                : undefined
                        }
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

QuickbooksDesktopCustomersPage.displayName = 'QuickbooksDesktopCustomersPage';

export default withPolicyConnections(QuickbooksDesktopCustomersPage);
