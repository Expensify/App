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
import {NSQSAccount} from '@src/types/onyx/Policy';

function NSQSApprovalAccountPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const approvalAccount = nsqsConfig?.approvalAccount ?? '';
    const nsqsData = policy?.connections?.nsqs?.data;
    const payableList: NSQSAccount[] = useMemo(() => nsqsData?.payableList ?? [], [nsqsData?.payableList]);

    const defaultApprovalAccount: NSQSAccount = useMemo(
        () => ({
            id: '',
            name: translate(`workspace.nsqs.advanced.defaultApprovalAccount`),
            type: CONST.NSQS_ACCOUNT_TYPE.ACCOUNTS_PAYABLE,
        }),
        [translate],
    );
    const otherApprovalAccounts: NSQSAccount[] = useMemo(() => payableList.filter((account) => account.type === CONST.NSQS_ACCOUNT_TYPE.ACCOUNTS_PAYABLE), [payableList]);

    const sectionData: SelectorType[] = [defaultApprovalAccount, ...otherApprovalAccounts].map((option) => ({
        keyForList: option.id,
        text: option.name,
        isSelected: option.id === approvalAccount,
        value: option.id,
    }));

    const updateApprovalAccount = useCallback(
        ({value}: SelectorType) => {
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
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_ADVANCED.getRoute(policyID))}
            title="workspace.nsqs.advanced.approvalAccount"
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.APPROVAL_ACCOUNT], nsqsConfig?.pendingFields)}
            errors={getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.APPROVAL_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.APPROVAL_ACCOUNT)}
        />
    );
}

NSQSApprovalAccountPage.displayName = 'NSQSApprovalAccountPage';

export default withPolicyConnections(NSQSApprovalAccountPage);
