import {Str} from 'expensify-common';
import lodashMapKeys from 'lodash/mapKeys';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {BankAccountList} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
import {isBankAccountPartiallySetup} from './BankAccountUtils';
import {convertToDisplayString} from './CurrencyUtils';
import {getDefaultApprover} from './PolicyUtils';

const INITIAL_APPROVAL_WORKFLOW: ApprovalWorkflowOnyx = {
    members: [],
    approvers: [],
    availableMembers: [],
    usedApproverEmails: [],
    isDefault: false,
    action: CONST.APPROVAL_WORKFLOW.ACTION.CREATE,
    originalApprovers: [],
    isInitialFlow: true,
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
        const employee = employees[nextEmail];
        approvers.push({
            email: nextEmail,
            forwardsTo: employee.forwardsTo,
            avatar: personalDetailsByEmail[nextEmail]?.avatar,
            displayName: personalDetailsByEmail[nextEmail]?.displayName ?? nextEmail,
            isCircularReference,
            approvalLimit: employee.approvalLimit,
            overLimitForwardsTo: employee.overLimitForwardsTo,
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
    /** Policy data containing employees and approver information */
    policy: OnyxEntry<Policy>;

    /** Personal details of the employees */
    personalDetails: PersonalDetailsList;

    /** Email of the first approver in current edited workflow */
    firstApprover?: string;

    /** Locale comparison function */
    localeCompare: LocaleContextProps['localeCompare'];
};

type PolicyConversionResult = {
    /** List of approval workflows */
    approvalWorkflows: ApprovalWorkflow[];

    /** List of available members that can be selected in the workflow */
    availableMembers: Member[];

    /** Emails that are used as approvers in currently configured workflows */
    usedApproverEmails: string[];
};

/** Convert a list of policy employees to a list of approval workflows */
function convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, firstApprover, localeCompare}: PolicyConversionParams): PolicyConversionResult {
    const employees = policy?.employeeList ?? {};
    const defaultApprover = getDefaultApprover(policy);
    const approvalWorkflows: Record<string, ApprovalWorkflow> = {};

    // Keep track of used approver emails to display hints in the UI
    const usedApproverEmails = new Set<string>();
    const personalDetailsByEmail = lodashMapKeys(personalDetails, (value, key) => value?.login ?? key);

    // Add each employee to the appropriate workflow
    for (const employee of Object.values(employees)) {
        const {email, submitsTo, pendingAction} = employee;
        if (!email || !submitsTo || !employees[submitsTo]) {
            continue;
        }

        const member: Member = {
            email,
            avatar: personalDetailsByEmail[email]?.avatar,
            displayName: personalDetailsByEmail[email]?.displayName ?? email,
            pendingFields: employee.pendingFields,
        };

        if (!approvalWorkflows[submitsTo]) {
            const approvers = calculateApprovers({employees, firstEmail: submitsTo, personalDetailsByEmail});
            if (submitsTo !== firstApprover) {
                for (const approver of approvers) {
                    usedApproverEmails.add(approver.email);
                }
            }

            // Only set ADD/UPDATE pending actions on the workflow, not DELETE
            // When a member is being deleted from the workspace, their DELETE pending action
            // should not affect the workflow's display state
            const workflowPendingAction = pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? pendingAction : undefined;

            approvalWorkflows[submitsTo] = {
                members: [],
                approvers,
                isDefault: defaultApprover === submitsTo,
                pendingAction: workflowPendingAction,
            };
        }

        approvalWorkflows[submitsTo].members.push(member);
        // Only propagate ADD/UPDATE pending actions to the workflow, not DELETE
        // When a member is being deleted from the workspace, their DELETE pending action
        // should not affect the workflow's display state (e.g., strikethrough styling)
        if (pendingAction && pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            approvalWorkflows[submitsTo].pendingAction = pendingAction;
        }
    }

    // Sort the workflows by the first approver's name (default workflow has priority)
    const sortedApprovalWorkflows = Object.values(approvalWorkflows).sort((a, b) => {
        if (a.isDefault) {
            return -1;
        }

        if (b.isDefault) {
            return 1;
        }

        return localeCompare(a.approvers.at(0)?.displayName ?? '', b.approvers.at(0)?.displayName ?? '');
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

    const availableMembers =
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.BASIC ? sortedApprovalWorkflows?.flatMap((workflow) => workflow.members) : (sortedApprovalWorkflows.at(0)?.members ?? []);

    return {approvalWorkflows: sortedApprovalWorkflows, usedApproverEmails: [...usedApproverEmails], availableMembers};
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

    /**
     * The email of the default approver
     */
    defaultApprover?: string;
};

type UpdateWorkflowDataOnApproverRemovalParams = {
    /**
     * An array of approval workflows that need to be updated.
     */
    approvalWorkflows: ApprovalWorkflow[];
    /**
     * The email of the approver being removed
     */
    removedApprover: PersonalDetails;
    /**
     * The email of the workspace owner
     */
    ownerDetails: PersonalDetails;
};

type UpdateWorkflowDataOnApproverRemovalResult = Array<
    ApprovalWorkflow & {
        /**
         * @property {boolean} [removeApprovalWorkflow] - A flag that determines if the approval workflow should be removed.
         *   - `true`: Indicates the approval workflow needs to be removed.
         *   - `false` or `undefined`: No removal is required; the workflow will be updated instead.
         */
        removeApprovalWorkflow?: boolean;
    }
>;

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
    defaultApprover,
}: ConvertApprovalWorkflowToPolicyEmployeesParams): PolicyEmployeeList {
    const updatedEmployeeList: PolicyEmployeeList = {};
    const firstApprover = approvalWorkflow.approvers.at(0);

    if (!firstApprover) {
        throw new Error('Approval workflow must have at least one approver');
    }

    const pendingAction = type === CONST.APPROVAL_WORKFLOW.TYPE.CREATE ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    for (const [index, approver] of approvalWorkflow.approvers.entries()) {
        const nextApprover = approvalWorkflow.approvers.at(index + 1);
        const forwardsTo = type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : (nextApprover?.email ?? '');
        const approvalLimit = type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? null : approver.approvalLimit;
        const overLimitForwardsTo = type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : (approver.overLimitForwardsTo ?? '');

        // For every approver, we check if the forwardsTo, approvalLimit, or overLimitForwardsTo fields have changed.
        const previousEmployee = previousEmployeeList[approver.email];
        const forwardsToChanged = previousEmployee?.forwardsTo !== forwardsTo;
        const approvalLimitChanged = previousEmployee?.approvalLimit !== approvalLimit;
        const overLimitForwardsToChanged = previousEmployee?.overLimitForwardsTo !== overLimitForwardsTo;

        if (!forwardsToChanged && !approvalLimitChanged && !overLimitForwardsToChanged) {
            continue;
        }

        const previousPendingAction = previousEmployee?.pendingAction;
        updatedEmployeeList[approver.email] = {
            email: approver.email,
            forwardsTo,
            ...(approvalLimitChanged ? {approvalLimit} : {}),
            ...(overLimitForwardsToChanged ? {overLimitForwardsTo} : {}),
            pendingAction: previousPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? previousPendingAction : pendingAction,
            pendingFields: {
                ...(forwardsToChanged ? {forwardsTo: pendingAction} : {}),
                ...(approvalLimitChanged ? {approvalLimit: pendingAction} : {}),
                ...(overLimitForwardsToChanged ? {overLimitForwardsTo: pendingAction} : {}),
            },
        };
    }

    for (const {email} of approvalWorkflow.members) {
        const submitsTo = type === CONST.APPROVAL_WORKFLOW.TYPE.REMOVE ? '' : (firstApprover.email ?? '');

        // For every member, we check if the submitsTo field has changed.
        // If it has, we update the employee list with the new submitsTo value.
        if (previousEmployeeList[email]?.submitsTo === submitsTo) {
            continue;
        }

        updatedEmployeeList[email] = {
            ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
            submitsTo,
            pendingAction,
            pendingFields: {
                submitsTo: pendingAction,
            },
        };
    }

    // For each member to remove, we update the employee list with submitsTo set to ''
    // which will set the submitsTo field to the default approver email on backend.
    if (membersToRemove) {
        for (const {email} of membersToRemove) {
            updatedEmployeeList[email] = {
                ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
                submitsTo: defaultApprover,
                pendingAction,
            };
        }
    }

    // For each approver to remove, we update the employee list with forwardsTo set to ''
    // which will reset the forwardsTo on the backend.
    if (approversToRemove) {
        for (const {email} of approversToRemove) {
            updatedEmployeeList[email] = {
                ...(updatedEmployeeList[email] ? updatedEmployeeList[email] : {email}),
                forwardsTo: '',
                pendingAction,
            };
        }
    }

    return updatedEmployeeList;
}

