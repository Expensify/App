import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx, Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {
    ApprovalWorkflowAction,
    ApprovalWorkflowActions,
    ApprovalWorkflowFilter,
    ApprovalWorkflowFilterComparison,
    ApprovalWorkflowRule,
    ApprovalWorkflowTriggers,
} from '@src/types/onyx/ApprovalWorkflowRules';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';

import {isBankAccountPartiallySetup} from './BankAccountUtils';
import {getHRAdvancedModeFinalApprover, getHRFinalApprover} from './HRUtils';
import {rand64} from './NumberUtils';
import {getDefaultApprover, isExpensifyTeam, shouldFilterExpensifyTeam} from './PolicyUtils';

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

/** Resolve the display name for an over-limit forwarder email, falling back to the email itself */
function getOverLimitForwardsToDisplayName(overLimitForwardsTo: string | undefined, personalDetailsByEmail: PersonalDetailsList): string | undefined {
    if (!overLimitForwardsTo) {
        return undefined;
    }
    return personalDetailsByEmail[overLimitForwardsTo]?.displayName ?? overLimitForwardsTo;
}

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
            overLimitForwardsToDisplayName: getOverLimitForwardsToDisplayName(employee.overLimitForwardsTo, personalDetailsByEmail),
            pendingAction: employee.pendingAction,
            errors: employee.errors,
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

/** Build a Member from a policy employee using personal details for avatar/displayName */
function buildMemberFromEmployee(employee: PolicyEmployee, personalDetailsByEmail: PersonalDetailsList, email: string): Member {
    return {
        email,
        avatar: personalDetailsByEmail[email]?.avatar,
        displayName: personalDetailsByEmail[email]?.displayName ?? email,
        pendingFields: employee.pendingFields,
    };
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

    /** Current user's login email, used to determine if Expensify team members should be shown */
    currentUserLogin?: string;

    /** The policy's approval-workflow rules keyed by ruleID */
    rules?: Record<string, ApprovalWorkflowRule>;
};

type PolicyConversionResult = {
    /** List of approval workflows */
    approvalWorkflows: ApprovalWorkflow[];

    /** List of available members that can be selected in the workflow */
    availableMembers: Member[];

    /** Emails that are used as approvers in currently configured workflows */
    usedApproverEmails: string[];
};

/**
 * Find the first non-Expensify team member in the approval chain.
 * Used to skip internal Expensify approvers when displaying workflows to customers.
 * Returns undefined if no non-Expensify approver is found in the chain.
 */
function findFirstNonExpensifyApprover(employees: PolicyEmployeeList, startEmail: string): string | undefined {
    let email: string | undefined = startEmail;
    const visited = new Set<string>();

    while (email && !visited.has(email)) {
        if (!isExpensifyTeam(email)) {
            return email;
        }
        visited.add(email);
        email = employees[email]?.forwardsTo;
    }

    return undefined;
}

