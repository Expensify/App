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
     * Is this approver in more than one workflow
     */
    isInMultipleWorkflows: boolean;

    /**
     * Is this approver in a circular reference
     */
    isCircularReference?: boolean;
};

/**
 *
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
     * List of approvers in the workflow
     */
    approvers: Approver[];

    /**
     * Is this the default workflow
     */
    isDefault: boolean;

    /**
     * Is this workflow being edited vs created
     */
    isBeingEdited: boolean;
};

export default ApprovalWorkflow;
export type {Approver, Member};