function updateWorkflowDataOnApproverRemoval({approvalWorkflows, removedApprover, ownerDetails}: UpdateWorkflowDataOnApproverRemovalParams): UpdateWorkflowDataOnApproverRemovalResult {
    const defaultWorkflow = approvalWorkflows.find((workflow) => workflow.isDefault);
    const removedApproverEmail = removedApprover.login;
    const ownerEmail = ownerDetails.login;
    const ownerAvatar = ownerDetails.avatar ?? '';
    const ownerDisplayName = ownerDetails.displayName ?? '';

    return approvalWorkflows.flatMap((workflow) => {
        const [currentApprover] = workflow.approvers;
        const isSingleApprover = workflow.approvers.length === 1;
        const isMultipleApprovers = workflow.approvers.length > 1;
        const isApproverToRemove = currentApprover?.email === removedApproverEmail;
        const defaultHasOwner = defaultWorkflow?.approvers.some((approver) => approver.email === ownerEmail);

        if (workflow.isDefault) {
            // Handle default workflow
            if (isSingleApprover && isApproverToRemove && currentApprover?.email !== ownerEmail) {
                return {
                    ...workflow,
                    approvers: [
                        {
                            ...currentApprover,
                            avatar: ownerAvatar,
                            displayName: ownerDisplayName,
                            email: ownerEmail ?? '',
                        },
                    ],
                };
            }

            const hasOverLimitToRemovedApprover = workflow.approvers.some((item) => item.overLimitForwardsTo === removedApproverEmail);
            if (hasOverLimitToRemovedApprover) {
                const approversWithClearedOverLimit = workflow.approvers.map((item) =>
                    item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', approvalLimit: null} : item,
                );
                return {
                    ...workflow,
                    approvers: approversWithClearedOverLimit,
                };
            }

            return workflow;
        }

        if (isSingleApprover) {
            // Remove workflows with a single approver when owner is the approver
            if (currentApprover?.email === ownerEmail) {
                return {
                    ...workflow,
                    removeApprovalWorkflow: true,
                };
            }

            // Handle case where the approver is to be removed
            if (isApproverToRemove) {
                // Remove workflow if the default workflow includes the owner or approver is to be replaced
                if (defaultHasOwner) {
                    return {
                        ...workflow,
                        removeApprovalWorkflow: true,
                    };
                }

                // Replace the approver with owner details
                return {
                    ...workflow,
                    approvers: [
                        {
                            ...currentApprover,
                            avatar: ownerAvatar,
                            displayName: ownerDisplayName,
                            email: ownerEmail ?? '',
                        },
                    ],
                };
            }
        }

        if (isMultipleApprovers && workflow.approvers.some((item) => item.email === removedApproverEmail)) {
            const removedApproverIndex = workflow.approvers.findIndex((item) => item.email === removedApproverEmail);

            // If the removed approver is the first in the list, return an empty array
            if (removedApproverIndex === 0) {
                return {
                    ...workflow,
                    removeApprovalWorkflow: true,
                };
            }

            const updateApprovers = workflow.approvers.slice(0, removedApproverIndex);
            const updateApproversHasOwner = updateApprovers.some((approver) => approver.email === ownerEmail);

            // If the owner is already in the approvers list, return the workflow with the updated approvers
            // but still clear overLimitForwardsTo if it points to the removed member
            if (updateApproversHasOwner) {
                const approversWithClearedOverLimit = updateApprovers.map((item) =>
                    item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', approvalLimit: null} : item,
                );
                return {
                    ...workflow,
                    approvers: approversWithClearedOverLimit,
                };
            }

            // Update forwardsTo and overLimitForwardsTo if necessary and prepare the new approver object
            const updatedApprovers = updateApprovers.flatMap((item) => {
                let updatedItem = item;
                if (item.forwardsTo === removedApproverEmail) {
                    updatedItem = {...updatedItem, forwardsTo: ownerEmail};
                }
                if (item.overLimitForwardsTo === removedApproverEmail) {
                    updatedItem = {...updatedItem, overLimitForwardsTo: '', approvalLimit: null};
                }
                return updatedItem;
            });

            const newApprover = {
                email: ownerEmail ?? '',
                forwardsTo: undefined,
                avatar: ownerDetails?.avatar ?? '',
                displayName: ownerDetails?.displayName ?? '',
                isCircularReference: workflow.approvers.at(removedApproverIndex)?.isCircularReference,
            };

            return {
                ...workflow,
                approvers: [...updatedApprovers, newApprover],
            };
        }

        // For any other workflow, check if any approver has overLimitForwardsTo pointing to the removed member
        const hasOverLimitToRemovedApprover = workflow.approvers.some((item) => item.overLimitForwardsTo === removedApproverEmail);
        if (hasOverLimitToRemovedApprover) {
            const approversWithClearedOverLimit = workflow.approvers.map((item) =>
                item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', approvalLimit: null} : item,
            );
            return {
                ...workflow,
                approvers: approversWithClearedOverLimit,
            };
        }

        // Return the unchanged workflow in other cases
        return workflow;
    });
}

