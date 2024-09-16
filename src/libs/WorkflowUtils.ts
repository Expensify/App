import lodashMapKeys from 'lodash/mapKeys';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

const INITIAL_APPROVAL_WORKFLOW: ApprovalWorkflowOnyx = {
    members: [],
    approvers: [],
    availableMembers: [],
    usedApproverEmails: [],
    isDefault: false,
    action: CONST.APPROVAL_WORKFLOW.ACTION.CREATE,
    isLoading: false,
};

type GetApproversParams = {
    /**
     * List of employees in the policy
     */
    employees: PolicyEmployeeList;

    /**
     * Personal details of the employees where the key is the email
     */
    personalDetailsByEmail: PersonalDetailsList;

    /**
     * Email of the first approver
     */
    firstEmail: string;
};

/** Get the list of approvers for a given email */
function calculateApprovers({employees, firstEmail, personalDetailsByEmail}: GetApproversParams): Approver[] {
    const approvers: Approver[] = [];
    // Keep track of approver emails to detect circular references
    const currentApproverEmails = new Set<string>();

    let nextEmail: string | undefined = firstEmail;
    while (nextEmail) {
        if (!employees[nextEmail]) {
            break;
        }

        const isCircularReference = currentApproverEmails.has(nextEmail);
        approvers.push({
            email: nextEmail,
            forwardsTo: employees[nextEmail].forwardsTo,
            avatar: personalDetailsByEmail[nextEmail]?.avatar,
            displayName: personalDetailsByEmail[nextEmail]?.displayName ?? nextEmail,
            isCircularReference,
        });

        // If we've already seen this approver, break to prevent infinite loop
        if (isCircularReference) {
            break;
        }
        currentApproverEmails.add(nextEmail);

        // If there is a forwardsTo, set the next approver to the forwardsTo
        nextEmail = employees[nextEmail].forwardsTo;
    }

    return approvers;
}

type PolicyConversionParams = {
    /**
     * List of employees in the policy
     */
    employees: PolicyEmployeeList;

    /**
     * Personal details of the employees
     */
    personalDetails: PersonalDetailsList;

    /**
     * Email of the default approver for the policy
     */
    defaultApprover: string;

    /**
     * Email of the first approver in current edited workflow
     */
    firstApprover?: string;
};

type PolicyConversionResult = {
    /**
     * List of approval workflows
     */
    approvalWorkflows: ApprovalWorkflow[];

    /**
     * List of available members that can be selected in the workflow
     */
    availableMembers: Member[];

    /**
     * Emails that are used as approvers in currently configured workflows
     */
    usedApproverEmails: string[];
};

/** Convert a list of policy employees to a list of approval workflows */
function convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails, firstApprover}: PolicyConversionParams): PolicyConversionResult {
    const approvalWorkflows: Record<string, ApprovalWorkflow> = {};

    // Keep track of used approver emails to display hints in the UI
    const usedApproverEmails = new Set<string>();
    const personalDetailsByEmail = lodashMapKeys(personalDetails, (value, key) => value?.login ?? key);

    // Add each employee to the appropriate workflow
    Object.values(employees).forEach((employee) => {
        const {email, submitsTo, pendingAction} = employee;
        if (!email || !submitsTo) {
            return;
        }

        const member: Member = {
            email,
            avatar: personalDetailsByEmail[email]?.avatar,
            displayName: personalDetailsByEmail[email]?.displayName ?? email,
        };

        if (!approvalWorkflows[submitsTo]) {
            const approvers = calculateApprovers({employees, firstEmail: submitsTo, personalDetailsByEmail});
            if (submitsTo !== firstApprover) {
                approvers.forEach((approver) => usedApproverEmails.add(approver.email));
            }

            approvalWorkflows[submitsTo] = {
                members: [],
                approvers,
                isDefault: defaultApprover === submitsTo,
                pendingAction,
            };
        }

        approvalWorkflows[submitsTo].members.push(member);
        if (pendingAction) {
            approvalWorkflows[submitsTo].pendingAction = pendingAction;
        }
    });

    // Sort the workflows by the first approver's name (default workflow has priority)
    const sortedApprovalWorkflows = Object.values(approvalWorkflows).sort((a, b) => {
        if (a.isDefault) {
            return -1;
        }

        if (b.isDefault) {
            return 1;
        }

        return (a.approvers.at(0)?.displayName ?? '-1').localeCompare(b.approvers.at(0)?.displayName ?? '-1');
    });

    // Add a default workflow if one doesn't exist (no employees submit to the default approver)
    const firstWorkflow = sortedApprovalWorkflows.at(0);
    if (firstWorkflow && !firstWorkflow.isDefault) {
        sortedApprovalWorkflows.unshift({
            members: [],
            approvers: calculateApprovers({employees, firstEmail: defaultApprover, personalDetailsByEmail}),
            isDefault: true,
        });
    }

    return {approvalWorkflows: sortedApprovalWorkflows, usedApproverEmails: [...usedApproverEmails], availableMembers: sortedApprovalWorkflows.at(0)?.members ?? []};
}

