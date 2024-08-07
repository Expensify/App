import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Workflow from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ApprovalWorkflowEditor from './ApprovalWorkflowEditor';

type WorkspaceWorkflowsApprovalsCreatePageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW>;

function WorkspaceWorkflowsApprovalsCreatePage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsCreatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy);
    const isSubmitDisabled =
        approvalWorkflow?.approvers.length === 0 || approvalWorkflow?.members.length === 0 || approvalWorkflow?.approvers.some((approver) => !approver || approver.isCircularReference);

    const createApprovalWorkflow = useCallback(() => {
        if (!approvalWorkflow) {
            return;
        }

        Workflow.createApprovalWorkflow(route.params.policyID, {...approvalWorkflow, approvers: approvalWorkflow.approvers as Approver[]});
        Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
    }, [approvalWorkflow, route.params.policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApprovalsCreatePage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsCreateApprovalsPage.title')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {approvalWorkflowMetadata.status === 'loading' && <FullScreenLoadingIndicator />}
                    {approvalWorkflow && (
                        <ApprovalWorkflowEditor
                            approvalWorkflow={approvalWorkflow}
                            policyID={route.params.policyID}
                        />
                    )}

                    <Button
                        success
                        style={[styles.mb5, styles.mh5]}
                        onPress={createApprovalWorkflow}
                        pressOnEnter
                        large
                        text={translate('workflowsCreateApprovalsPage.submitButton')}
                        isLoading={approvalWorkflow?.isLoading}
                        isDisabled={isSubmitDisabled}
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsCreatePage.displayName = 'WorkspaceWorkflowsApprovalsCreatePage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsCreatePage);
