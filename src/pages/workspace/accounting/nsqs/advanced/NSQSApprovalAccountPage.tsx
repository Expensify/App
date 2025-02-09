import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNSQSApprovalAccount} from '@libs/actions/connections/NSQS';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNSQSErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {NSQSPayableAccount} from '@src/types/onyx/Policy';

function NSQSApprovalAccountPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const nsqsConfig = policy?.connections?.netsuiteQuickStart?.config;
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

    const sectionData: SelectorType[] = [defaultApprovalAccount, ...payableAccounts].map((option) => ({
        keyForList: option.id,
        text: option.displayName,
        isSelected: option.id === approvalAccount,
        value: option.id,
    }));

    const updateApprovalAccount = useCallback(
        ({value}: SelectorType) => {
            if (!policyID) {
                return;
            }

            if (value !== approvalAccount) {
                updateNSQSApprovalAccount(policyID, value, approvalAccount);
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
            displayName={NSQSApprovalAccountPage.displayName}
            headerContent={headerContent}
            sections={[{data: sectionData}]}
            listItem={RadioListItem}
            listItemWrapperStyle={styles.mnh13}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={updateApprovalAccount}
            initiallyFocusedOptionKey={sectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={policyID ? () => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_ADVANCED.getRoute(policyID)) : undefined}
            title="workspace.nsqs.advanced.approvalAccount"
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.APPROVAL_ACCOUNT], nsqsConfig?.pendingFields)}
            errors={getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.APPROVAL_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={policyID ? () => clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.APPROVAL_ACCOUNT) : undefined}
        />
    );
}

NSQSApprovalAccountPage.displayName = 'NSQSApprovalAccountPage';

export default withPolicyConnections(NSQSApprovalAccountPage);
