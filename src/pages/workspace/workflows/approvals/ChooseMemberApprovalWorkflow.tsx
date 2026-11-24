/** Choose a shared destination when the rules engine has several workflows with the selected first approver. */
import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import Button from '@components/Button';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getApproverChainKey} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';

import React from 'react';

type ChooseMemberApprovalWorkflowProps = {
    policyID: string;
    firstApproverEmail: string;
    onSelect: (workflow?: ApprovalWorkflow) => void;
    onBack: () => void;
};

function ChooseMemberApprovalWorkflow({policyID, firstApproverEmail, onSelect, onBack}: ChooseMemberApprovalWorkflowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {approvalWorkflows} = useApprovalWorkflows(policy);
    const matches = approvalWorkflows.filter((workflow) => workflow.approvers.at(0)?.email === firstApproverEmail);
    return (
        <ScreenWrapper
            testID="ChooseMemberApprovalWorkflow"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Header>
                <Header.BackButton onPress={onBack} />
                <Header.Title title={translate('workflowsEditApprovalsPage.chooseWorkflow')} />
            </Header>
            <ScrollView contentContainerStyle={styles.ph5}>
                {matches.map((workflow) => (
                    <ApprovalWorkflowSection
                        key={`${getApproverChainKey(workflow.approvers)}-${workflow.isDefault}-${workflow.members.at(0)?.email}`}
                        approvalWorkflow={{...workflow, isDefault: false}}
                        currency={policy?.outputCurrency}
                        onPress={() => onSelect(workflow)}
                    />
                ))}
                <Button
                    onPress={() => onSelect()}
                    style={styles.mv6}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.MEMBER_WORKFLOW_CREATE}
                >
                    <Button.Text>{translate('workflowsEditApprovalsPage.createNewWorkflow')}</Button.Text>
                </Button>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default ChooseMemberApprovalWorkflow;
