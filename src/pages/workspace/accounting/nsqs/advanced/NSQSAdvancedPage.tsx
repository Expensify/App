import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNSQSAutoSync} from '@libs/actions/connections/NSQS';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearNSQSErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {NSQSPayableAccount} from '@src/types/onyx/Policy';

function NSQSAdvancedPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const nsqsConfig = policy?.connections?.netsuiteQuickStart?.config;
    const isAutoSyncEnabled = nsqsConfig?.autoSync?.enabled ?? false;
    const approvalAccount = nsqsConfig?.approvalAccount ?? '';
    const nsqsData = policy?.connections?.netsuiteQuickStart?.data;
    const payableAccounts: NSQSPayableAccount[] = useMemo(() => nsqsData?.payableAccounts ?? [], [nsqsData?.payableAccounts]);

    const defaultApprovalAccount: NSQSPayableAccount = useMemo(
        () => ({
            id: '',
            name: translate(`workspace.nsqs.advanced.defaultApprovalAccount`),
            displayName: translate(`workspace.nsqs.advanced.defaultApprovalAccount`),
            number: '',
            type: '',
        }),
        [translate],
    );
    const selectedApprovalAccount = [defaultApprovalAccount, ...payableAccounts].find((account) => account.id === approvalAccount);

    const toggleAutoSync = useCallback(() => {
        if (!policyID) {
            return;
        }

        updateNSQSAutoSync(policyID, !isAutoSyncEnabled);
    }, [policyID, isAutoSyncEnabled]);

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NSQSAdvancedPage.displayName}
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
                    errors={getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.AUTO_SYNC)}
                    onCloseError={policyID ? () => clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.AUTO_SYNC) : undefined}
                />
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.APPROVAL_ACCOUNT], nsqsConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={selectedApprovalAccount?.displayName}
                        description={translate(`workspace.nsqs.advanced.approvalAccount`)}
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                        shouldShowRightIcon
                        onPress={policyID ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_ADVANCED_APPROVAL_ACCOUNT.getRoute(policyID)) : undefined}
                        brickRoadIndicator={areSettingsInErrorFields([CONST.NSQS_CONFIG.APPROVAL_ACCOUNT], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            </View>
        </ConnectionLayout>
    );
}

NSQSAdvancedPage.displayName = 'NSQSAdvancedPage';

export default withPolicyConnections(NSQSAdvancedPage);
