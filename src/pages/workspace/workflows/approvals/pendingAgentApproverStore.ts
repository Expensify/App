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

/**
 * Captures intent to wire a freshly-created agent into a specific workflow as soon as the
 * CREATE_AGENT API response lands. AddAgentPage records this on submit (with the set of
 * agent account IDs that were already known) and the Workflows page consumes it when it
 * detects a new agent in `sharedNVP_agentPrompt_` whose account ID isn't in the known list.
 */
type PendingPostCreateSeed = {
    /** Policy where the workflow lives */
    policyID: string;

    /** First approver email of the workflow being edited (route param for the Edit page) */
    workflowApproverEmail: string;

    /** Snapshot of agent prompt account IDs at submit time, used to identify the new one */
    knownAccountIDs: number[];
};

let pendingPostCreateSeed: PendingPostCreateSeed | null = null;

function setPendingPostCreateSeed(value: PendingPostCreateSeed) {
    pendingPostCreateSeed = value;
}

function getPendingPostCreateSeed(): PendingPostCreateSeed | null {
    return pendingPostCreateSeed;
}

function clearPendingPostCreateSeed() {
    pendingPostCreateSeed = null;
}

/**
 * Tracks an in-flight CREATE_AGENT call so we can swap the optimistic approver we seeded into
 * `approvalWorkflow.approvers` for the real agent once the server response lands. Without this
 * swap the approver keeps pointing at the (now-expired) optimistic email, and the agent appears
 * to "fall out" of the workflow when the optimistic personalDetailsList / employeeList entries
 * get nulled by CREATE_AGENT's successData.
 */
type PendingAgentApproverSwap = {
    /** Optimistic email that was seeded as the approver (must match the value in approvalWorkflow) */
    optimisticEmail: string;

    /** Optimistic accountID used to derive the optimistic email; kept for diagnostics/parity */
    optimisticAccountID: number;

    /** Snapshot of owned agent accountIDs taken before submit — used to identify the new real agent */
    knownAccountIDs: number[];

    /** Policy this swap applies to. Prevents stale swaps from leaking across workspaces. */
    policyID: string;
};

let pendingAgentApproverSwap: PendingAgentApproverSwap | null = null;

function setPendingAgentApproverSwap(value: PendingAgentApproverSwap) {
    pendingAgentApproverSwap = value;
}

function getPendingAgentApproverSwap(): PendingAgentApproverSwap | null {
    return pendingAgentApproverSwap;
}

function clearPendingAgentApproverSwap() {
    pendingAgentApproverSwap = null;
}

export type {PendingAgentApprover, PendingPostCreateSeed, PendingAgentApproverSwap};
export {
    setPendingAgentApprover,
    getPendingAgentApprover,
    clearPendingAgentApprover,
    setPendingPostCreateSeed,
    getPendingPostCreateSeed,
    clearPendingPostCreateSeed,
    setPendingAgentApproverSwap,
    getPendingAgentApproverSwap,
    clearPendingAgentApproverSwap,
};
