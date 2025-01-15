import React, {useCallback} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteQuickStartAutoSync} from '@libs/actions/connections/NetSuiteQuickStart';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteQuickStartAdvancedPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const isAutoSyncEnabled = nsqsConfig?.autoSync.enabled ?? false;
    const approvalAccount = nsqsConfig?.approvalAccount ?? '';

    const toggleAutoSync = useCallback(() => {
        updateNetSuiteQuickStartAutoSync(policyID, !isAutoSyncEnabled);
    }, [policyID, isAutoSyncEnabled]);

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NetSuiteQuickStartAdvancedPage.displayName}
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5, styles.gap6]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
        >
            <View>
                <ToggleSettingOptionRow
                    title={translate('workspace.accounting.autoSync')}
                    switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                    subtitle={translate('workspace.nsqs.advanced.autoSyncDescription')}
                    shouldPlaceSubtitleBelowSwitch
                    isActive={isAutoSyncEnabled}
                    onToggle={toggleAutoSync}
                    pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.AUTO_SYNC], nsqsConfig?.pendingFields)}
                    errors={ErrorUtils.getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.AUTO_SYNC)}
                    onCloseError={() => Policy.clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.AUTO_SYNC)}
                />
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.APPROVAL_ACCOUNT], nsqsConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={approvalAccount || translate(`workspace.nsqs.advanced.defaultApprovalAccount`)}
                        description={translate(`workspace.nsqs.advanced.approvalAccount`)}
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_ADVANCED_APPROVAL_ACCOUNT.getRoute(policyID))}
                        brickRoadIndicator={areSettingsInErrorFields([CONST.NSQS_CONFIG.APPROVAL_ACCOUNT], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            </View>
        </ConnectionLayout>
    );
}

NetSuiteQuickStartAdvancedPage.displayName = 'NetSuiteQuickStartAdvancedPage';

export default withPolicyConnections(NetSuiteQuickStartAdvancedPage);
