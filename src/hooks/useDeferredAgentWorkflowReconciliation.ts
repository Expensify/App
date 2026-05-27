import {useEffect, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {buildDeferredAgentWorkflowSaveKey, clearDeferredAgentWorkflowSave, updateApprovalWorkflow} from '@libs/actions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

type ApprovalWorkflowWithRouting = ApprovalWorkflow & {routingFirstApproverEmail: string};

/**
 * Overlays deferred-save approval workflows on top of the server's view and reconciles them
 * once the pending agent's real identity lands.
 *
 * - Overlay: when the admin saves an Edit Approvers page while CREATE_AGENT is still in
 *   flight, we stash the workflow in `DEFERRED_AGENT_WORKFLOW_SAVES`. This hook merges that
 *   stashed approver chain into the workflows list so the new agent shows up faded in the
 *   workflow card. Each workflow also gets a `routingFirstApproverEmail` so the edit route /
 *   list key keep using the original (pre-overlay) email even when the overlaid `approvers[0]`
 *   is a pending agent with an empty `email` placeholder. A failed `CREATE_AGENT` surfaces
 *   `policy.errorFields[ADD_AGENT]` on the pending approver row so the admin sees an RBR
 *   right where the optimistic agent is shown.
 * - Reconcile: once the pending agent has a real email (the personal detail at
 *   `pendingAgentAccountID` gains a login OR `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING` echoes a
 *   real accountID OR a prompt-match resolves to a known member), we swap that email into
 *   the workflow, fire the real `updateApprovalWorkflow`, and clear the entry.
 */
function useDeferredAgentWorkflowReconciliation(rawApprovalWorkflows: ApprovalWorkflow[], policy: OnyxEntry<Policy>, policyID: string): ApprovalWorkflowWithRouting[] {
    const [deferredAgentWorkflowSaves] = useOnyx(ONYXKEYS.DEFERRED_AGENT_WORKFLOW_SAVES);
    const [agentPrompts] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const [optimisticAgentAccountIDMapping] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const addAgentErrors = policy?.errorFields?.[CONST.POLICY.COLLECTION_KEYS.ADD_AGENT];

    const approvalWorkflows = useMemo<ApprovalWorkflowWithRouting[]>(() => {
        if (!deferredAgentWorkflowSaves || isEmptyObject(deferredAgentWorkflowSaves)) {
            return rawApprovalWorkflows.map((workflow) => ({...workflow, routingFirstApproverEmail: workflow.approvers.at(0)?.email ?? ''}));
        }
        return rawApprovalWorkflows.map((workflow) => {
            const firstApproverEmail = workflow.approvers.at(0)?.email ?? '';
            if (!firstApproverEmail) {
                return {...workflow, routingFirstApproverEmail: firstApproverEmail};
            }
            const deferredEntry = deferredAgentWorkflowSaves[buildDeferredAgentWorkflowSaveKey(policyID, firstApproverEmail)];
            if (!deferredEntry) {
                return {...workflow, routingFirstApproverEmail: firstApproverEmail};
            }
            const overlaidApprovers = deferredEntry.approvalWorkflow.approvers
                .filter((approver): approver is NonNullable<typeof approver> => !!approver)
                .map((approver) =>
                    addAgentErrors && approver.accountID === deferredEntry.pendingAgentAccountID && approver.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD
                        ? {...approver, errors: addAgentErrors}
                        : approver,
                );
            return {
                ...workflow,
                approvers: overlaidApprovers,
                routingFirstApproverEmail: firstApproverEmail,
            };
        });
    }, [rawApprovalWorkflows, deferredAgentWorkflowSaves, policyID, addAgentErrors]);

    // Tracks deferred-save keys we've already reconciled in this mount. `updateApprovalWorkflow`'s
    // optimistic write to `policy.employeeList` re-renders the page before the matching
    // `clearDeferredAgentWorkflowSave` Onyx merge settles; without this guard the effect would
    // fire `updateApprovalWorkflow` (and the underlying `UPDATE_WORKSPACE_APPROVAL` API call)
    // a second time for the same entry on that intermediate render.
    const reconciledDeferredKeysRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Drop any tracked keys whose Onyx entries are gone (clear has settled or the entry was
        // removed elsewhere) so the same key can be reconciled again if it ever reappears.
        if (reconciledDeferredKeysRef.current.size > 0) {
            for (const key of [...reconciledDeferredKeysRef.current]) {
                if (!deferredAgentWorkflowSaves?.[key]) {
                    reconciledDeferredKeysRef.current.delete(key);
                }
            }
        }
        if (!deferredAgentWorkflowSaves || isEmptyObject(deferredAgentWorkflowSaves) || !policy || !personalDetails) {
            return;
        }
        for (const deferredEntry of Object.values(deferredAgentWorkflowSaves)) {
            if (!deferredEntry || deferredEntry.policyID !== policyID) {
                continue;
            }
            const deferredKey = buildDeferredAgentWorkflowSaveKey(deferredEntry.policyID, deferredEntry.firstApproverEmail);
            if (reconciledDeferredKeysRef.current.has(deferredKey)) {
                continue;
            }
            const pendingApprover = deferredEntry.approvalWorkflow.approvers.find(
                (approver) => approver?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && approver.accountID === deferredEntry.pendingAgentAccountID,
            );
            if (!pendingApprover) {
                // Nothing left to wait on — the save can fire as-is (or was already fired).
                reconciledDeferredKeysRef.current.add(deferredKey);
                clearDeferredAgentWorkflowSave(deferredEntry.policyID, deferredEntry.firstApproverEmail);
                continue;
            }
            // Prefer the live personal detail at the optimistic accountID — when CREATE_AGENT
            // resolves, the optimistic detail is replaced by a real one keyed on the new
            // accountID. The server echoes a `{optimisticID: realID}` mapping in the response's
            // onyxData (`OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING`), so the primary resolution is a
            // direct lookup of the real accountID, then read the email off the personal detail.
            // We keep a prompt-match fallback so cross-tab scenarios (where the mapping write
            // landed only on the originating tab) still reconcile — but prompt matching is
            // ambiguous when multiple agents share the same prompt text, so the mapping wins
            // whenever it's present.
            let resolvedEmail = personalDetails[deferredEntry.pendingAgentAccountID]?.login;
            let resolvedAccountID: number | undefined = deferredEntry.pendingAgentAccountID;
            const mappedRealAccountID = optimisticAgentAccountIDMapping?.[deferredEntry.pendingAgentAccountID];
            if (!resolvedEmail && mappedRealAccountID) {
                const mappedDetail = personalDetails[mappedRealAccountID];
                if (mappedDetail?.login && policy.employeeList?.[mappedDetail.login]) {
                    resolvedEmail = mappedDetail.login;
                    resolvedAccountID = mappedDetail.accountID ?? mappedRealAccountID;
                }
            }
            if (!resolvedEmail && deferredEntry.pendingAgentPrompt && agentPrompts && policy.employeeList) {
                const optimisticPromptKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${deferredEntry.pendingAgentAccountID}`;
                const knownEmails = new Set(
                    deferredEntry.approvalWorkflow.approvers
                        .filter((approver) => approver?.email && approver.accountID !== deferredEntry.pendingAgentAccountID)
                        .map((approver) => approver?.email),
                );
                // Several agents can share the same prompt text. Pick the highest positive
                // accountID — server assigns IDs monotonically, so the freshest agent is the
                // largest, which avoids resolving the pending approver to a pre-existing agent
                // that happens to use the same default prompt.
                let bestCandidateAccountID = -Infinity;
                for (const [promptKey, promptValue] of Object.entries(agentPrompts)) {
                    if (promptKey === optimisticPromptKey || !promptValue || promptValue.prompt !== deferredEntry.pendingAgentPrompt) {
                        continue;
                    }
                    const candidateAccountID = Number(promptKey.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length));
                    if (!Number.isFinite(candidateAccountID) || candidateAccountID <= 0 || candidateAccountID <= bestCandidateAccountID) {
                        continue;
                    }
                    const candidateDetail = personalDetails[candidateAccountID];
                    if (!candidateDetail?.login || !policy.employeeList?.[candidateDetail.login] || knownEmails.has(candidateDetail.login)) {
                        continue;
                    }
                    resolvedEmail = candidateDetail.login;
                    resolvedAccountID = candidateDetail.accountID ?? candidateAccountID;
                    bestCandidateAccountID = candidateAccountID;
                }
            }
            if (!resolvedEmail) {
                continue;
            }
            // Upgrade the deferred workflow with the real email, then fire the save action.
            // `updateApprovalWorkflow` expects `ApprovalWorkflow` (approvers required, no
            // editor-only fields), so filter out the holes in the Onyx representation and
            // hand off only the fields it cares about.
            const upgradedApprovers = deferredEntry.approvalWorkflow.approvers
                .filter((approver): approver is NonNullable<typeof approver> => !!approver)
                .map((approver) =>
                    approver === pendingApprover
                        ? {
                              ...approver,
                              email: resolvedEmail,
                              accountID: resolvedAccountID,
                              pendingAction: undefined,
                          }
                        : approver,
                );
            // When the saved workflow is the default one, the new agent becomes the new default
            // approver. The deferred snapshot's `members` list was captured before CREATE_AGENT
            // resolved, so the agent isn't in it — and `convertApprovalWorkflowToPolicyEmployees`
            // only rewrites `submitsTo` for emails present in `members`. Without the agent in
            // that list their `submitsTo` (set to the previous default approver by
            // `shareWithEmployees` in CreateAgent.cpp) is never overwritten, leaving them as
            // their own orphan submission group in the workflows list. Injecting them here
            // mirrors the online editor's behaviour (where the agent is already in employeeList
            // when the editor renders and falls naturally into the "Everyone" members list) so
            // the agent ends up submitting to themselves like every other default approver.
            const upgradedMembers =
                deferredEntry.approvalWorkflow.isDefault && !deferredEntry.approvalWorkflow.members.some((member) => member.email === resolvedEmail)
                    ? [
                          ...deferredEntry.approvalWorkflow.members,
                          {
                              email: resolvedEmail,
                              displayName: pendingApprover.displayName,
                              avatar: pendingApprover.avatar,
                          },
                      ]
                    : deferredEntry.approvalWorkflow.members;
            const upgradedWorkflow = {
                members: upgradedMembers,
                approvers: upgradedApprovers,
                isDefault: deferredEntry.approvalWorkflow.isDefault,
            };
            const initialApprovers = deferredEntry.initialApprovalWorkflow.approvers.filter((approver): approver is NonNullable<typeof approver> => !!approver);
            const membersToRemove = deferredEntry.initialApprovalWorkflow.members.filter((initialMember) => !upgradedWorkflow.members.some((member) => member.email === initialMember.email));
            const approversToRemove = initialApprovers.filter((initialApprover) => !upgradedWorkflow.approvers.some((approver) => approver.email === initialApprover.email));
            reconciledDeferredKeysRef.current.add(deferredKey);
            updateApprovalWorkflow(upgradedWorkflow, membersToRemove, approversToRemove, policy);
            clearDeferredAgentWorkflowSave(deferredEntry.policyID, deferredEntry.firstApproverEmail);
        }
    }, [deferredAgentWorkflowSaves, policy, personalDetails, policyID, agentPrompts, optimisticAgentAccountIDMapping]);

    return approvalWorkflows;
}

export default useDeferredAgentWorkflowReconciliation;
export type {ApprovalWorkflowWithRouting};
