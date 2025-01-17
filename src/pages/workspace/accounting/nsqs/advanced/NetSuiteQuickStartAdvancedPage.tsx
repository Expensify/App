import React, {useCallback, useMemo} from 'react';
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
import {NSQSAccount} from '@src/types/onyx/Policy';

function NetSuiteQuickStartAdvancedPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const isAutoSyncEnabled = nsqsConfig?.autoSync.enabled ?? false;
    const approvalAccount = nsqsConfig?.approvalAccount ?? '';
    const nsqsData = policy?.connections?.nsqs?.data;
    const payableList = nsqsData?.payableList ?? [];

    const defaultApprovalAccount: NSQSAccount = useMemo(
        () => ({
            id: '',
            name: translate(`workspace.nsqs.advanced.defaultApprovalAccount`),
            type: CONST.NSQS_ACCOUNT_TYPE.ACCOUNTS_PAYABLE,
        }),
        [translate],
    );
    const otherApprovalAccounts: NSQSAccount[] = useMemo(() => payableList.filter((account) => account.type === CONST.NSQS_ACCOUNT_TYPE.ACCOUNTS_PAYABLE), [payableList]);
    const selectedApprovalAccount = [defaultApprovalAccount, ...otherApprovalAccounts].find((account) => account.id === approvalAccount);

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
                        title={selectedApprovalAccount?.name}
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
