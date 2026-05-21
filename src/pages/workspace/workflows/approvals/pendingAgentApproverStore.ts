import type {AvatarSource} from '@libs/UserAvatarUtils';

/**
 * One-shot seed for an agent approver that should be injected into the
 * Edit Approval Workflow page on mount. Used by the inline agent creation
 * flow on the Workflows page so the Edit page can place the agent at
 * approver index 0 without needing to round-trip through Onyx.
 */
type PendingAgentApprover = {
    /** Email of the agent to seed as the first approver */
    email: string;

    /** Display name of the agent */
    displayName: string;

    /** Optional avatar of the agent */
    avatar?: AvatarSource;

    /**
     * Policy ID this seed applies to. Used to scope the seed so a stale value
     * never leaks into an unrelated workflow.
     */
    policyID: string;

    /**
     * Approval mode of the policy at the time the seed was written.
     * - For BASIC/Collect workspaces the seed replaces approver[0].
     * - For ADVANCED/Control workspaces the seed is prepended.
     */
    isAdvancedApproval: boolean;
};

let pendingApprover: PendingAgentApprover | null = null;

function setPendingAgentApprover(value: PendingAgentApprover) {
    pendingApprover = value;
}

function getPendingAgentApprover(): PendingAgentApprover | null {
    return pendingApprover;
}

function clearPendingAgentApprover() {
    pendingApprover = null;
}

export type {PendingAgentApprover};
export {setPendingAgentApprover, getPendingAgentApprover, clearPendingAgentApprover};
