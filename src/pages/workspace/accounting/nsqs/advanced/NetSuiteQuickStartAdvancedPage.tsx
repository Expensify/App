import noop from 'lodash/noop';
import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteQuickStartAdvancedPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config; // s77rt
    const s77rt1 = ''; // s77rt
    const s77rt2 = s77rt1 || translate(`workspace.nsqs.advanced.defaultApprovalAccount`);

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
                    isActive // s77rt
                    onToggle={noop} // s77rt
                    shouldPlaceSubtitleBelowSwitch
                />
                <MenuItemWithTopDescription
                    title={s77rt2}
                    description={translate(`workspace.nsqs.advanced.approvalAccount`)}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_ADVANCED_APPROVAL_ACCOUNT.getRoute(policyID))}
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteQuickStartAdvancedPage.displayName = 'NetSuiteQuickStartAdvancedPage';

export default withPolicyConnections(NetSuiteQuickStartAdvancedPage);
