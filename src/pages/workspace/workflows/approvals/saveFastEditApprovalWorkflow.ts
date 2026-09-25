import {clearApprovalWorkflow, getApprovalWorkflowSessionID, updateApprovalWorkflow, updateApprovalWorkflowRules, validateFastEditApprovalWorkflow} from '@libs/actions/Workflow';
import runAfterPredictedTransition from '@libs/Navigation/runAfterPredictedTransition';
import {getRemovedApprovalWorkflowMembers} from '@libs/WorkflowUtils';

import type {Policy} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx} from '@src/types/onyx/ApprovalWorkflow';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type SaveFastEditApprovalWorkflowParams = {
    /** The draft to persist, already carrying the members the admin confirmed on this screen. */
    approvalWorkflow: ApprovalWorkflowOnyx;

    /** The policy the workflow belongs to. */
    policy: OnyxEntry<Policy>;

    /** This policy's rules, used by the `MULTIPLE_APPROVERS` save path. */
    rules: OnyxCollection<Rule>;

    /** Whether the `MULTIPLE_APPROVERS` beta routes the save through the rules backend. */
    isMultipleApproversBetaEnabled: boolean;

    /** Leaves this screen. Called once the write is queued, and not at all when validation rejects the draft. */
    navigateBack: () => void;
};

/**
 * Persists a workflow edited through a "+N more" fast edit, leaves the screen, and discards the draft.
 *
 * A fast edit opens a sub-page with no edit RHP behind it, so whichever sub-page the admin confirms on is the only
 * screen that will ever save that workflow. Both entry points (the expenses-from page, and the invite page it
 * detours through when the admin picks someone who isn't a member yet) owe exactly this sequence, so it lives here
 * instead of being written twice.
 *
 * @returns whether the save ran. `false` means validation rejected the draft: nothing was written, `navigateBack`
 * was not called, and the caller still owns the screen so the admin can see the error.
 */
function saveFastEditApprovalWorkflow({approvalWorkflow, policy, rules, isMultipleApproversBetaEnabled, navigateBack}: SaveFastEditApprovalWorkflowParams): boolean {
    // Validate before navigating, so a rejected save keeps the admin on the page instead of navigating away and
    // silently discarding the member change. The fast-edit validator deliberately skips the approver rules the
    // whole-workflow one applies: neither fast-edit screen has an approver field, so failing on a pre-existing
    // circular forwardsTo would dead-end every fast edit on that policy. See validateFastEditApprovalWorkflow.
    if (!validateFastEditApprovalWorkflow(approvalWorkflow)) {
        return false;
    }

    const originalMembers = approvalWorkflow.originalMembers ?? [];
    // Queue the write before navigating. Deferring it past the transition (which runAfterPredictedTransition can
    // stretch to about two seconds) means a reload inside that window loses the in-memory callback, while the
    // caller's unmount cleanup has already discarded the draft, so the change the admin confirmed is gone with
    // nothing queued to recover it. Once queued the request is persisted and survives a reload. Passing
    // shouldClearApprovalWorkflowDraft=false keeps the save off APPROVAL_WORKFLOW entirely, so it can't blank the
    // page that is still sliding away. The deferred teardown below owns that.
    if (isMultipleApproversBetaEnabled) {
        updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow: {...approvalWorkflow, members: originalMembers}, policy, rules});
    } else {
        updateApprovalWorkflow(approvalWorkflow, getRemovedApprovalWorkflowMembers(originalMembers, approvalWorkflow.members), [], policy, false);
    }

    // Only the draft teardown is deferred now. If the admin opens another workflow's "+N more" inside the
    // transition window a newer draft is seeded, and this teardown has to leave it alone. Take the id off the
    // draft being saved rather than off the live value, so it stays correct even if Onyx moves on first.
    const sessionID = approvalWorkflow.sessionID;

    navigateBack();

    runAfterPredictedTransition(() => {
        if (getApprovalWorkflowSessionID() !== sessionID) {
            return;
        }

        // This session owns the draft: no edit page will consume it, and neither save path clears it.
        // updateApprovalWorkflowRules never does, and updateApprovalWorkflow is called above with its clear flag
        // off so the write can land before the transition. Tear the draft down here so isFastEdit can't outlive
        // the save. Plain Onyx.set(key, null) on a key neither save path touches, so it is safe after either branch.
        clearApprovalWorkflow();
    });

    return true;
}

export default saveFastEditApprovalWorkflow;