/**
 * Get eligible business bank accounts for the workspace reimbursement workflow
 */
function getEligibleExistingBusinessBankAccounts(bankAccountList: BankAccountList | undefined, policyCurrency: string | undefined, shouldIncludePartiallySetup?: boolean) {
    if (!bankAccountList || policyCurrency === undefined) {
        return [];
    }

    return Object.values(bankAccountList).filter((account) => {
        return (
            account.bankCurrency === policyCurrency &&
            (account.accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN || (shouldIncludePartiallySetup && isBankAccountPartiallySetup(account.accountData?.state))) &&
            account.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS
        );
    });
}

type GetApprovalLimitDescriptionParams = {
    approver: Approver | undefined;
    currency: string;
    translate: LocaleContextProps['translate'];
    personalDetailsByEmail: PersonalDetailsList | undefined;
};

/**
 * Get the approval limit description for an approver (e.g., "Reports above $1,000 forward to John Doe")
 */
function getApprovalLimitDescription({approver, currency, translate, personalDetailsByEmail}: GetApprovalLimitDescriptionParams): string | undefined {
    if (approver?.approvalLimit == null || !approver?.overLimitForwardsTo) {
        return undefined;
    }

    const formattedAmount = convertToDisplayString(approver.approvalLimit, currency);
    const overLimitApproverDetails = personalDetailsByEmail?.[approver.overLimitForwardsTo];
    const approverDisplayName = Str.removeSMSDomain(overLimitApproverDetails?.displayName ?? approver.overLimitForwardsTo);

    return translate('workflowsApprovalLimitPage.forwardLimitDescription', {
        approvalLimit: formattedAmount,
        approverName: approverDisplayName,
    });
}

/**
 * Returns business bank accounts that are:
 * - It has the same currency as the policy (`bankCurrency === policy.outputCurrency`),
 * - Its state is `OPEN`
 * - Its type is `BUSINESS`,
 * - It's linked to the policy's ACH account.
 *
 * @param bankAccountList - list of bank accounts
 * @param policy - given policy
 */
function getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList: BankAccountList | undefined, policy: OnyxEntry<Policy> | undefined) {
    if (!bankAccountList || policy === undefined) {
        return [];
    }

    return Object.values(bankAccountList).filter((account) => {
        return (
            account.bankCurrency === policy?.outputCurrency &&
            account.accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN &&
            account.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS &&
            account?.accountData?.bankAccountID === policy?.achAccount?.bankAccountID
        );
    });
}

export {
    calculateApprovers,
    convertPolicyEmployeesToApprovalWorkflows,
    convertApprovalWorkflowToPolicyEmployees,
    getApprovalLimitDescription,
    getEligibleExistingBusinessBankAccounts,
    getOpenConnectedToPolicyBusinessBankAccounts,
    INITIAL_APPROVAL_WORKFLOW,
    updateWorkflowDataOnApproverRemoval,
};
