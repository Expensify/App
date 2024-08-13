import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
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

type WorkspaceWorkflowsApprovalsEditPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT>;

function WorkspaceWorkflowsApprovalsEditPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const formRef = useRef<ScrollView>(null);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy);

    const updateApprovalWorkflow = useCallback(() => {
        if (!approvalWorkflow) {
            return;
        }

        if (!isEmptyObject(Workflow.validateApprovalWorkflow(approvalWorkflow))) {
            return;
        }

        // Workflow.updateApprovalWorkflow(route.params.policyID, {...approvalWorkflow, approvers: approvalWorkflow.approvers as Approver[]});
        Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
    }, [approvalWorkflow, route.params.policyID]);

    const removeApprovalWorkflow = useCallback(() => {
        if (!approvalWorkflow) {
            return;
        }

        Workflow.removeApprovalWorkflow(route.params.policyID, {...approvalWorkflow, approvers: approvalWorkflow.approvers as Approver[]});
        Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
    }, [approvalWorkflow, route.params.policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApprovalsEditPage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsEditApprovalsPage.title')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {approvalWorkflowMetadata.status === 'loading' && <FullScreenLoadingIndicator />}
                    {approvalWorkflow && (
                        <ApprovalWorkflowEditor
                            approvalWorkflow={approvalWorkflow}
                            removeApprovalWorkflow={() => setIsDeleteModalVisible(true)}
                            policy={policy}
                            policyID={route.params.policyID}
                            ref={formRef}
                        />
                    )}

                    <FormAlertWithSubmitButton
                        isAlertVisible={!isEmptyObject(approvalWorkflow?.errors)}
                        onSubmit={updateApprovalWorkflow}
                        onFixTheErrorsLinkPressed={() => {
                            formRef.current?.scrollTo({y: 0, animated: true});
                        }}
                        isLoading={approvalWorkflow?.isLoading}
                        buttonText={translate('common.save')}
                        containerStyles={[styles.mb5, styles.mh5]}
                    />
                </FullPageNotFoundView>
                <ConfirmModal
                    title={translate('workflowsEditApprovalsPage.deleteTitle')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={removeApprovalWorkflow}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    prompt={translate('workflowsEditApprovalsPage.deletePrompt')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsEditPage.displayName = 'WorkspaceWorkflowsApprovalsEditPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsEditPage);
