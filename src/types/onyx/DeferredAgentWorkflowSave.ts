import type ApprovalWorkflow from './ApprovalWorkflow';
import type {ApprovalWorkflowOnyx} from './ApprovalWorkflow';

/**
 * A workflow save the admin committed while a freshly-created agent was still pending. We
 * stash the edited workflow here when the user clicks "Save" on the Edit Approvers page
 * before `CREATE_AGENT` resolves; the WorkspaceWorkflowsPage watcher reconciles each entry
 * once the agent gets its real email/accountID and fires the actual API write.
 */
type DeferredAgentWorkflowSave = {
    /** Workspace this save belongs to */
    policyID: string;

    /** Email of the workflow's primary approver (the route's `firstApproverEmail`) */
    firstApproverEmail: string;

    /**
     * Snapshot of the workflow as it appeared in the editor at the time of save (using the
     * Onyx editor shape — approvers may include `undefined` placeholders for empty rows).
     */
    approvalWorkflow: ApprovalWorkflowOnyx;

    /**
     * Snapshot of the workflow BEFORE the edit. Matches the shape of the value stored in
     * `useState<ApprovalWorkflow>` on the Edit Approvers page (approvers required).
     */
    initialApprovalWorkflow: ApprovalWorkflow;

    /**
     * Optimistic accountID of the pending agent we're waiting on. When the personal detail
     * at this accountID gains a `login` (or a corresponding employeeList entry shows up on
     * the policy), the watcher swaps that login into the workflow and fires the real save.
     */
    pendingAgentAccountID: number;
};

export default DeferredAgentWorkflowSave;
