import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {InteractionManager} from 'react-native';
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
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import {convertPolicyEmployeesToApprovalWorkflows} from '@libs/WorkflowUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Workflow from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ApprovalWorkflowEditor from './ApprovalWorkflowEditor';

type WorkspaceWorkflowsApprovalsEditPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT>;

function WorkspaceWorkflowsApprovalsEditPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [initialApprovalWorkflow, setInitialApprovalWorkflow] = useState<ApprovalWorkflow | undefined>();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const formRef = useRef<ScrollView>(null);

    const updateApprovalWorkflow = useCallback(() => {
        if (!approvalWorkflow || !initialApprovalWorkflow) {
            return;
        }

        if (!Workflow.validateApprovalWorkflow(approvalWorkflow)) {
            return;
        }

        // We need to remove members and approvers that are no longer in the updated workflow
        const membersToRemove = initialApprovalWorkflow.members.filter((initialMember) => !approvalWorkflow.members.some((member) => member.email === initialMember.email));
        const approversToRemove = initialApprovalWorkflow.approvers.filter((initialApprover) => !approvalWorkflow.approvers.some((approver) => approver.email === initialApprover.email));
        Workflow.updateApprovalWorkflow(route.params.policyID, approvalWorkflow, membersToRemove, approversToRemove);
        Navigation.dismissModal();
    }, [approvalWorkflow, initialApprovalWorkflow, route.params.policyID]);

    const removeApprovalWorkflow = useCallback(() => {
        if (!initialApprovalWorkflow) {
            return;
        }

        setIsDeleteModalVisible(false);
        Navigation.dismissModal();
        InteractionManager.runAfterInteractions(() => {
            // Remove the approval workflow using the initial data as it could be already edited
            Workflow.removeApprovalWorkflow(route.params.policyID, initialApprovalWorkflow);
        });
    }, [initialApprovalWorkflow, route.params.policyID]);

    const {currentApprovalWorkflow, defaultWorkflowMembers, usedApproverEmails} = useMemo(() => {
        if (!policy || !personalDetails) {
            return {};
        }

        const defaultApprover = policy?.approver ?? policy.owner;
        const firstApprover = route.params.firstApproverEmail;
        const result = convertPolicyEmployeesToApprovalWorkflows({
            employees: policy.employeeList ?? {},
            defaultApprover,
            personalDetails,
            firstApprover,
        });

        return {
            defaultWorkflowMembers: result.availableMembers,
            usedApproverEmails: result.usedApproverEmails,
            currentApprovalWorkflow: result.approvalWorkflows.find((workflow) => workflow.approvers.at(0)?.email === firstApprover),
        };
    }, [personalDetails, policy, route.params.firstApproverEmail]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy) || !currentApprovalWorkflow;

    // Set the initial approval workflow when the page is loaded
    useEffect(() => {
        if (initialApprovalWorkflow) {
            return;
        }

        if (!currentApprovalWorkflow) {
            return Workflow.clearApprovalWorkflow();
        }

        Workflow.setApprovalWorkflow({
            ...currentApprovalWorkflow,
            availableMembers: [...currentApprovalWorkflow.members, ...defaultWorkflowMembers],
            usedApproverEmails,
            action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
            isLoading: false,
            errors: null,
        });
        setInitialApprovalWorkflow(currentApprovalWorkflow);
    }, [currentApprovalWorkflow, defaultWorkflowMembers, initialApprovalWorkflow, usedApproverEmails]);

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
                    {approvalWorkflow && (
                        <>
                            <ApprovalWorkflowEditor
                                approvalWorkflow={approvalWorkflow}
                                removeApprovalWorkflow={() => setIsDeleteModalVisible(true)}
                                policy={policy}
                                policyID={route.params.policyID}
                                ref={formRef}
                            />
                            <FormAlertWithSubmitButton
                                isAlertVisible={!isEmptyObject(approvalWorkflow?.errors)}
                                onSubmit={updateApprovalWorkflow}
                                onFixTheErrorsLinkPressed={() => {
                                    formRef.current?.scrollTo({y: 0, animated: true});
                                }}
                                isLoading={approvalWorkflow?.isLoading}
                                buttonText={translate('common.save')}
                                containerStyles={[styles.mb5, styles.mh5]}
                                enabledWhenOffline
                            />
                        </>
                    )}
                    {!initialApprovalWorkflow && <FullScreenLoadingIndicator />}
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
