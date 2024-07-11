/* eslint-disable @typescript-eslint/naming-convention */
import {app} from 'electron';
import type * as OnyxCommon from './OnyxCommon';

/** Model of policy employee */
type PolicyEmployee = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Role of the user in the policy */
    role?: string;

    /** Email of the user */
    email?: string;

    /** Determines if this employee should approve a report. If report total > approvalLimit, next approver will be 'overLimitForwardsTo', otherwise 'forwardsTo' */
    approvalLimit?: number;

    /** Email of the user this user forwards all approved reports to (when report total under 'approvalLimit' or when 'overLimitForwardsTo' is not set) */
    forwardsTo?: string;

    /** Email of the user this user submits all reports to */
    submitsTo?: string;

    /** Email of the user this user forwards all reports to when the report total is over the 'approvalLimit' */
    overLimitForwardsTo?: string;

    /**
     * Errors from api calls on the specific user
     * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
     */
    errors?: OnyxCommon.Errors;
}>;

/** Record of policy employees, indexed by their email */
type PolicyEmployeeList = Record<string, PolicyEmployee>;

export default PolicyEmployee;
export type {PolicyEmployeeList};

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
     * If report total > approvalLimit, next approver will be 'overLimitForwardsTo'
     */
    approvalLimit?: number;
    /**
     * Email of the user this user forwards all reports to when the report total is over the 'approvalLimit'
     */
    overLimitForwardsTo?: string;

    /**
     * Is this approver in more than one workflow
     */
    isApproverInMultipleWorkflows?: boolean;
};

/**
 * Approval workflow for a group of employees
 */
// eslint-disable-next-line rulesdir/no-inline-named-export
export type ApprovalWorkflow = {
    /**
     * List of member emails in the workflow
     */
    memberEmails: string[];

    /**
     * List of approvers in the workflow
     */
    approvers: Approver[];

    /**
     * Is this the default workflow
     */
    isDefault: boolean;

    /**
     * Does this workflow have approval limits
     */
    approvalLimits: boolean;
};

/**
 * Default workflow settings
 */
type DefaultWorkflowSettings = {
    /**
     * Email of the default approver
     */
    submitsTo: string;
};

/**
 *
 */
function getApprovers(employees: PolicyEmployeeList, email: string): Approver[] {
    const approvers: Approver[] = [];
    let approverEmail: string = email;

    while (approverEmail) {
        const {forwardsTo, approvalLimit, overLimitForwardsTo} = employees[approverEmail];

        approvers.push({
            email: approverEmail,
            forwardsTo,
            approvalLimit,
            overLimitForwardsTo,
        });

        if (forwardsTo) {
            approverEmail = forwardsTo;
        } else {
            break;
        }
    }

    return approvers;
}

/**
 * 
 */
type ApprovalWorkflows = {
    /**
     * List of approval workflows
     */
    approvalWorkflows: ApprovalWorkflow[];
    /**
     * List of available approvers
     */
    availableApproverEmails: string[];
    /**
     * List of available members
     */
    availableMemberEmails: string[];
};

/**
 * Transforms policy employees to approval workflows
 */
function convertPolicyEmployeesToApprovalWorkflows(employees: PolicyEmployeeList, defaultWorkflowSettings: DefaultWorkflowSettings): ApprovalWorkflows {
    const approvalWorkflows: Record<string, ApprovalWorkflow> = {};

    Object.values(employees).forEach((employee) => {
        const {email, submitsTo} = employee;
        if (!email || !submitsTo) {
            return;
        }

        if (approvalWorkflows[submitsTo]) {
            approvalWorkflows[submitsTo].memberEmails.push(email);
        } else {
            const approvers = getApprovers(employees, submitsTo);
            approvalWorkflows[submitsTo] = {
                memberEmails: [email],
                approvers,
                isDefault: defaultWorkflowSettings.submitsTo === submitsTo,
                approvalLimits: approvers.some((approver) => !!approver.approvalLimit && !!approver.overLimitForwardsTo),
            };
        }
    });

    return {approvalWorkflows: Object.values(approvalWorkflows), availableApproverEmails: [], availableMemberEmails: []};
}

