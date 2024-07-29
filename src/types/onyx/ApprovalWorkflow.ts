import type {AvatarSource} from '@libs/UserUtils';

/**
 * Approver in the approval workflow
 */
type Approver = {
    /**
     * Email of the approver
     */
    email: string;

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
    displayName?: string;

    /**
     * Is this user used as an approver in more than one workflow (used to show a warning)
     */
    isInMultipleWorkflows: boolean;

    /**
     * Is this approver in a circular reference (approver forwards to themselves, or a cycle of forwards)
     *
     * example: A -> A (self forwards)
     * example: A -> B -> C -> A (cycle)
     */
    isCircularReference?: boolean;
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
     * Avatar URL of the current user from their personal details
     */
    avatar?: AvatarSource;

    /**
     * Display name of the current user from their personal details
     */
    displayName?: string;
};

/**
 * Approval workflow for a group of employees
 */
type ApprovalWorkflow = {
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

    /**
     * Is this workflow being edited vs created
     */
    isBeingEdited: boolean;

    /** Whether we are waiting for the API action to complete */
    isLoading?: boolean;
};

export default ApprovalWorkflow;
export type {Approver, Member};
