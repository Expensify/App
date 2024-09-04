import type {ValueOf} from 'type-fest';
import type {AvatarSource} from '@libs/UserUtils';
import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnyxValueWithOfflineFeedback} from './OnyxCommon';

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
    displayName: string;

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
     * Display name of the current user from their personal details
     */
    displayName: string;

    /**
     * Avatar URL of the current user from their personal details
     */
    avatar?: AvatarSource;
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
     * Whether we are waiting for the API action to complete
     */
    isLoading: boolean;

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
};

export default ApprovalWorkflow;
export type {ApprovalWorkflowOnyx, Approver, Member};