const test: PolicyEmployeeList = {
    'blazej.kustra+manager@swmansion.com': {
        role: 'user',
        approvalLimit: 100000,
        email: 'blazej.kustra+manager@swmansion.com',
        forwardsTo: 'blazej.kustra+director@swmansion.com',
        overLimitForwardsTo: 'blazej.kustra+finance@swmansion.com',
        submitsTo: 'blazej.kustra+default-approver@swmansion.com',
    },
    'blazej.kustra+director@swmansion.com': {role: 'user', email: 'blazej.kustra+director@swmansion.com', submitsTo: 'blazej.kustra+default-approver@swmansion.com'},
    'blazej.kustra+finance@swmansion.com': {role: 'user', email: 'blazej.kustra+finance@swmansion.com', submitsTo: 'blazej.kustra+default-approver@swmansion.com'},
    'blazej.kustra+vp@swmansion.com': {role: 'user', email: 'blazej.kustra+vp@swmansion.com', submitsTo: 'blazej.kustra+default-approver@swmansion.com'},
    'blazej.kustra+1@swmansion.com': {
        email: 'blazej.kustra+1@swmansion.com',
        forwardsTo: 'blazej.kustra+manager@swmansion.com',
        role: 'user',
        submitsTo: 'blazej.kustra+manager@swmansion.com',
    },
    'blazej.kustra+2@swmansion.com': {email: 'blazej.kustra+2@swmansion.com', forwardsTo: 'blazej.kustra@swmansion.com', role: 'user', submitsTo: 'blazej.kustra+1@swmansion.com'},
    'blazej.kustra+3@swmansion.com': {
        email: 'blazej.kustra+3@swmansion.com',
        forwardsTo: 'blazej.kustra+manager@swmansion.com',
        role: 'user',
        submitsTo: 'blazej.kustra+manager@swmansion.com',
    },
    'blazej.kustra+4@swmansion.com': {email: 'blazej.kustra+4@swmansion.com', role: 'user', submitsTo: 'blazej.kustra+default-approver@swmansion.com'},
    'blazej.kustra+5@swmansion.com': {email: 'blazej.kustra+5@swmansion.com', role: 'user', submitsTo: 'blazej.kustra+default-approver@swmansion.com'},
    'blazej.kustra+default-approver@swmansion.com': {email: 'blazej.kustra+default-approver@swmansion.com', role: 'user', submitsTo: 'blazej.kustra+default-approver@swmansion.com'},
    'blazej.kustra@swmansion.com': {email: 'blazej.kustra@swmansion.com', role: 'admin', submitsTo: 'blazej.kustra+manager@swmansion.com'},
    'tgolen+100@gmail.com': {email: 'tgolen+100@gmail.com', role: 'user', submitsTo: 'blazej.kustra+manager@swmansion.com'},
    'tgolen@expensify.com': {email: 'tgolen@expensify.com', forwardsTo: '', role: 'admin', submitsTo: 'blazej.kustra+manager@swmansion.com'},
    'cmartins@expensify.com': {role: 'admin', email: 'cmartins@expensify.com', submitsTo: 'blazej.kustra+manager@swmansion.com'},
};

const workflows = convertPolicyEmployeesToApprovalWorkflows(test, {submitsTo: 'blazej.kustra+default-approver@swmansion.com'});

console.log(`workflows = `, JSON.stringify(workflows, null, 2));

const result = [
    {
        memberEmails: [
            'blazej.kustra+manager@swmansion.com',
            'blazej.kustra+director@swmansion.com',
            'blazej.kustra+finance@swmansion.com',
            'blazej.kustra+vp@swmansion.com',
            'blazej.kustra+4@swmansion.com',
            'blazej.kustra+5@swmansion.com',
            'blazej.kustra+default-approver@swmansion.com',
        ],
        approvers: [
            {
                email: 'blazej.kustra+default-approver@swmansion.com',
            },
        ],
        isDefault: true,
        approvalLimits: false,
    },
    {
        memberEmails: [
            'blazej.kustra+1@swmansion.com',
            'blazej.kustra+3@swmansion.com',
            'blazej.kustra@swmansion.com',
            'tgolen+100@gmail.com',
            'tgolen@expensify.com',
            'cmartins@expensify.com',
        ],
        approvers: [
            {
                email: 'blazej.kustra+manager@swmansion.com',
                forwardsTo: 'blazej.kustra+director@swmansion.com',
                approvalLimit: 100000,
                overLimitForwardsTo: 'blazej.kustra+finance@swmansion.com',
            },
            {
                email: 'blazej.kustra+director@swmansion.com',
            },
        ],
        isDefault: false,
        approvalLimits: true,
    },
    {
        memberEmails: ['blazej.kustra+2@swmansion.com'],
        approvers: [
            {
                email: 'blazej.kustra+1@swmansion.com',
                forwardsTo: 'blazej.kustra+manager@swmansion.com',
            },
            {
                email: 'blazej.kustra+manager@swmansion.com',
                forwardsTo: 'blazej.kustra+director@swmansion.com',
                approvalLimit: 100000,
                overLimitForwardsTo: 'blazej.kustra+finance@swmansion.com',
            },
            {
                email: 'blazej.kustra+director@swmansion.com',
            },
        ],
        isDefault: false,
        approvalLimits: true,
    },
];
