import React, {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
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
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {canEditWorkspaceSettings, goBackFromInvalidPolicy, isControlPolicy, isPendingDeletePolicy} from '@libs/PolicyUtils';
import {convertPolicyEmployeesToApprovalWorkflows, mergeWorkflowMembersWithAvailableMembers, resolveOptimisticAgent} from '@libs/WorkflowUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {buildDeferredAgentWorkflowSaveKey, clearApprovalWorkflow, queueDeferredAgentWorkflowSave, removeApprovalWorkflow, setApprovalWorkflow, updateApprovalWorkflow, validateApprovalWorkflow} from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ApprovalWorkflowEditor from './ApprovalWorkflowEditor';

type WorkspaceWorkflowsApprovalsEditPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT>;

function WorkspaceWorkflowsApprovalsEditPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsEditPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [agentPrompts] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const [optimisticAgentAccountIDMapping] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
    const [deferredAgentWorkflowSaves] = useOnyx(ONYXKEYS.DEFERRED_AGENT_WORKFLOW_SAVES);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [initialApprovalWorkflow, setInitialApprovalWorkflow] = useState<ApprovalWorkflow | undefined>();
    const formRef = useRef<ScrollView>(null);
    const {showConfirmModal} = useConfirmModal();
    const isDeleting = useRef(false);

    // Capture the pending agent's prompt the moment we see it on the optimistic record. The
    // `SHARED_NVP_AGENT_PROMPT_<optimisticID>` entry is wiped from Onyx as part of CREATE_AGENT's
    // successData, so once the server responds we'd lose the chance to read it. Stash it in a
    // ref keyed by the optimistic accountID so the reconciliation effect (and the deferred-save
    // queue) can match the resolved agent by prompt — a stable identifier that doesn't collide
    // the way displayName does in workspaces with duplicate names.
    const capturedPendingAgentPromptsRef = useRef<Map<number, string>>(new Map());
    const pendingApproverAccountID = approvalWorkflow?.approvers.find((approver) => approver?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)?.accountID;
    const pendingAgentPromptKey = pendingApproverAccountID !== undefined ? `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${pendingApproverAccountID}` : undefined;
    const livePendingAgentPrompt = pendingAgentPromptKey ? agentPrompts?.[pendingAgentPromptKey]?.prompt : undefined;
    useEffect(() => {
        if (pendingApproverAccountID === undefined || !livePendingAgentPrompt) {
            return;
        }
        if (capturedPendingAgentPromptsRef.current.has(pendingApproverAccountID)) {
            return;
        }
        capturedPendingAgentPromptsRef.current.set(pendingApproverAccountID, livePendingAgentPrompt);
    }, [pendingApproverAccountID, livePendingAgentPrompt]);

    const updateApprovalWorkflowCallback = () => {
        if (!approvalWorkflow || !initialApprovalWorkflow) {
            return;
        }

        if (!validateApprovalWorkflow(approvalWorkflow)) {
            return;
        }

        // If any approver is still being created (seeded from Workflows > Add agent with an
        // optimistic accountID), defer the actual save. We can't push it to the server yet —
        // the approver's email is empty until CREATE_AGENT resolves — but the admin shouldn't
        // be trapped on this screen either. Stash the workflow in `DEFERRED_AGENT_WORKFLOW_SAVES`
        // and dismiss; WorkspaceWorkflowsPage will render the workflow with the faded agent
        // and fire the real save once the agent's email lands.
        const pendingApprover = approvalWorkflow.approvers.find((approver) => approver?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        if (pendingApprover?.accountID !== undefined && route.params.firstApproverEmail) {
            const pendingPromptKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${pendingApprover.accountID}` as const;
            const pendingPrompt = capturedPendingAgentPromptsRef.current.get(pendingApprover.accountID) ?? agentPrompts?.[pendingPromptKey]?.prompt ?? '';
            queueDeferredAgentWorkflowSave(route.params.policyID, route.params.firstApproverEmail, approvalWorkflow, initialApprovalWorkflow, pendingApprover.accountID, pendingPrompt);
            Navigation.dismissModal();
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
            currentUserLogin: currentUserPersonalDetails?.login,
        });

        const rawWorkflow = result.approvalWorkflows.find((workflow) => workflow.approvers.at(0)?.email === firstApprover);

        // When an agent was added as approver while offline (or while CREATE_AGENT is still
        // in flight), the save is stashed in DEFERRED_AGENT_WORKFLOW_SAVES instead of being
        // pushed to policy.employeeList.  The Workflows page overlays that stash via
        // useDeferredAgentWorkflowReconciliation, but the Edit RHP never consults it — so it
        // re-derives the workflow from the stale employeeList and shows the previous approver.
        // Overlay the deferred entry here so both screens share the same source of truth.
        const deferredEntry = firstApprover
            ? deferredAgentWorkflowSaves?.[buildDeferredAgentWorkflowSaveKey(route.params.policyID, firstApprover)]
            : undefined;

        const currentApprovalWorkflow =
            rawWorkflow && deferredEntry
                ? {
                      ...rawWorkflow,
                      approvers: deferredEntry.approvalWorkflow.approvers.filter((a): a is Approver => !!a),
                  }
                : rawWorkflow;

        return {
            defaultWorkflowMembers: result.availableMembers,
            usedApproverEmails: result.usedApproverEmails,
            currentApprovalWorkflow,
        };
    };

    const {currentApprovalWorkflow, defaultWorkflowMembers, usedApproverEmails} = getApprovalWorkflowData();

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) ||
        !canEditWorkspaceSettings(policy) ||
        isPendingDeletePolicy(policy) ||
        !currentApprovalWorkflow ||
        isAnyHRReadOnlyWorkflowMode(policy);

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

        // Seed approver[0] when opened from Workflows > Add agent (skip if already in the workflow).
        // Two entry points are supported:
        //   1. `seedApproverEmail` — used when the new agent already has a server-assigned login
        //      (the original happy path: AddAgentPage used to wait for CREATE_AGENT before navigating).
        //   2. `seedApproverAccountID` — used when AddAgentPage navigates immediately with the
        //      optimistic accountID from `createAgent`. The optimistic personal detail has a display
        //      name and an avatar but no `login` yet; we seed the approver anyway, mark it as
        //      pending so the row renders with opacity, and rely on the reconciliation effect below
        //      to upgrade it to the real email/accountID once CREATE_AGENT resolves.
        const seedApproverEmail = route.params.seedApproverEmail;
        const seedApproverAccountID = route.params.seedApproverAccountID ? Number(route.params.seedApproverAccountID) : undefined;
        const hasSeedApproverEmail = seedApproverEmail !== undefined && seedApproverEmail !== '';
        const hasSeedRequest = hasSeedApproverEmail || seedApproverAccountID !== undefined;
        let seedPersonalDetails;
        if (hasSeedApproverEmail) {
            seedPersonalDetails = getPersonalDetailByEmail(seedApproverEmail);
        } else if (seedApproverAccountID !== undefined) {
            seedPersonalDetails = personalDetails?.[seedApproverAccountID];
        }

        // `createAgent` queues the optimistic personal detail merge and AddAgentPage navigates
        // here on the next tick — so on the first render the optimistic detail may still be
        // undefined. Bail out without locking `initialApprovalWorkflow` so the effect re-runs
        // when `personalDetails` next updates; that's when we'll actually find the seed and
        // commit the seeded workflow. Without this guard the un-seeded workflow gets committed
        // and the seed is lost forever (the bug that just showed up in testing).
        if (hasSeedRequest && !seedPersonalDetails) {
            return;
        }

        let approvers: Approver[] = currentApprovalWorkflow.approvers;
        if (seedPersonalDetails) {
            const seededEmail = seedApproverEmail ?? seedPersonalDetails.login ?? '';
            const seededAccountID = seedPersonalDetails.accountID ?? seedApproverAccountID;
            const isApproverAlreadyInWorkflow = currentApprovalWorkflow.approvers.some(
                (approver) => (!!seededEmail && approver.email === seededEmail) || (seededAccountID !== undefined && approver.accountID === seededAccountID),
            );
            if (!isApproverAlreadyInWorkflow) {
                const seededApprover: Approver = {
                    email: seededEmail,
                    accountID: seededAccountID,
                    displayName: seedPersonalDetails.displayName ?? seededEmail,
                    avatar: seedPersonalDetails.avatar,
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                    // Mark as pending only when the personal detail is optimistic (no login yet) so
                    // the row renders with reduced opacity while CREATE_AGENT is in flight.
                    ...(seedPersonalDetails.isOptimisticPersonalDetail ? {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : {}),
                };
                approvers = isControlPolicy(policy) ? [seededApprover, ...currentApprovalWorkflow.approvers] : [seededApprover, ...currentApprovalWorkflow.approvers.slice(1)];
            }
        }

        setApprovalWorkflow({
            ...currentApprovalWorkflow,
            approvers,
            availableMembers: mergeWorkflowMembersWithAvailableMembers(currentApprovalWorkflow.members, defaultWorkflowMembers),
            usedApproverEmails,
            action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
            errors: null,
            originalApprovers: currentApprovalWorkflow.approvers,
        });
        // Intentional: synchronizes the initial workflow snapshot when the current workflow changes.
        // This runs alongside setApprovalWorkflow above and is part of the same logical update.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInitialApprovalWorkflow(currentApprovalWorkflow);
    }, [
        currentApprovalWorkflow,
        defaultWorkflowMembers,
        initialApprovalWorkflow,
        usedApproverEmails,
        policy,
        route.params.policyID,
        route.params.seedApproverEmail,
        route.params.seedApproverAccountID,
        personalDetails,
    ]);

    // Reconcile a pending (optimistic) seeded approver with the real personal detail once
    // CREATE_AGENT resolves. The optimistic personal detail is deleted in `createAgent`'s
    // successData and a new one with a positive accountID + real login is added by the
    // server response. The server also echoes a `{optimisticID: realID}` mapping in
    // `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING` — the primary resolution path — so we can look up
    // the real accountID without guessing. Prompt matching stays as a cross-tab fallback:
    // the mapping write only lands on the originating tab's Onyx, so a different tab still
    // needs the prompt heuristic to reconcile (with the caveat that it's ambiguous when two
    // agents share the same prompt text — captured in `capturedPendingAgentPromptsRef` while
    // the optimistic entry was still live).
    useEffect(() => {
        if (!approvalWorkflow || !policy?.employeeList || !personalDetails || !agentPrompts) {
            return;
        }
        const pendingApprover = approvalWorkflow.approvers.find((approver) => approver?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        if (!pendingApprover?.accountID) {
            return;
        }

        const knownApproverEmails = new Set(approvalWorkflow.approvers.map((approver) => approver?.email).filter((email): email is string => !!email));
        const resolved = resolveOptimisticAgent({
            optimisticAccountID: pendingApprover.accountID,
            pendingAgentPrompt: capturedPendingAgentPromptsRef.current.get(pendingApprover.accountID),
            personalDetails,
            employeeList: policy.employeeList,
            agentPrompts,
            optimisticAccountIDMapping: optimisticAgentAccountIDMapping,
            knownApproverEmails,
        });
        if (!resolved) {
            return;
        }
        const {personalDetail: resolvedPersonalDetail, email: resolvedEmail} = resolved;

        const upgradedApprovers = approvalWorkflow.approvers.map((approver) =>
            approver === pendingApprover
                ? {
                      ...approver,
                      email: resolvedEmail,
                      accountID: resolvedPersonalDetail.accountID,
                      avatar: resolvedPersonalDetail.avatar ?? approver.avatar,
                      displayName: resolvedPersonalDetail.displayName ?? approver.displayName,
                      pendingAction: undefined,
                  }
                : approver,
        );

        // Mirror the deferred-save reconciliation in WorkspaceWorkflowsPage: when the new agent
        // becomes the default approver, inject it into `members` so the subsequent save updates
        // their `submitsTo` to point at themselves. Without this, `convertApprovalWorkflowToPolicyEmployees`
        // never rewrites the agent's `submitsTo` (set to the previous default approver by
        // `shareWithEmployees` in CreateAgent.cpp), leaving an orphan "Expenses from agent → previous
        // approver" workflow card on the workflows page.
        const upgradedMembers =
            approvalWorkflow.isDefault && !approvalWorkflow.members.some((member) => member.email === resolvedEmail)
                ? [
                      ...approvalWorkflow.members,
                      {
                          email: resolvedEmail,
                          displayName: resolvedPersonalDetail.displayName ?? resolvedEmail,
                          avatar: resolvedPersonalDetail.avatar,
                      },
                  ]
                : approvalWorkflow.members;
        setApprovalWorkflow({...approvalWorkflow, approvers: upgradedApprovers, members: upgradedMembers});
    }, [approvalWorkflow, policy?.employeeList, personalDetails, agentPrompts, optimisticAgentAccountIDMapping]);

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
