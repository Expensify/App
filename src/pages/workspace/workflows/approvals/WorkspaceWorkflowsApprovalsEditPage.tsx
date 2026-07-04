import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {isAnyHRReadOnlyWorkflowMode} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, goBackFromInvalidPolicy, isPendingDeletePolicy} from '@libs/PolicyUtils';
import {convertPolicyEmployeesToApprovalWorkflows} from '@libs/WorkflowUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import {clearApprovalWorkflow, removeApprovalWorkflow, selectApprovalWorkflowForEdit, updateApprovalWorkflow, validateApprovalWorkflow} from '@userActions/Workflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';

import ApprovalWorkflowEditor from './ApprovalWorkflowEditor';

type WorkspaceWorkflowsApprovalsEditPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT>;

function WorkspaceWorkflowsApprovalsEditPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsEditPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const isLoadingApprovalWorkflow = isLoadingOnyxValue(approvalWorkflowMetadata);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [initialApprovalWorkflow, setInitialApprovalWorkflow] = useState<ApprovalWorkflow | undefined>();
    const formRef = useRef<ScrollView>(null);
    const {showConfirmModal} = useConfirmModal();
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
        Navigation.dismissModal({
            afterTransition: () => {
                updateApprovalWorkflow(approvalWorkflow, membersToRemove, approversToRemove, policy);
            },
        });
    };

    const removeApprovalWorkflowCallback = () => {
        if (!initialApprovalWorkflow) {
            return;
        }

        // Mark as deleting to prevent the useEffect from clearing the workflow and causing a blink
        isDeleting.current = true;
        Navigation.dismissModal({
            afterTransition: () => {
                // Remove the approval workflow using the initial data as it could be already edited
                removeApprovalWorkflow(initialApprovalWorkflow, policy);
            },
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
            currentUserLogin,
        });

        return {
            defaultWorkflowMembers: result.availableMembers,
            usedApproverEmails: result.usedApproverEmails,
            currentApprovalWorkflow: result.approvalWorkflows.find((workflow) => workflow.approvers.at(0)?.email === firstApprover),
        };
    };

    const {currentApprovalWorkflow, defaultWorkflowMembers, usedApproverEmails} = getApprovalWorkflowData();
    const canWriteApprovals = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS);

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) || !canWriteApprovals || isPendingDeletePolicy(policy) || !currentApprovalWorkflow || isAnyHRReadOnlyWorkflowMode(policy);

    // Set the initial approval workflow when the page is loaded
    useEffect(() => {
        if (initialApprovalWorkflow) {
            return;
        }

        if (isLoadingApprovalWorkflow) {
            return;
        }

        if (!currentApprovalWorkflow) {
            // Don't clear if we're in the middle of deleting - this prevents the UI from blinking
            if (isDeleting.current) {
                return;
            }
            return clearApprovalWorkflow();
        }

        // Resume after a sub-page round-trip: keep onyx state to avoid wiping the user's pending edits.
        const isResumingEdit = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT && approvalWorkflow?.originalApprovers?.at(0)?.email === route.params.firstApproverEmail;
        if (isResumingEdit) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time snapshot guarded by isResumingEdit + early return; runs at most once per mount
            setInitialApprovalWorkflow(currentApprovalWorkflow);
            return;
        }

        selectApprovalWorkflowForEdit({
            workflow: currentApprovalWorkflow,
            defaultWorkflowMembers,
            usedApproverEmails,
        });
        // Snapshot for diffing on save; runs alongside selectApprovalWorkflowForEdit above.
        setInitialApprovalWorkflow(currentApprovalWorkflow);
    }, [
        currentApprovalWorkflow,
        defaultWorkflowMembers,
        initialApprovalWorkflow,
        usedApproverEmails,
        policy,
        route.params.policyID,
        route.params.firstApproverEmail,
        approvalWorkflow?.action,
        approvalWorkflow?.originalApprovers,
        isLoadingApprovalWorkflow,
    ]);

    const submitButtonContainerStyles = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, style: [styles.mb5, styles.mh5]});

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
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
                                removeApprovalWorkflow={async () => {
                                    const result = await showConfirmModal({
                                        title: translate('workflowsEditApprovalsPage.deleteTitle'),
                                        prompt: translate('workflowsEditApprovalsPage.deletePrompt'),
                                        confirmText: translate('common.delete'),
                                        cancelText: translate('common.cancel'),
                                        danger: true,
                                    });
                                    if (result.action !== ModalActions.CONFIRM) {
                                        return;
                                    }
                                    removeApprovalWorkflowCallback();
                                }}
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
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVALS_EDIT_SAVE}
                            />
                        </>
                    )}
                    {!initialApprovalWorkflow && <FullScreenLoadingIndicator reasonAttributes={{context: 'WorkspaceWorkflowsApprovalsEditPage'}} />}
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsEditPage);
