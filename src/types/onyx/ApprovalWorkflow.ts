import type {AvatarSource} from '@libs/UserAvatarUtils';

import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {ValueOf} from 'type-fest';

import type {Errors, OnyxValueWithOfflineFeedback, PendingAction, PendingFields} from './OnyxCommon';

/**
 * Approver in the approval workflow
 */
type Approver = {
    /**
     * Email of the approver. May be the empty string when this approver was seeded from an
     * optimistic agent creation that has not yet received its server-assigned login. In that
     * case `accountID` carries the identity and `pendingAction` is set so the row renders with
     * opacity. Once `CREATE_AGENT` resolves we migrate this approver to the real email.
     */
    email: string;

    /**
     * Account ID of the approver. Tracked so we can identify the approver even when `email`
     * is missing (optimistic agent creation flow). For approvers added from the workspace
     * member picker this matches the personal detail's `accountID`.
     */
    accountID?: number;

    /**
     * Pending action that mirrors the underlying personal detail. When set (e.g. `ADD` while
     * a new agent is being created), the approver row renders with reduced opacity to signal
     * that the approver is still being confirmed by the server.
     */
    pendingAction?: PendingAction;

    /**
     * Transient errors attached to an optimistic agent approver. Surfaced on the workflows
     * page so a failed `CREATE_AGENT` shows up as an RBR / dismissible message next to the
     * pending approver row. Not persisted to the server — set in the page-level overlay only.
     */
    errors?: Errors;

    /**
     * Email of the user this user forwards all approved reports to
     */
    forwardsTo?: string;

    /**
     * Avatar URL of the current user from their personal details
     */
    avatar?: AvatarSource;

    /**
     * Display name of the current user from their personal details
     */
    displayName: string;

    /**
     * Is this approver in a circular reference (approver forwards to themselves, or a cycle of forwards)
     *
     * example: A -> A (self forwards)
     * example: A -> B -> C -> A (cycle)
     */
    isCircularReference?: boolean;

    /**
     * If report total is above this limit, the report will be forwarded to 'overLimitForwardsTo' instead of 'forwardsTo'
     */
    approvalLimit?: number | null;

    /**
     * Email of the user this user forwards all approved reports to when report total is above 'approvalLimit'
     */
    overLimitForwardsTo?: string;

    /**
     * Display name of the user this user forwards all approved reports to when report total is above 'approvalLimit'
     */
    overLimitForwardsToDisplayName?: string;
};

/**
 * Member in the approval workflow
 */
type Member = {
    /**
     * Email of the member
     */
    email: string;

    /**
     * Display name of the current user from their personal details
     */
    displayName: string;

    /**
     * Avatar URL of the current user from their personal details
     */
    avatar?: AvatarSource;

    /**
     * Pending states for offline updates
     */
    pendingFields?: PendingFields<'submitsTo' | 'forwardsTo'>;
};

/**
 * Approval workflow for a group of employees
 */
type ApprovalWorkflow = OnyxValueWithOfflineFeedback<{
    /**
     * List of member emails in the workflow
     */
    members: Member[];

    /**
     * List of approvers in the workflow (the order of approvers in this array is important)
     *
     * The first approver in the array is the first approver in the workflow, next approver is the one they forward to, etc.
     */
    approvers: Approver[];

    /**
     * Is this the default workflow for the policy (first approver of this workflow is the same as the policy's default approver)
     */
    isDefault: boolean;
}>;

/**
 * Approval workflow for a group of employees with additional properties for the Onyx store
 */
type ApprovalWorkflowOnyx = Omit<ApprovalWorkflow, 'approvers'> & {
    /**
     * List of approvers in the workflow (the order of approvers in this array is important)
     *
     * The first approver in the array is the first approver in the workflow, next approver is the one they forward to, etc.
     */
    approvers: Array<Approver | undefined>;

    /**
     * The current action of the workflow, used to navigate between different screens
     */
    action: ValueOf<typeof CONST.APPROVAL_WORKFLOW.ACTION>;

    /**
     * List of available members that can be selected in the workflow
     */
    availableMembers: Member[];

    /**
     * List of emails that are already in use in other workflows
     */
    usedApproverEmails: string[];

    /**
     * Errors for the workflow
     */
    errors?: Record<string, TranslationPaths>;

    /**
     * List of original approvers in the workflow
     */
    originalApprovers: Approver[];

    /**
     * Whether the user is in the initial creation flow
     */
    isInitialFlow?: boolean;
};

export default ApprovalWorkflow;
export type {ApprovalWorkflowOnyx, Approver, Member};
