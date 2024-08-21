import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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

type WorkspaceWorkflowsApprovalsEditPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT>;

function WorkspaceWorkflowsApprovalsEditPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [initialApprovalWorkflow, setInitialApprovalWorkflow] = useState<ApprovalWorkflow | undefined>();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const formRef = useRef<ScrollView>(null);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy) || !approvalWorkflow;

    const updateApprovalWorkflow = useCallback(() => {
        if (!approvalWorkflow || !initialApprovalWorkflow) {
            return;
        }

        if (!Workflow.validateApprovalWorkflow(approvalWorkflow)) {
            return;
        }

        const membersToRemove = initialApprovalWorkflow.members.filter((initialMember) => !approvalWorkflow.members.some((member) => member.email === initialMember.email));
        Workflow.updateApprovalWorkflow(route.params.policyID, approvalWorkflow, membersToRemove);
        Navigation.goBack();
    }, [approvalWorkflow, initialApprovalWorkflow, route.params.policyID]);

    const removeApprovalWorkflow = useCallback(() => {
        if (!initialApprovalWorkflow) {
            return;
        }

        // Remove the approval workflow using the initial data as it could be already edited
        Workflow.removeApprovalWorkflow(route.params.policyID, initialApprovalWorkflow);
        Navigation.goBack();
    }, [initialApprovalWorkflow, route.params.policyID]);

    // Set the initial approval workflow when the page is loaded
    useEffect(() => {
        if (!!initialApprovalWorkflow || !policy || !personalDetails) {
            return;
        }

        const defaultApprover = policy?.approver ?? policy.owner;
        const workflows = convertPolicyEmployeesToApprovalWorkflows({
            employees: policy.employeeList ?? {},
            defaultApprover,
            personalDetails,
        });
        const currentApprovalWorkflow = workflows.find((workflow) => workflow.approvers.at(0)?.email === route.params.firstApproverEmail);

        if (!currentApprovalWorkflow) {
            return Workflow.clearApprovalWorkflow();
        }

        Workflow.setApprovalWorkflow({
            ...currentApprovalWorkflow,
            availableMembers: [...currentApprovalWorkflow.members, ...(workflows.at(0)?.members ?? [])],
            action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
            isLoading: false,
            errors: null,
        });
        setInitialApprovalWorkflow(currentApprovalWorkflow);
    }, [initialApprovalWorkflow, personalDetails, policy, route.params.firstApproverEmail, route.params.policyID]);

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