/** Convert a list of policy employees to a list of approval workflows */
function convertPolicyEmployeesToApprovalWorkflows({policy, personalDetails, firstApprover, localeCompare, currentUserLogin}: PolicyConversionParams): PolicyConversionResult {
    const employees = policy?.employeeList ?? {};
    const defaultApprover = getHRFinalApprover(policy) ?? getDefaultApprover(policy);
    const approvalWorkflows: Record<string, ApprovalWorkflow> = {};
    const shouldFilterOutExpensifyTeam = shouldFilterExpensifyTeam(policy?.owner, currentUserLogin);

    // Keep track of used approver emails to display hints in the UI
    const usedApproverEmails = new Set<string>();
    const personalDetailsByEmail: PersonalDetailsList = {};
    for (const [key, value] of Object.entries(personalDetails)) {
        personalDetailsByEmail[value?.login ?? key] = value;
    }
    const availableMembers: Member[] = [];
    const hrAdvancedModeFinalApproverEmail = getHRAdvancedModeFinalApprover(policy);

    for (const employee of Object.values(employees)) {
        const {email, submitsTo, pendingAction} = employee;
        if (!email) {
            continue;
        }

        // Filter out Expensify team members from appearing as workflow members
        if (shouldFilterOutExpensifyTeam && isExpensifyTeam(email)) {
            continue;
        }

        const member = buildMemberFromEmployee(employee, personalDetailsByEmail, email);

        if (pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            availableMembers.push(member);
        }

        if (!submitsTo || (!employees[submitsTo] && !hrAdvancedModeFinalApproverEmail)) {
            continue;
        }

        // If submitsTo is an Expensify team member, find the first non-Expensify approver in the chain
        const effectiveSubmitsTo = shouldFilterOutExpensifyTeam && employees[submitsTo] ? (findFirstNonExpensifyApprover(employees, submitsTo) ?? submitsTo) : submitsTo;

        if (!approvalWorkflows[effectiveSubmitsTo]) {
            let approvers = calculateApprovers({employees, firstEmail: effectiveSubmitsTo, personalDetailsByEmail});
            if (approvers.length === 0) {
                approvers = [
                    {
                        email: effectiveSubmitsTo,
                        forwardsTo: undefined,
                        avatar: personalDetailsByEmail[effectiveSubmitsTo]?.avatar,
                        displayName: personalDetailsByEmail[effectiveSubmitsTo]?.displayName ?? effectiveSubmitsTo,
                        isCircularReference: false,
                    },
                ];
            }
            if (shouldFilterOutExpensifyTeam) {
                approvers = approvers.filter((approver) => !isExpensifyTeam(approver.email));
            }
            if (hrAdvancedModeFinalApproverEmail) {
                const lastApprover = approvers.at(-1);
                if (lastApprover && lastApprover.email !== hrAdvancedModeFinalApproverEmail) {
                    approvers.push({
                        email: hrAdvancedModeFinalApproverEmail,
                        forwardsTo: undefined,
                        avatar: personalDetailsByEmail[hrAdvancedModeFinalApproverEmail]?.avatar,
                        displayName: personalDetailsByEmail[hrAdvancedModeFinalApproverEmail]?.displayName ?? hrAdvancedModeFinalApproverEmail,
                        isCircularReference: false,
                    });
                    usedApproverEmails.add(hrAdvancedModeFinalApproverEmail);
                }
            }
            if (effectiveSubmitsTo !== firstApprover) {
                for (const approver of approvers) {
                    usedApproverEmails.add(approver.email);
                }
            }

            // Only set ADD/UPDATE pending actions on the workflow, not DELETE
            // When a member is being deleted from the workspace, their DELETE pending action
            // should not affect the workflow's display state
            const workflowPendingAction = pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? pendingAction : undefined;

            approvalWorkflows[effectiveSubmitsTo] = {
                members: [],
                approvers,
                isDefault: defaultApprover === effectiveSubmitsTo,
                pendingAction: workflowPendingAction,
            };
        }

        if (pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            approvalWorkflows[effectiveSubmitsTo].members.push(member);
        }
        // Only propagate ADD/UPDATE pending actions to the workflow, not DELETE
        // When a member is being deleted from the workspace, their DELETE pending action
        // should not affect the workflow's display state (e.g., strikethrough styling)
        if (pendingAction && pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            approvalWorkflows[effectiveSubmitsTo].pendingAction = pendingAction;
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

    // availableMembers built in loop above: all employees with email, excluding pending delete.
    // Includes members with orphaned submitsTo/forwardsTo so admins can fix chains from Expenses From picker.
    // See https://github.com/Expensify/Expensify/issues/598876
    availableMembers.sort((a, b) => localeCompare(a.displayName ?? a.email, b.displayName ?? b.email));

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
            const isMultiApproverWithRemovedInList = isMultipleApprovers && workflow.approvers.some((item) => item.email === removedApproverEmail);
            if (hasOverLimitToRemovedApprover && !isMultiApproverWithRemovedInList) {
                const approversWithClearedOverLimit = workflow.approvers.map((item) =>
                    item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', overLimitForwardsToDisplayName: undefined, approvalLimit: null} : item,
                );
                return {
                    ...workflow,
                    approvers: approversWithClearedOverLimit,
                };
            }

            if (isMultiApproverWithRemovedInList) {
                const removedApproverIndex = workflow.approvers.findIndex((item) => item.email === removedApproverEmail);

                const updateApprovers = workflow.approvers.slice(0, removedApproverIndex);
                const updateApproversHasOwner = updateApprovers.some((approver) => approver.email === ownerEmail);

                // If the removed approver is the first in the list, keep the remaining chain
                if (removedApproverIndex === 0) {
                    const remainingApprovers = workflow.approvers
                        .slice(1)
                        .map((item) =>
                            item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', overLimitForwardsToDisplayName: undefined, approvalLimit: null} : item,
                        );
                    return {
                        ...workflow,
                        approvers: remainingApprovers,
                    };
                }

                // If the owner is already in the approvers list, return the workflow with the updated approvers
                // but still clear overLimitForwardsTo if it points to the removed member
                if (updateApproversHasOwner) {
                    const approversWithClearedOverLimit = updateApprovers.map((item) =>
                        item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', overLimitForwardsToDisplayName: undefined, approvalLimit: null} : item,
                    );
                    return {
                        ...workflow,
                        approvers: approversWithClearedOverLimit,
                    };
                }

                // Update forwardsTo and overLimitForwardsTo if necessary and prepare the new approver object
                const updatedApprovers = updateApprovers.map((item) => {
                    let updatedItem = item;
                    if (item.forwardsTo === removedApproverEmail) {
                        updatedItem = {...updatedItem, forwardsTo: ownerEmail};
                    }
                    if (item.overLimitForwardsTo === removedApproverEmail) {
                        updatedItem = {...updatedItem, overLimitForwardsTo: '', overLimitForwardsToDisplayName: undefined, approvalLimit: null};
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
                    item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', overLimitForwardsToDisplayName: undefined, approvalLimit: null} : item,
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
                    updatedItem = {...updatedItem, overLimitForwardsTo: '', overLimitForwardsToDisplayName: undefined, approvalLimit: null};
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
                item.overLimitForwardsTo === removedApproverEmail ? {...item, overLimitForwardsTo: '', overLimitForwardsToDisplayName: undefined, approvalLimit: null} : item,
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
function getEligibleExistingBusinessBankAccounts(
    bankAccountList: BankAccountList | undefined,
    policyCurrency: string | undefined,
    shouldIncludePartiallySetup?: boolean,
    excludeBankAccountID?: number,
) {
    if (!bankAccountList || policyCurrency === undefined) {
        return [];
    }

    return Object.values(bankAccountList).filter((account) => {
        return (
            account.bankCurrency === policyCurrency &&
            (account.accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN || (shouldIncludePartiallySetup && isBankAccountPartiallySetup(account.accountData?.state))) &&
            account.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS &&
            account.methodID !== excludeBankAccountID
        );
    });
}

type GetApprovalLimitDescriptionParams = {
    approver: Approver | undefined;
    currency: string;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

/**
 * Get the approval limit description for an approver (e.g., "Reports above $1,000 forward to John Doe")
 */
function getApprovalLimitDescription({approver, currency, translate, convertToDisplayString}: GetApprovalLimitDescriptionParams): string | undefined {
    if (approver?.approvalLimit == null || !approver?.overLimitForwardsTo) {
        return undefined;
    }

    const formattedAmount = convertToDisplayString(approver.approvalLimit, currency);
    const approverDisplayName = Str.removeSMSDomain(approver.overLimitForwardsToDisplayName ?? approver.overLimitForwardsTo);

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

/**
 * Combine workflow members with available members, deduplicating by email.
 */
function mergeWorkflowMembersWithAvailableMembers(workflowMembers: Member[], allAvailableMembers: Member[]): Member[] {
    const memberEmails = new Set(workflowMembers.map((m) => m.email));
    const additionalMembers = allAvailableMembers.filter((m) => !memberEmails.has(m.email));
    return [...workflowMembers, ...additionalMembers];
}

type ApprovalWorkflowRulesDiff = Record<string, ApprovalWorkflowRule | null>;

function buildComparison(
    left: ApprovalWorkflowFilterComparison['left'],
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>,
    right: ApprovalWorkflowFilterComparison['right'],
): ApprovalWorkflowFilterComparison {
    return {operator, left, right};
}

function buildAnd(left: ApprovalWorkflowFilter['left'], right: ApprovalWorkflowFilter['right']): ApprovalWorkflowFilter {
    return {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left, right};
}

function buildSubmitterFilter(memberEmails: string[]): ApprovalWorkflowFilterComparison {
    return buildComparison(CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, [...memberEmails]);
}

function buildToComparison(email: string): ApprovalWorkflowFilterComparison {
    return buildComparison(CONST.SEARCH.SYNTAX_FILTER_KEYS.TO, CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, email);
}

/** The index-keyed object shape the rules API uses for lists (`['a', 'b'] -> {'0': 'a', '1': 'b'}`). */
function toIndexMap<T>(values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

function buildSubmitTriggers(): ApprovalWorkflowTriggers {
    return toIndexMap([CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT]);
}

function buildApproveTriggers(): ApprovalWorkflowTriggers {
    return toIndexMap([CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_APPROVE]);
}

function buildForwardActions(approver: string): ApprovalWorkflowActions {
    return toIndexMap([{name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver}]);
}

function buildApproveActions(): ApprovalWorkflowActions {
    return toIndexMap([{name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.APPROVE_REPORT}]);
}

/**
 * Build the AST rule chain for a single `ApprovalWorkflow`: a `ReportSubmit` rule forwarding members'
 * reports to the first approver, plus a `ReportApprove` rule per approver describing the next hop
 * (forward to the next approver, approve if last, or split on the approver's over-limit target).
 */
function getWorkflowMemberEmails(members: Member[]): string[] {
    return members.map((member) => member.email).filter((email): email is string => !!email);
}

function buildApprovalWorkflowRules(approvalWorkflow: ApprovalWorkflow): ApprovalWorkflowRule[] {
    const memberEmails = getWorkflowMemberEmails(approvalWorkflow.members);
    const approvers = approvalWorkflow.approvers;

    if (memberEmails.length === 0 || approvers.length === 0) {
        return [];
    }

    const firstApproverEmail = approvers.at(0)?.email;
    if (!firstApproverEmail) {
        return [];
    }

    const fromComparison = buildSubmitterFilter(memberEmails);
    const rules: ApprovalWorkflowRule[] = [];

    /**
     * An approver's approval limit decides who holds the report at that position, not where it goes afterwards: a
     * report over the limit is received by `overLimitForwardsTo` *instead of* the approver, and then carries on to the
     * next approver as normal. So each position has one or two people who can hold it, and the hop into the position
     * is what branches on the amount.
     */
    const holdersAtPosition = approvers.map((approver) => {
        const hasLimitSplit = !!approver.approvalLimit && approver.approvalLimit > 0 && !!approver.overLimitForwardsTo;
        return {
            underLimitEmail: approver.email,
            overLimitEmail: hasLimitSplit ? approver.overLimitForwardsTo : undefined,
            limit: hasLimitSplit ? approver.approvalLimit : undefined,
        };
    });

    /** The rules routing a report into `position`, from either submission or the approvers at the position before. */
    const buildRulesIntoPosition = (position: number): ApprovalWorkflowRule[] => {
        const holders = holdersAtPosition.at(position);
        if (!holders?.underLimitEmail) {
            return [];
        }

        const isFirstPosition = position === 0;
        const triggers = isFirstPosition ? buildSubmitTriggers() : buildApproveTriggers();

        // Everyone who can hold the previous position routes onward the same way, so each of them needs a rule.
        const previousHolders = isFirstPosition ? [undefined] : [holdersAtPosition.at(position - 1)?.underLimitEmail, holdersAtPosition.at(position - 1)?.overLimitEmail];

        const rulesIntoPosition: ApprovalWorkflowRule[] = [];
        for (const previousHolderEmail of previousHolders) {
            if (!isFirstPosition && !previousHolderEmail) {
                continue;
            }

            const source = previousHolderEmail ? buildAnd(fromComparison, buildToComparison(previousHolderEmail)) : fromComparison;

            if (holders.overLimitEmail == null || holders.limit == null) {
                rulesIntoPosition.push({triggers, filters: source, actions: buildForwardActions(holders.underLimitEmail)});
                continue;
            }

            const underAmount = buildComparison(CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN, holders.limit);
            const overAmount = buildComparison(CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO, holders.limit);

            rulesIntoPosition.push({triggers, filters: buildAnd(source, underAmount), actions: buildForwardActions(holders.underLimitEmail)});
            rulesIntoPosition.push({triggers, filters: buildAnd(source, overAmount), actions: buildForwardActions(holders.overLimitEmail)});
        }

        return rulesIntoPosition;
    };

    for (let position = 0; position < holdersAtPosition.length; position++) {
        rules.push(...buildRulesIntoPosition(position));
    }

    // Whoever holds the last position finalizes the report.
    const lastHolders = holdersAtPosition.at(-1);
    for (const lastHolderEmail of [lastHolders?.underLimitEmail, lastHolders?.overLimitEmail]) {
        if (!lastHolderEmail) {
            continue;
        }
        rules.push({
            triggers: buildApproveTriggers(),
            filters: buildAnd(fromComparison, buildToComparison(lastHolderEmail)),
            actions: buildApproveActions(),
        });
    }

    // Different approvers may share an `overLimitForwardsTo`, which would emit identical terminal rules.
    const seen = new Set<string>();
    return rules.filter((rule) => {
        const fingerprint = JSON.stringify(sortObjectKeysDeep(rule));
        if (seen.has(fingerprint)) {
            return false;
        }
        seen.add(fingerprint);
        return true;
    });
}

/**
 * True when this node is a single comparison like `from = alice@expensify.com`, rather than an `AND` that
 * joins two other nodes.
 *
 * Both look the same (`{operator, left, right}`), so the giveaway is `left`: a comparison points at a field
 * name, an `AND` points at another node.
 */
function isComparisonLeaf(node: ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison | undefined): node is ApprovalWorkflowFilterComparison {
    return !!node && typeof node.left === 'string';
}

/** True when a comparison node targets the `from` field with an equality operator. */
function isSubmitterFilter(node: ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison): boolean {
    return isComparisonLeaf(node) && node.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO && node.left === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM;
}

/** Return the first comparison leaf in the filter tree whose `left` field matches. */
function getFilter(node: ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison | undefined, leftKey: string): ApprovalWorkflowFilterComparison | undefined {
    if (!node) {
        return undefined;
    }
    if (isComparisonLeaf(node)) {
        return node.left === leftKey ? node : undefined;
    }
    return getFilter(node.left, leftKey) ?? getFilter(node.right, leftKey);
}

/** Rebuild a filter tree, replacing every comparison leaf with the result of `mapLeaf`. */
function mapFilters(
    node: ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison,
    mapLeaf: (leaf: ApprovalWorkflowFilterComparison) => ApprovalWorkflowFilterComparison,
): ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison {
    if (isComparisonLeaf(node)) {
        return mapLeaf(node);
    }
    return {...node, left: mapFilters(node.left, mapLeaf), right: mapFilters(node.right, mapLeaf)};
}

/** The emails a rule's `from` filter lists. */
function extractSubmitterEmails(rule: ApprovalWorkflowRule): string[] {
    const submitterFilter = getFilter(rule.filters, CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
    if (!submitterFilter || !isSubmitterFilter(submitterFilter)) {
        return [];
    }

    const emails = Array.isArray(submitterFilter.right) ? submitterFilter.right : [submitterFilter.right];
    return Array.from(new Set(emails.filter((email): email is string => typeof email === 'string')));
}

/**
 * Rewrite a value so that `JSON.stringify` gives the same string for two structures that mean the same thing.
 *
 * Only key order needs fixing: a rule that came back from the server can list the same keys in a different
 * order than one we just built, and those two would otherwise produce different strings and never match.
 */
function sortObjectKeysDeep(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortObjectKeysDeep);
    }
    if (value !== null && typeof value === 'object') {
        // Byte-order sort (not locale-aware): this is a structural fingerprint, not user-facing text.
        const sortedEntries = Object.entries(value).sort(([a], [b]) => {
            if (a === b) {
                return 0;
            }
            return a < b ? -1 : 1;
        });
        return Object.fromEntries(sortedEntries.map(([key, val]) => [key, sortObjectKeysDeep(val)]));
    }
    return value;
}

/**
 * Return a structural fingerprint of a rule with every `from` leaf's `right` (the submitter list)
 * stripped and object keys sorted. Two rules with the same fingerprint differ only in their submitters,
 * which is what we look for when deciding whether to merge two workflows into a shared rule.
 */
function structuralFingerprint(rule: ApprovalWorkflowRule): string {
    const stripFromValues = (node: ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison | undefined): unknown => {
        if (!node) {
            return node;
        }
        if (isComparisonLeaf(node)) {
            if (isSubmitterFilter(node)) {
                return {operator: node.operator, left: node.left};
            }
            return {operator: node.operator, left: node.left, right: node.right};
        }
        return {operator: node.operator, left: stripFromValues(node.left), right: stripFromValues(node.right)};
    };

    return JSON.stringify(
        sortObjectKeysDeep({
            triggers: rule.triggers,
            filters: stripFromValues(rule.filters),
            actions: rule.actions,
        }),
    );
}

/** Replace the `right` value on every `from` leaf with `newEmails`. */
function replaceSubmitterEmails(rule: ApprovalWorkflowRule, newEmails: string[]): ApprovalWorkflowRule {
    return {...rule, filters: mapFilters(rule.filters, (leaf) => (isSubmitterFilter(leaf) ? {...leaf, right: [...newEmails]} : leaf))};
}

/** Merge `emailsToAdd` into `existingEmails`, preserving the order of `existingEmails` and dropping duplicates. */
function mergeEmails(existingEmails: string[], emailsToAdd: string[]): string[] {
    return [...new Set([...existingEmails, ...emailsToAdd])];
}

/** Remove everything in `emailsToRemove` from `existingEmails`, preserving the order of `existingEmails`. */
function removeEmails(existingEmails: string[], emailsToRemove: string[]): string[] {
    const removalSet = new Set(emailsToRemove);
    return existingEmails.filter((email) => !removalSet.has(email));
}

/** Fold `memberEmails` into a rule's `from` list (union), returning the updated rule. */
function addMembersToRule(rule: ApprovalWorkflowRule, memberEmails: string[]): ApprovalWorkflowRule {
    return replaceSubmitterEmails(rule, mergeEmails(extractSubmitterEmails(rule), memberEmails));
}

/** Rewrite a rule's `from` list, or drop the rule entirely (`null`) when no submitters remain. */
function rewriteOrRemoveRule(rule: ApprovalWorkflowRule, remainingEmails: string[]): ApprovalWorkflowRule | null {
    return remainingEmails.length === 0 ? null : replaceSubmitterEmails(rule, remainingEmails);
}

type ReconcileContext = {
    /** The policy's existing approval-workflow rules (`ruleID -> rule body`), defaulting to `{}`. */
    existingRules: Record<string, ApprovalWorkflowRule>;
};

/**
 * Reconcile a freshly created workflow against the existing rules. New rules that match an
 * existing rule's structure (ignoring `from`) are folded into that existing rule by appending
 * the new workflow's members to its `from` list. Anything left over is saved under a fresh
 * client-generated ruleID.
 */
function reconcileApprovalWorkflowRulesForCreate(newRules: ApprovalWorkflowRule[], memberEmails: string[], context: ReconcileContext): ApprovalWorkflowRulesDiff {
    const diff: ApprovalWorkflowRulesDiff = {};
    const existingEntries = Object.entries(context.existingRules);

    for (const newRule of newRules) {
        const fingerprint = structuralFingerprint(newRule);
        const match = existingEntries.find(([, existing]) => structuralFingerprint(existing) === fingerprint);

        if (match) {
            const [existingID, existingRule] = match;
            diff[existingID] = addMembersToRule(existingRule, memberEmails);
            continue;
        }

        diff[rand64()] = newRule;
    }

    return diff;
}

/**
 * Reconcile an edit to an existing workflow into add/replace/remove instructions, preserving rules shared
 * with other workflows.
 */
function reconcileApprovalWorkflowRulesForEdit(newRules: ApprovalWorkflowRule[], memberEmails: string[], context: ReconcileContext): ApprovalWorkflowRulesDiff {
    const diff: ApprovalWorkflowRulesDiff = {};
    const memberSet = new Set(memberEmails);
    const newFingerprints = new Set(newRules.map(structuralFingerprint));

    // Track which existing rules we've already turned into a no-op match so we don't drop them in pass 2.
    const matchedExistingIDs = new Set<string>();

    // Pass 1: walk existing rules that belong (at least partially) to this workflow.
    for (const [ruleID, existingRule] of Object.entries(context.existingRules)) {
        const ruleEmails = extractSubmitterEmails(existingRule);
        if (!ruleEmails.some((email) => memberSet.has(email))) {
            continue;
        }

        const fingerprint = structuralFingerprint(existingRule);
        if (newFingerprints.has(fingerprint)) {
            // Structurally identical to a new rule: leave it alone but remember it as "covered".
            matchedExistingIDs.add(ruleID);
            continue;
        }

        // Keep the rule (minus our members) for any other workflow that still needs it; drop it otherwise.
        diff[ruleID] = rewriteOrRemoveRule(existingRule, removeEmails(ruleEmails, memberEmails));
    }

    // Pass 2: create or extend rules for any new rule that wasn't already covered.
    const existingEntries = Object.entries(context.existingRules);
    for (const newRule of newRules) {
        const fingerprint = structuralFingerprint(newRule);

        // Already in place via a pass-1 match — nothing to do.
        const alreadyCovered = existingEntries.some(([id, existing]) => matchedExistingIDs.has(id) && structuralFingerprint(existing) === fingerprint);
        if (alreadyCovered) {
            continue;
        }

        // Look for a rule belonging to a different workflow that we can fold into.
        const foreignMatch = existingEntries.find(([id, existing]) => {
            if (matchedExistingIDs.has(id)) {
                return false;
            }
            if (structuralFingerprint(existing) !== fingerprint) {
                return false;
            }
            // "Different workflow" => no overlap with our members.
            return !extractSubmitterEmails(existing).some((email) => memberSet.has(email));
        });

        if (foreignMatch) {
            const [existingID, existingRule] = foreignMatch;
            diff[existingID] = addMembersToRule(existingRule, memberEmails);
            continue;
        }

        diff[rand64()] = newRule;
    }

    return diff;
}

/**
 * Reconcile the deletion of a workflow. Rules that listed only this workflow's members in
 * their `from` filter are removed outright; rules shared with other workflows have this workflow's members
 * stripped from `from`.
 */
function reconcileApprovalWorkflowRulesForRemove(memberEmails: string[], context: ReconcileContext): ApprovalWorkflowRulesDiff {
    const diff: ApprovalWorkflowRulesDiff = {};
    const memberSet = new Set(memberEmails);

    for (const [ruleID, existingRule] of Object.entries(context.existingRules)) {
        const ruleEmails = extractSubmitterEmails(existingRule);
        if (!ruleEmails.some((email) => memberSet.has(email))) {
            continue;
        }

        diff[ruleID] = rewriteOrRemoveRule(existingRule, removeEmails(ruleEmails, memberEmails));
    }

    return diff;
}

/**
 * Reconcile a member-only change (the approver chain is unchanged but the workflow's
 * member list changed). For every existing rule that includes any of the previous members
 * we add the new members and drop any previous members that aren't part of the new set.
 */
function reconcileApprovalWorkflowRulesForMembersChange(previousMemberEmails: string[], newMemberEmails: string[], context: ReconcileContext): ApprovalWorkflowRulesDiff {
    const diff: ApprovalWorkflowRulesDiff = {};
    const previousSet = new Set(previousMemberEmails);
    const newSet = new Set(newMemberEmails);
    const removed = previousMemberEmails.filter((email) => !newSet.has(email));

    for (const [ruleID, existingRule] of Object.entries(context.existingRules)) {
        const ruleEmails = extractSubmitterEmails(existingRule);
        if (!ruleEmails.some((email) => previousSet.has(email))) {
            continue;
        }

        const updatedEmails = mergeEmails(removeEmails(ruleEmails, removed), newMemberEmails);

        // No effective change to this rule's `from` — skip the round-trip.
        if (updatedEmails.length === ruleEmails.length && updatedEmails.every((email, idx) => email === ruleEmails.at(idx))) {
            continue;
        }

        diff[ruleID] = rewriteOrRemoveRule(existingRule, updatedEmails);
    }

    return diff;
}

/** Apply an `ApprovalWorkflowRulesDiff` to a rule map, returning a new map. A `null` value removes the rule. */
function applyApprovalWorkflowRulesDiff(existingRules: Record<string, ApprovalWorkflowRule>, diff: ApprovalWorkflowRulesDiff): Record<string, ApprovalWorkflowRule> {
    const result: Record<string, ApprovalWorkflowRule> = {...existingRules};
    for (const [ruleID, value] of Object.entries(diff)) {
        if (value === null) {
            delete result[ruleID];
        } else {
            result[ruleID] = value;
        }
    }
    return result;
}

/** The triggers of a rule as a flat list. */
function getRuleTriggers(rule: ApprovalWorkflowRule): Array<ValueOf<typeof CONST.RULES.APPROVAL_WORKFLOW.TRIGGER>> {
    return Object.values(rule.triggers ?? {});
}

/** The actions of a rule as a flat list. */
function getRuleActions(rule: ApprovalWorkflowRule): ApprovalWorkflowAction[] {
    return Object.values(rule.actions ?? {});
}

/** True when the rule fires on report submission. */
function isSubmitRule(rule: ApprovalWorkflowRule): boolean {
    return getRuleTriggers(rule).includes(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT);
}

/** True when the rule approves (finalizes) the report. */
function isApproveReportRule(rule: ApprovalWorkflowRule): boolean {
    return getRuleActions(rule).some((action) => action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.APPROVE_REPORT);
}

/** The approver a `ForwardTo` rule routes to, if any. */
function getForwardApprover(rule: ApprovalWorkflowRule): string | undefined {
    return getRuleActions(rule).find((action) => action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO)?.approver;
}

/**
 * Who approves this person's report first, right after they submit it?
 *
 * Finds the rule that fires on submit for this submitter and returns whoever it forwards the report to.
 * A workspace set up before approval rules existed has no such rule until its workflow is saved again, so
 * we fall back to the older `submitsTo` field on the employee.
 */
function resolveFirstApprover(submitter: string, rules: Record<string, ApprovalWorkflowRule>, employees: PolicyEmployeeList): string | undefined {
    const firstPosition = resolvePositionHolders(submitter, rules, undefined);
    if (firstPosition?.underLimitEmail) {
        return firstPosition.underLimitEmail;
    }
    return employees[submitter]?.submitsTo;
}

/** Who can hold one position in a submitter's approval chain. */
type PositionHolders = {
    /** Who holds the position for a report under the limit, or for any report when there is no limit. */
    underLimitEmail?: string;

    /** Who holds it instead once the report reaches the limit. */
    overLimitEmail?: string;

    /** The limit that decides between the two. */
    approvalLimit?: number;

    /** True when the routing rules approve the report at this point rather than passing it on. */
    isTerminal: boolean;
};

/**
 * Read who holds the position a report reaches from `sourceApprover` — or from submission when `sourceApprover` is
 * undefined.
 *
 * An approval limit belongs to the position it guards, not to the approver before it: the rules routing into a
 * position carry the amount split, so a report at or over the limit is received by `overLimitEmail` *instead of*
 * `underLimitEmail`. Returns undefined when no rule covers this step, so callers can fall back to `employeeList`.
 */
function resolvePositionHolders(submitter: string, rules: Record<string, ApprovalWorkflowRule>, sourceApprover: string | undefined): PositionHolders | undefined {
    const holders: PositionHolders = {isTerminal: false};
    let didMatchRule = false;

    for (const rule of Object.values(rules)) {
        if (!extractSubmitterEmails(rule).includes(submitter)) {
            continue;
        }

        const isFromSubmission = sourceApprover === undefined;
        if (isFromSubmission !== isSubmitRule(rule)) {
            continue;
        }

        const toLeaf = getFilter(rule.filters, CONST.SEARCH.SYNTAX_FILTER_KEYS.TO);
        if (isFromSubmission ? !!toLeaf : toLeaf?.right !== sourceApprover) {
            continue;
        }

        didMatchRule = true;

        if (isApproveReportRule(rule)) {
            holders.isTerminal = true;
            continue;
        }

        const amountLeaf = getFilter(rule.filters, CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT);
        const isOverLimitBranch =
            !!amountLeaf && (amountLeaf.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO || amountLeaf.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN);

        if (amountLeaf && typeof amountLeaf.right === 'number') {
            holders.approvalLimit = holders.approvalLimit ?? amountLeaf.right;
        }

        if (isOverLimitBranch) {
            holders.overLimitEmail = getForwardApprover(rule) ?? holders.overLimitEmail;
        } else {
            holders.underLimitEmail = getForwardApprover(rule) ?? holders.underLimitEmail;
        }
    }

    if (!didMatchRule) {
        return undefined;
    }

    // A limit only means anything when both halves of the split are known.
    if (!holders.overLimitEmail) {
        holders.approvalLimit = undefined;
    }

    return holders;
}

type BuildApproverChainFromRulesParams = {
    submitter: string;
    rules: Record<string, ApprovalWorkflowRule>;
    employees: PolicyEmployeeList;
    personalDetailsByEmail: PersonalDetailsList;
};

/**
 * Walk a submitter's approval chain forward. The first approver comes from the `ReportSubmit` rule;
 * for each approver we look at the `to == approver` rules to learn that approver's own
 * `approvalLimit` / `overLimitForwardsTo` and where the report goes next (or whether it is approved).
 * Any step the rules don't cover falls back to the legacy `employeeList` fields.
 */
function buildApproverChainFromRules({submitter, rules, employees, personalDetailsByEmail}: BuildApproverChainFromRulesParams): Approver[] {
    // Walk the positions forward first: an approver's own row needs to name the next position's holder, which is only
    // known once that position has been read.
    const positions: PositionHolders[] = [];
    const seenEmails = new Set<string>();
    let sourceApprover: string | undefined;
    let isFirstPosition = true;

    while (true) {
        const holders = resolvePositionHolders(submitter, rules, sourceApprover);

        // Nothing covers this step, so fall back to the legacy employeeList fields for it.
        const fallbackEmail = isFirstPosition ? employees[submitter]?.submitsTo : employees[sourceApprover ?? '']?.forwardsTo;
        const nextEmail = holders?.isTerminal ? undefined : (holders?.underLimitEmail ?? (holders ? undefined : fallbackEmail));
        if (!nextEmail) {
            break;
        }

        const fallbackEmployee: PolicyEmployee | undefined = employees[nextEmail];
        positions.push({
            isTerminal: false,
            underLimitEmail: nextEmail,
            overLimitEmail: holders?.overLimitEmail ?? (holders ? undefined : fallbackEmployee?.overLimitForwardsTo),
            approvalLimit: holders?.approvalLimit ?? (holders ? undefined : (fallbackEmployee?.approvalLimit ?? undefined)),
        });

        if (seenEmails.has(nextEmail)) {
            break;
        }
        seenEmails.add(nextEmail);
        sourceApprover = nextEmail;
        isFirstPosition = false;
    }

    return positions.map((position, index) => {
        const email = position.underLimitEmail ?? '';
        const employee: PolicyEmployee | undefined = employees[email];
        const isCircularReference = positions.findIndex((other) => other.underLimitEmail === email) !== index;

        return {
            email,
            forwardsTo: isCircularReference ? undefined : positions.at(index + 1)?.underLimitEmail,
            avatar: personalDetailsByEmail[email]?.avatar,
            displayName: personalDetailsByEmail[email]?.displayName ?? email,
            isCircularReference,
            approvalLimit: position.approvalLimit ?? null,
            overLimitForwardsTo: position.overLimitEmail,
            overLimitForwardsToDisplayName: getOverLimitForwardsToDisplayName(position.overLimitEmail, personalDetailsByEmail),
            pendingAction: employee?.pendingAction,
            errors: employee?.errors,
        };
    });
}

/** Structural identity of a chain — used to fold submitters with identical chains into one workflow. */
function approverChainFingerprint(chain: Approver[]): string {
    return JSON.stringify(
        chain.map((approver) => ({
            email: approver.email,
            approvalLimit: approver.approvalLimit ?? null,
            overLimitForwardsTo: approver.overLimitForwardsTo ?? null,
            isCircularReference: !!approver.isCircularReference,
        })),
    );
}

/** The sorted set of ruleIDs whose `from` filter includes this submitter — their exact rule membership. */
function getSubmitterRuleIDs(submitter: string, rules: Record<string, ApprovalWorkflowRule>): string[] {
    return Object.entries(rules)
        .filter(([, rule]) => extractSubmitterEmails(rule).includes(submitter))
        .map(([ruleID]) => ruleID)
        .sort();
}

/**
 * Keep only the rules belonging to `policyID`, preserving the collection shape so the result can still be
 * handed to anything that takes the whole rules collection.
 */
function filterRulesForPolicy(rulesCollection: OnyxCollection<Rule>, policyID: string | undefined): NonNullable<OnyxCollection<Rule>> {
    const result: NonNullable<OnyxCollection<Rule>> = {};
    if (!rulesCollection || !policyID) {
        return result;
    }

    for (const [onyxKey, rule] of Object.entries(rulesCollection)) {
        if (rule?.scope !== CONST.RULES.SCOPE.POLICY || rule.scopeID !== policyID) {
            continue;
        }
        result[onyxKey] = rule;
    }

    return result;
}

/**
 * Convert the `ONYXKEYS.COLLECTION.RULE` collection into the `ruleID -> rule body` map used by the
 * builder, reconcilers and converters, keeping only non-deleted rules scoped to `policyID`.
 */
function getApprovalWorkflowRulesForPolicy(rulesCollection: OnyxCollection<Rule> | undefined, policyID: string | undefined): Record<string, ApprovalWorkflowRule> {
    const result: Record<string, ApprovalWorkflowRule> = {};

    for (const [onyxKey, rule] of Object.entries(filterRulesForPolicy(rulesCollection, policyID))) {
        if (!rule || rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        const ruleID = onyxKey.slice(ONYXKEYS.COLLECTION.RULE.length);
        result[ruleID] = {
            triggers: toIndexMap(Object.values(rule.triggers ?? {})),
            filters: rule.filters,
            actions: toIndexMap(Object.values(rule.actions ?? {})),
        };
    }

    return result;
}

/** Map every submitter found in the rules to their workflow's first approver. */
function getRulesSubmitterToFirstApprover(rules: Record<string, ApprovalWorkflowRule>, employees: PolicyEmployeeList = {}): Record<string, string> {
    const submitters = new Set<string>();
    for (const rule of Object.values(rules)) {
        for (const email of extractSubmitterEmails(rule)) {
            submitters.add(email);
        }
    }

    const result: Record<string, string> = {};
    for (const submitter of submitters) {
        const firstApprover = resolveFirstApprover(submitter, rules, employees);
        if (firstApprover) {
            result[submitter] = firstApprover;
        }
    }
    return result;
}

/**
 * Map every submitter found in the rules to a stable identity of the workflow they belong to (a fingerprint
 * of their full approver chain). Unlike `getRulesSubmitterToFirstApprover`, this distinguishes workflows that
 * share a first approver but diverge later, so callers can detect a genuine cross-workflow move rather than
 * treating "same first approver" as "same workflow".
 */
function getRulesSubmitterToWorkflowKey(rules: Record<string, ApprovalWorkflowRule>, employees: PolicyEmployeeList = {}): Record<string, string> {
    const submitters = new Set<string>();
    for (const rule of Object.values(rules)) {
        for (const email of extractSubmitterEmails(rule)) {
            submitters.add(email);
        }
    }

    const result: Record<string, string> = {};
    for (const submitter of submitters) {
        // The fingerprint ignores display/avatar fields, so personal details aren't needed here.
        const chain = buildApproverChainFromRules({submitter, rules, employees, personalDetailsByEmail: {}});
        if (chain.length > 0) {
            result[submitter] = approverChainFingerprint(chain);
        }
    }
    return result;
}

/** The submitters and approver chain of one workflow, accumulated while grouping employees by fingerprint. */
type WorkflowGroup = {
    chain: Approver[];
    members: Member[];
    isDefault: boolean;
    pendingAction: ApprovalWorkflow['pendingAction'];
};

/**
 * Beta-enabled counterpart to `convertPolicyEmployeesToApprovalWorkflows`: rebuild the same
 * `PolicyConversionResult` from `params.rules`, falling back to `employeeList` for any chain step the
 * rules don't cover.
 */
function convertApprovalWorkflowRulesToWorkflows({
    policy,
    personalDetails,
    firstApprover,
    localeCompare,
    currentUserLogin,
    rules: rulesParam,
}: PolicyConversionParams): PolicyConversionResult {
    const employees = policy?.employeeList ?? {};
    const rules = rulesParam ?? {};
    const defaultApprover = getHRFinalApprover(policy) ?? getDefaultApprover(policy);
    const shouldFilterOutExpensifyTeam = shouldFilterExpensifyTeam(policy?.owner, currentUserLogin);
    const hrAdvancedModeFinalApproverEmail = getHRAdvancedModeFinalApprover(policy);

    const personalDetailsByEmail: PersonalDetailsList = {};
    for (const [key, value] of Object.entries(personalDetails)) {
        personalDetailsByEmail[value?.login ?? key] = value;
    }

    // Keyed by a source-tagged fingerprint so a legacy chain and a rule-based chain with the same shape stay
    // in separate workflows. Tag values: 'r' (any rule mentions the submitter) or 'l'.
    const groupedByFingerprint = new Map<string, WorkflowGroup>();
    const usedApproverEmails = new Set<string>();
    const availableMembers: Member[] = [];

    for (const employee of Object.values(employees)) {
        const {email, submitsTo, pendingAction} = employee;
        if (!email) {
            continue;
        }
        if (shouldFilterOutExpensifyTeam && isExpensifyTeam(email)) {
            continue;
        }

        const member = buildMemberFromEmployee(employee, personalDetailsByEmail, email);

        if (pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            availableMembers.push(member);
        }

        const hasInitialRule = !!resolveFirstApprover(email, rules, {});
        if (!hasInitialRule && (!submitsTo || (!employees[submitsTo] && !hrAdvancedModeFinalApproverEmail))) {
            // Mirrors the existing legacy filter: skip submitters whose first approver isn't reachable.
            continue;
        }

        let chain = buildApproverChainFromRules({submitter: email, rules, employees, personalDetailsByEmail});
        if (chain.length === 0) {
            continue;
        }

        if (shouldFilterOutExpensifyTeam) {
            chain = chain.filter((approver) => !isExpensifyTeam(approver.email));
        }
        if (hrAdvancedModeFinalApproverEmail) {
            const last = chain.at(-1);
            if (last && last.email !== hrAdvancedModeFinalApproverEmail) {
                chain.push({
                    email: hrAdvancedModeFinalApproverEmail,
                    forwardsTo: undefined,
                    avatar: personalDetailsByEmail[hrAdvancedModeFinalApproverEmail]?.avatar,
                    displayName: personalDetailsByEmail[hrAdvancedModeFinalApproverEmail]?.displayName ?? hrAdvancedModeFinalApproverEmail,
                    isCircularReference: false,
                });
                usedApproverEmails.add(hrAdvancedModeFinalApproverEmail);
            }
        }
        if (chain.length === 0) {
            continue;
        }

        const firstApproverEmail = chain.at(0)?.email;
        if (firstApproverEmail !== firstApprover) {
            for (const approver of chain) {
                usedApproverEmails.add(approver.email);
            }
        }

        // Group by resolved approver chain (not by ruleID set) so submitters routing through the same chain
        // render as one card even when their rules are stored as separate pairs. The `r`/`l` tag keeps
        // rule-based chains separate from legacy employeeList chains.
        const hasRuleBasedChain = getSubmitterRuleIDs(email, rules).length > 0;
        const chainKey = approverChainFingerprint(chain);
        const fingerprint = hasRuleBasedChain ? `r|${chainKey}` : `l|${chainKey}`;
        const existingGroup = groupedByFingerprint.get(fingerprint);

        if (existingGroup) {
            if (pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                existingGroup.members.push(member);
            }
            if (pendingAction && pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                existingGroup.pendingAction = pendingAction;
            }
            continue;
        }

        const workflowPendingAction = pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? pendingAction : undefined;
        groupedByFingerprint.set(fingerprint, {
            chain,
            members: pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? [member] : [],
            isDefault: firstApproverEmail === defaultApprover,
            pendingAction: workflowPendingAction,
        });
    }

    const sortedApprovalWorkflows: ApprovalWorkflow[] = Array.from(groupedByFingerprint.values())
        .map(({chain, members, isDefault, pendingAction}) => ({
            members,
            approvers: chain,
            isDefault,
            pendingAction,
        }))
        .sort((a, b) => {
            if (a.isDefault) {
                return -1;
            }
            if (b.isDefault) {
                return 1;
            }
            return localeCompare(a.approvers.at(0)?.displayName ?? '', b.approvers.at(0)?.displayName ?? '');
        });

    const firstWorkflow = sortedApprovalWorkflows.at(0);
    if (firstWorkflow && !firstWorkflow.isDefault) {
        sortedApprovalWorkflows.unshift({
            members: [],
            approvers: calculateApprovers({employees, firstEmail: defaultApprover, personalDetailsByEmail}),
            isDefault: true,
        });
    }

    availableMembers.sort((a, b) => localeCompare(a.displayName ?? a.email, b.displayName ?? b.email));

    return {approvalWorkflows: sortedApprovalWorkflows, usedApproverEmails: [...usedApproverEmails], availableMembers};
}

export {
    applyApprovalWorkflowRulesDiff,
    approverChainFingerprint,
    buildApprovalWorkflowRules,
    calculateApprovers,
    convertApprovalWorkflowRulesToWorkflows,
    convertPolicyEmployeesToApprovalWorkflows,
    convertApprovalWorkflowToPolicyEmployees,
    extractSubmitterEmails,
    getApprovalLimitDescription,
    getApprovalWorkflowRulesForPolicy,
    filterRulesForPolicy,
    getRulesSubmitterToFirstApprover,
    getRulesSubmitterToWorkflowKey,
    getWorkflowMemberEmails,
    getEligibleExistingBusinessBankAccounts,
    getOpenConnectedToPolicyBusinessBankAccounts,
    getOverLimitForwardsToDisplayName,
    INITIAL_APPROVAL_WORKFLOW,
    mergeWorkflowMembersWithAvailableMembers,
    reconcileApprovalWorkflowRulesForCreate,
    reconcileApprovalWorkflowRulesForEdit,
    reconcileApprovalWorkflowRulesForMembersChange,
    reconcileApprovalWorkflowRulesForRemove,
    updateWorkflowDataOnApproverRemoval,
};
export type {ApprovalWorkflowRulesDiff};
