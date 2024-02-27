import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy, {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

type WorkspaceWorkflowsApproverPageProps = WithPolicyOnyxProps;

function WorkspaceWorkflowsApproverPage({policy, policyMembers}: WorkspaceWorkflowsApproverPageProps) {
    const {translate} = useLocalize();
    const policyName = policy?.name ?? '';
    console.log(policy, policyMembers);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceWorkflowsApproverPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workflowsPage.approver')}
                subtitle={policyName}
                onBackButtonPress={Navigation.goBack}
            />
        </ScreenWrapper>
    );
}

WorkspaceWorkflowsApproverPage.displayName = 'WorkspaceWorkflowsApproverPage';

export default withPolicy(WorkspaceWorkflowsApproverPage);
