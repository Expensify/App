import React, {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {InteractionManager} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {convertPolicyEmployeesToApprovalWorkflows} from '@libs/WorkflowUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearApprovalWorkflow, removeApprovalWorkflow, setApprovalWorkflow, updateApprovalWorkflow, validateApprovalWorkflow} from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ApprovalWorkflowEditor from './ApprovalWorkflowEditor';

type WorkspaceWorkflowsApprovalsEditPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT>;

function WorkspaceWorkflowsApprovalsEditPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsEditPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const [initialApprovalWorkflow, setInitialApprovalWorkflow] = useState<ApprovalWorkflow | undefined>();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const formRef = useRef<ScrollView>(null);
    const isDeleting = useRef(false);

    const updateApprovalWorkflowCallback = () => {
        if (!approvalWorkflow || !initialApprovalWorkflow) {
            return;
        }

        if (!validateApprovalWorkflow(approvalWorkflow)) {
            return;
        }

        // We need to remove members and approvers that are no longer in the updated workflow
        const membersToRemove = initialApprovalWorkflow.members.filter((initialMember) => !approvalWorkflow.members.some((member) => member.email === initialMember.email));
        const approversToRemove = initialApprovalWorkflow.approvers.filter((initialApprover) => !approvalWorkflow.approvers.some((approver) => approver.email === initialApprover.email));
        Navigation.dismissModal();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            updateApprovalWorkflow(approvalWorkflow, membersToRemove, approversToRemove, policy);
        });
    };

    const removeApprovalWorkflowCallback = () => {
        if (!initialApprovalWorkflow) {
            return;
        }

        // Mark as deleting to prevent the useEffect from clearing the workflow and causing a blink
        isDeleting.current = true;
        setIsDeleteModalVisible(false);
        Navigation.dismissModal();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            // Remove the approval workflow using the initial data as it could be already edited
            removeApprovalWorkflow(initialApprovalWorkflow, policy);
        });
    };

    const getApprovalWorkflowData = () => {
        if (!policy || !personalDetails) {
            return {};
        }

        const firstApprover = route.params.firstApproverEmail;
        const result = convertPolicyEmployeesToApprovalWorkflows({
            policy,
            personalDetails,
            firstApprover,
            localeCompare,
        });

        return {
            defaultWorkflowMembers: result.availableMembers,
            usedApproverEmails: result.usedApproverEmails,
            currentApprovalWorkflow: result.approvalWorkflows.find((workflow) => workflow.approvers.at(0)?.email === firstApprover),
        };
    };

    const {currentApprovalWorkflow, defaultWorkflowMembers, usedApproverEmails} = getApprovalWorkflowData();

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy) || !currentApprovalWorkflow;

    // Set the initial approval workflow when the page is loaded
    useEffect(() => {
        if (initialApprovalWorkflow) {
            return;
        }

        if (!currentApprovalWorkflow) {
            // Don't clear if we're in the middle of deleting - this prevents the UI from blinking
            if (isDeleting.current) {
                return;
            }
            return clearApprovalWorkflow();
        }

        setApprovalWorkflow({
            ...currentApprovalWorkflow,
            availableMembers: [...currentApprovalWorkflow.members, ...defaultWorkflowMembers],
            usedApproverEmails,
            action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
            errors: null,
            originalApprovers: currentApprovalWorkflow.approvers,
        });
        setInitialApprovalWorkflow(currentApprovalWorkflow);
    }, [currentApprovalWorkflow, defaultWorkflowMembers, initialApprovalWorkflow, usedApproverEmails]);

    const submitButtonContainerStyles = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, style: [styles.mb5, styles.mh5]});

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceWorkflowsApprovalsEditPage"
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={translate('workflowsEditApprovalsPage.title')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {!!approvalWorkflow && (
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
                                onSubmit={updateApprovalWorkflowCallback}
                                onFixTheErrorsLinkPressed={() => {
                                    formRef.current?.scrollTo({y: 0, animated: true});
                                }}
                                buttonText={translate('common.save')}
                                containerStyles={submitButtonContainerStyles}
                                enabledWhenOffline
                            />
                        </>
                    )}
                    {!initialApprovalWorkflow && <FullScreenLoadingIndicator />}
                </FullPageNotFoundView>
                <ConfirmModal
                    title={translate('workflowsEditApprovalsPage.deleteTitle')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={removeApprovalWorkflowCallback}
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

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsEditPage);
