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
            isInMultipleWorkflows: false,
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

type ConvertPolicyEmployeesToApprovalWorkflowsParams = {
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
};

/** Convert a list of policy employees to a list of approval workflows */
function convertPolicyEmployeesToApprovalWorkflows({employees, defaultApprover, personalDetails}: ConvertPolicyEmployeesToApprovalWorkflowsParams): ApprovalWorkflow[] {
    const approvalWorkflows: Record<string, ApprovalWorkflow> = {};

    // Keep track of how many times each approver is used to detect approvers in multiple workflows
    const approverCountsByEmail: Record<string, number> = {};
    const personalDetailsByEmail = lodashMapKeys(personalDetails, (value, key) => value?.login ?? key);

    // Add each employee to the appropriate workflow
    Object.values(employees).forEach((employee) => {
        const {email, submitsTo} = employee;
        if (!email || !submitsTo) {
            return;
        }

        const member: Member = {email, avatar: personalDetailsByEmail[email]?.avatar, displayName: personalDetailsByEmail[email]?.displayName ?? email};
        if (!approvalWorkflows[submitsTo]) {
            const approvers = calculateApprovers({employees, firstEmail: submitsTo, personalDetailsByEmail});
            approvers.forEach((approver) => (approverCountsByEmail[approver.email] = (approverCountsByEmail[approver.email] ?? 0) + 1));

            approvalWorkflows[submitsTo] = {
                members: [],
                approvers,
                isDefault: defaultApprover === submitsTo,
            };
        }
        approvalWorkflows[submitsTo].members.push(member);
    });

    // Sort the workflows by the first approver's name (default workflow has priority)
    const sortedApprovalWorkflows = Object.values(approvalWorkflows).sort((a, b) => {
        if (a.isDefault) {
            return -1;
        }

        if (b.isDefault) {
            return 1;
        }

        return (a.approvers[0]?.displayName ?? '-1').localeCompare(b.approvers[0]?.displayName ?? '-1');
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

    // Add a flag to each approver to indicate if they are in multiple workflows
    return sortedApprovalWorkflows.map((workflow) => ({
        ...workflow,
        approvers: workflow.approvers.map((approver) => ({
            ...approver,
            isInMultipleWorkflows: approverCountsByEmail[approver.email] > 1,
        })),
    }));
}

type ConvertApprovalWorkflowToPolicyEmployeesParams = {
    /**
     * Approval workflow to convert
     */
    approvalWorkflow: ApprovalWorkflow;

    /**
     * Members to remove from the approval workflow
     */
    membersToRemove?: Member[];

    /**
     * Mode to use when converting the approval workflow
     */
    type: ValueOf<typeof CONST.APPROVAL_WORKFLOW.TYPE>;
};

/** Convert an approval workflow to a list of policy employees */
function convertApprovalWorkflowToPolicyEmployees({approvalWorkflow, membersToRemove, type}: ConvertApprovalWorkflowToPolicyEmployeesParams): PolicyEmployeeList {
    const updatedEmployeeList: PolicyEmployeeList = {};
    const firstApprover = approvalWorkflow.approvers.at(0);

    if (!firstApprover) {
        throw new Error('Approval workflow must have at least one approver');
    }

    approvalWorkflow.approvers.forEach((approver, index) => {
        const nextApprover = approvalWorkflow.approvers.at(index + 1);
        updatedEmployeeList[approver.email] = {
            email: approver.email,
            forwardsTo: type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : nextApprover?.email ?? '',
        };
    });

    approvalWorkflow.members.forEach(({email}) => {
        updatedEmployeeList[email] = {
            ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
            submitsTo: type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : firstApprover.email ?? '',
        };
    });

    membersToRemove?.forEach(({email}) => {
        updatedEmployeeList[email] = {
            ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
            submitsTo: '',
        };
    });

    return updatedEmployeeList;
}

export {calculateApprovers, convertPolicyEmployeesToApprovalWorkflows, convertApprovalWorkflowToPolicyEmployees, INITIAL_APPROVAL_WORKFLOW};