type ConvertApprovalWorkflowToPolicyEmployeesParams = {
    /**
     * Approval workflow to convert
     */
    approvalWorkflow: ApprovalWorkflow;

    /**
     * The previous employee list before the approval workflow was created
     */
    previousEmployeeList: PolicyEmployeeList;

    /**
     * Members to remove from the approval workflow
     */
    membersToRemove?: Member[];

    /**
     * Approvers to remove from the approval workflow
     */
    approversToRemove?: Approver[];

    /**
     * Mode to use when converting the approval workflow
     */
    type: ValueOf<typeof CONST.APPROVAL_WORKFLOW.TYPE>;
};

/**
 * This function converts an approval workflow into a list of policy employees.
 * An optimized list is created that contains only the updated employees to maintain minimal data changes.
 */
function convertApprovalWorkflowToPolicyEmployees({
    approvalWorkflow,
    previousEmployeeList,
    membersToRemove,
    approversToRemove,
    type,
}: ConvertApprovalWorkflowToPolicyEmployeesParams): PolicyEmployeeList {
    const updatedEmployeeList: PolicyEmployeeList = {};
    const firstApprover = approvalWorkflow.approvers.at(0);

    if (!firstApprover) {
        throw new Error('Approval workflow must have at least one approver');
    }

    const pendingAction = type === CONST.APPROVAL_WORKFLOW.TYPE.CREATE ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    approvalWorkflow.approvers.forEach((approver, index) => {
        const nextApprover = approvalWorkflow.approvers.at(index + 1);
        const forwardsTo = type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : nextApprover?.email ?? '';

        // For every approver, we check if the forwardsTo field has changed.
        // If it has, we update the employee list with the new forwardsTo value.
        if (previousEmployeeList[approver.email]?.forwardsTo === forwardsTo) {
            return;
        }

        updatedEmployeeList[approver.email] = {
            email: approver.email,
            forwardsTo,
            pendingAction,
        };
    });

    approvalWorkflow.members.forEach(({email}) => {
        const submitsTo = type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : firstApprover.email ?? '';

        // For every member, we check if the submitsTo field has changed.
        // If it has, we update the employee list with the new submitsTo value.
        if (previousEmployeeList[email]?.submitsTo === submitsTo) {
            return;
        }

        updatedEmployeeList[email] = {
            ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
            submitsTo,
            pendingAction,
        };
    });

    // For each member to remove, we update the employee list with submitsTo set to ''
    // which will set the submitsTo field to the default approver email on backend.
    membersToRemove?.forEach(({email}) => {
        updatedEmployeeList[email] = {
            ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
            submitsTo: '',
            pendingAction,
        };
    });

    // For each approver to remove, we update the employee list with forwardsTo set to ''
    // which will reset the forwardsTo on the backend.
    approversToRemove?.forEach(({email}) => {
        updatedEmployeeList[email] = {
            ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
            forwardsTo: '',
            pendingAction,
        };
    });

    return updatedEmployeeList;
}

export {calculateApprovers, convertPolicyEmployeesToApprovalWorkflows, convertApprovalWorkflowToPolicyEmployees, INITIAL_APPROVAL_WORKFLOW};
