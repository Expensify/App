import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen, {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteQuickStartApprovalAccount, updateNetSuiteQuickStartExporter} from '@libs/actions/connections/NetSuiteQuickStart';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteQuickStartApprovalAccountPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const approvalAccount = nsqsConfig?.approvalAccount ?? '';

    // s77rt: need list of approval accounts
    const sectionData: SelectorType[] = ['', 's77rt@s77rt.com'].map((option) => ({
        keyForList: option,
        text: option || translate(`workspace.nsqs.advanced.defaultApprovalAccount`),
        isSelected: option === approvalAccount,
        value: option,
    }));

    const updateApprovalAccount = useCallback(
        ({value}: SelectorType) => {
            if (value !== approvalAccount) {
                updateNetSuiteQuickStartApprovalAccount(policyID, value, approvalAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_ADVANCED.getRoute(policyID));
        },
        [policyID, approvalAccount],
    );

    const headerContent = useMemo(() => <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.nsqs.advanced.approvalAccountDescription')}</Text>, [translate, styles.pb5, styles.ph5]);

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteQuickStartApprovalAccountPage.displayName}
            headerContent={headerContent}
            sections={[{data: sectionData}]}
            listItem={RadioListItem}
            listItemWrapperStyle={styles.mnh13}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={updateApprovalAccount}
            initiallyFocusedOptionKey={sectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_ADVANCED.getRoute(policyID))}
            title={`workspace.nsqs.advanced.approvalAccount`}
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.APPROVAL_ACCOUNT], nsqsConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.APPROVAL_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.APPROVAL_ACCOUNT)}
        />
    );
}

NetSuiteQuickStartApprovalAccountPage.displayName = 'NetSuiteQuickStartApprovalAccountPage';

export default withPolicyConnections(NetSuiteQuickStartApprovalAccountPage);
