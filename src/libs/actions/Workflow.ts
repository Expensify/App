import {write} from '@libs/API';
import type {CreateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams, SetApprovalWorkflowParams, UpdateWorkspaceApprovalParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getDefaultApprover} from '@libs/PolicyUtils';
import type {ApprovalWorkflowRulesDiff} from '@libs/WorkflowUtils';
import {
    addMembersToRule,
    applyApprovalWorkflowRulesDiff,
    buildApprovalWorkflowRules,
    buildApprovalWorkflowRulesForSave,
    calculateApprovers,
    convertApprovalWorkflowToPolicyEmployees,
    getApprovalWorkflowRulesForPolicy,
    getNonMemberApproverError,
    getOverLimitForwardsToDisplayName,
    getWorkflowMemberEmails,
    hasRuleBasedDefaultWorkflow,
    includesEveryWorkspaceMember,
    mergeWorkflowMembersWithAvailableMembers,
    reconcileApprovalWorkflowRulesForCreate,
    reconcileApprovalWorkflowRulesForEdit,
    reconcileApprovalWorkflowRulesForMembersChange,
    reconcileApprovalWorkflowRulesForRemove,
} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ApprovalWorkflowOnyx, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {ApprovalWorkflowRule} from '@src/types/onyx/ApprovalWorkflowRules';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
import type Rule from '@src/types/onyx/Rule';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import lodashDropRightWhile from 'lodash/dropRightWhile';
import Onyx from 'react-native-onyx';

import {completeTask} from './Task';

type CreateApprovalWorkflowParams = {
    approvalWorkflow: ApprovalWorkflow;
    policy: OnyxEntry<Policy>;
    addExpenseApprovalsTaskReport: OnyxEntry<Report>;
};

type SetApprovalWorkflowApproverParams = {
    approver: Approver;
    approverIndex: number;
    currentApprovalWorkflow: ApprovalWorkflowOnyx | undefined;
    policy: OnyxEntry<Policy>;
    personalDetailsByEmail: OnyxEntry<PersonalDetailsList>;
};

type ClearApprovalWorkflowApproverParams = {
    approverIndex: number;
    currentApprovalWorkflow: ApprovalWorkflowOnyx | undefined;
};

function createApprovalWorkflow({approvalWorkflow, policy, addExpenseApprovalsTaskReport}: CreateApprovalWorkflowParams) {
    if (!policy) {
        return;
    }

    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const previousApprovalMode = policy.approvalMode;
    const previousDefaultApprover = getDefaultApprover(policy);
    const firstApprover = approvalWorkflow.approvers.at(0)?.email;

    // A default workflow's first approver is the policy's default approver, which only needs sending when it changes
    const newDefaultApprover = approvalWorkflow.isDefault && firstApprover !== previousDefaultApprover ? firstApprover : undefined;
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: CONST.APPROVAL_WORKFLOW.TYPE.CREATE});

    // If there are no changes to the employees list or the default approver, we can exit early
    if (isEmptyObject(updatedEmployees) && !newDefaultApprover) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.APPROVAL_WORKFLOW | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: updatedEmployees,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                ...(newDefaultApprover ? {approver: newDefaultApprover} : {}),
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: previousEmployeeList,
                approvalMode: previousApprovalMode,
                ...(newDefaultApprover ? {approver: previousDefaultApprover} : {}),
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null, pendingFields: null}])),
            },
        },
    ];

    const parameters: CreateWorkspaceApprovalParams = {policyID: policy.id, employees: JSON.stringify(Object.values(updatedEmployees)), defaultApprover: newDefaultApprover};
    write(WRITE_COMMANDS.CREATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});

    if (
        addExpenseApprovalsTaskReport &&
        (addExpenseApprovalsTaskReport.stateNum !== CONST.REPORT.STATE_NUM.APPROVED || addExpenseApprovalsTaskReport.statusNum !== CONST.REPORT.STATUS_NUM.APPROVED)
    ) {
        // delegateEmail: will be threaded in PR 16; buildOptimisticTaskReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)
        completeTask(addExpenseApprovalsTaskReport, false, false, undefined, undefined, undefined, false);
    }
}

function updateApprovalWorkflow(approvalWorkflow: ApprovalWorkflow, membersToRemove: Member[], approversToRemove: Approver[], policy: OnyxEntry<Policy>) {
    if (!policy) {
        return;
    }

    const previousDefaultApprover = getDefaultApprover(policy);
    const newDefaultApprover = approvalWorkflow.isDefault ? approvalWorkflow.approvers.at(0)?.email : undefined;
    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({
        previousEmployeeList,
        approvalWorkflow,
        type: CONST.APPROVAL_WORKFLOW.TYPE.UPDATE,
        membersToRemove,
        approversToRemove,
        defaultApprover: newDefaultApprover ?? previousDefaultApprover ?? '',
    });

    // Force the new default approver's `submitsTo` to themselves whenever the default
    // approver changes. `convertApprovalWorkflowToPolicyEmployees` only rewrites `submitsTo`
    // for emails present in `approvalWorkflow.members`, so a newly-promoted approver who
    // wasn't already a member (e.g., an agent the backend's `shareWithEmployees` just added
    // with `submitsTo = previous default approver`) keeps that stale value and shows up as
    // their own orphan submission group on the workflows page. This backstop guarantees the
    // new default approver self-submits regardless of the caller's `members` snapshot.
    if (newDefaultApprover && newDefaultApprover !== previousDefaultApprover) {
        const existing = updatedEmployees[newDefaultApprover] ?? previousEmployeeList[newDefaultApprover];
        if (existing && existing.submitsTo !== newDefaultApprover) {
            const previousPendingAction = previousEmployeeList[newDefaultApprover]?.pendingAction;
            updatedEmployees[newDefaultApprover] = {
                ...existing,
                email: newDefaultApprover,
                submitsTo: newDefaultApprover,
                pendingAction: previousPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? previousPendingAction : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                pendingFields: {
                    ...existing.pendingFields,
                    submitsTo: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            };
        }
    }

    // If there are no changes to the employees list, we can exit early
    if (isEmptyObject(updatedEmployees) && !newDefaultApprover) {
        return;
    }

    // Determine if approvalMode should change based on updated employee state
    // Deep merge at the employee level to preserve fields not included in updatedEmployees (e.g., overLimitForwardsTo)
    const mergedEmployeeList = Object.fromEntries(Object.keys({...previousEmployeeList, ...updatedEmployees}).map((key) => [key, {...previousEmployeeList[key], ...updatedEmployees[key]}]));
    const effectiveDefaultApprover = newDefaultApprover ?? previousDefaultApprover ?? '';
    const hasMultipleWorkflows = Object.values(mergedEmployeeList).some((employee) => !!employee.submitsTo && employee.submitsTo !== effectiveDefaultApprover);
    const defaultApproverEmployee = mergedEmployeeList[effectiveDefaultApprover];
    const hasForwardsToChain = !!defaultApproverEmployee?.forwardsTo || !!defaultApproverEmployee?.overLimitForwardsTo;
    const shouldKeepAdvancedMode = hasMultipleWorkflows || hasForwardsToChain;
    const previousApprovalMode = policy.approvalMode;

    const updatedApprovalMode = shouldKeepAdvancedMode ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.APPROVAL_WORKFLOW | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: updatedEmployees,
                approvalMode: updatedApprovalMode,
                ...(newDefaultApprover ? {approver: newDefaultApprover} : {}),
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: previousEmployeeList,
                approvalMode: previousApprovalMode,
                pendingFields: {employeeList: null},
                ...(newDefaultApprover ? {approver: previousDefaultApprover} : {}),
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null, pendingFields: null}])),
            },
        },
    ];

    const parameters: UpdateWorkspaceApprovalParams = {
        policyID: policy.id,
        employees: JSON.stringify(Object.values(updatedEmployees)),
        defaultApprover: newDefaultApprover,
    };
    write(WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

function removeApprovalWorkflow(approvalWorkflow: ApprovalWorkflow, policy: OnyxEntry<Policy>) {
    if (!policy) {
        return;
    }

    const previousEmployeeList = Object.fromEntries(Object.entries(policy.employeeList ?? {}).map(([key, value]) => [key, {...value, pendingAction: null}]));
    const updatedEmployees = convertApprovalWorkflowToPolicyEmployees({previousEmployeeList, approvalWorkflow, type: CONST.APPROVAL_WORKFLOW.TYPE.REMOVE});
    // Deep merge at the employee level to preserve fields not included in updatedEmployees (e.g., overLimitForwardsTo)
    const mergedEmployeeList = Object.fromEntries(Object.keys({...previousEmployeeList, ...updatedEmployees}).map((key) => [key, {...previousEmployeeList[key], ...updatedEmployees[key]}]));

    const defaultApprover = getDefaultApprover(policy);
    // If there is more than one workflow, we need to keep the advanced approval mode (first workflow is the default)
    const hasMoreThanOneWorkflow = Object.values(mergedEmployeeList).some((employee) => !!employee.submitsTo && employee.submitsTo !== defaultApprover);
    // The default workflow can still have a forwardsTo chain (multi-level approvers), which also requires advanced mode
    const defaultApproverEmployee = mergedEmployeeList[defaultApprover];
    const hasForwardsToChain = !!defaultApproverEmployee?.forwardsTo || !!defaultApproverEmployee?.overLimitForwardsTo;
    const shouldKeepAdvancedMode = hasMoreThanOneWorkflow || hasForwardsToChain;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.APPROVAL_WORKFLOW | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.APPROVAL_WORKFLOW,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: updatedEmployees,
                approvalMode: shouldKeepAdvancedMode ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: previousEmployeeList,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
            value: {
                employeeList: Object.fromEntries(Object.keys(updatedEmployees).map((key) => [key, {pendingAction: null, pendingFields: null}])),
            },
        },
    ];

    const parameters: RemoveWorkspaceApprovalParams = {policyID: policy.id, employees: JSON.stringify(Object.values(updatedEmployees))};
    write(WRITE_COMMANDS.REMOVE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData, successData});
}

type SetApprovalWorkflowRulesParams = {
    policyID: string;

    /**
     * Diff of rules keyed by ruleID. A value of `ApprovalWorkflowRule` sets/replaces the rule
     * under its `ruleID` in the `ONYXKEYS.COLLECTION.RULE` collection; a value of `null` removes it.
     */
    rulesDiff: ApprovalWorkflowRulesDiff;

    /** The rules as currently stored in Onyx, which `rulesDiff` is applied on top of. Used to roll back on failure. */
    previousRules: OnyxCollection<Rule>;
};

/**
 * Build the Onyx updates for a request that applies a diff of approval-workflow rules: the diff shows while the request
 * is pending, and is kept when it succeeds or rolled back when it fails.
 */
function buildApprovalWorkflowRulesOnyxData({policyID, rulesDiff, previousRules}: SetApprovalWorkflowRulesParams) {
    const genericError = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.RULE>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.RULE>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.RULE>> = [];

    for (const [ruleID, rule] of Object.entries(rulesDiff)) {
        const ruleKey = `${ONYXKEYS.COLLECTION.RULE}${ruleID}` as const;
        const previousRule = previousRules?.[ruleKey];
        const restore: OnyxUpdate<typeof ONYXKEYS.COLLECTION.RULE> = previousRule
            ? {onyxMethod: Onyx.METHOD.SET, key: ruleKey, value: {...previousRule, pendingAction: null, errors: genericError}}
            : {onyxMethod: Onyx.METHOD.SET, key: ruleKey, value: null};

        if (rule === null) {
            optimisticData.push({onyxMethod: Onyx.METHOD.MERGE, key: ruleKey, value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null}});
            successData.push({onyxMethod: Onyx.METHOD.SET, key: ruleKey, value: null});
            failureData.push(restore);
            continue;
        }

        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ruleKey,
            value: {
                ...rule,
                scope: CONST.RULES.SCOPE.POLICY,
                scopeID: policyID,
                pendingAction: previousRule ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                errors: null,
            },
        });
        successData.push({onyxMethod: Onyx.METHOD.MERGE, key: ruleKey, value: {pendingAction: null}});
        failureData.push(restore);
    }

    return {optimisticData, successData, failureData};
}

/**
 * Apply a set of approval-workflow rule changes to a policy via the SetApprovalWorkflow Auth command.
 */
function setApprovalWorkflowRules({policyID, rulesDiff, previousRules}: SetApprovalWorkflowRulesParams) {
    if (!policyID || isEmptyObject(rulesDiff)) {
        return;
    }

    const parameters: SetApprovalWorkflowParams = {
        policyID,
        rules: JSON.stringify(rulesDiff),
    };

    write(WRITE_COMMANDS.SET_APPROVAL_WORKFLOW, parameters, buildApprovalWorkflowRulesOnyxData({policyID, rulesDiff, previousRules}));
}

/**
 * Build the Onyx updates for a request whose backend deletes the policy's approval workflow rules, the way
 * setApprovalWorkflowRules deletes rules: they stop routing while the request is pending, and come back if it fails.
 */
function buildDeleteApprovalWorkflowRulesOnyxData(policyID: string, rules: OnyxCollection<Rule>) {
    const rulesDiff: ApprovalWorkflowRulesDiff = Object.fromEntries(Object.keys(getApprovalWorkflowRulesForPolicy(rules, policyID)).map((ruleID) => [ruleID, null]));
    return buildApprovalWorkflowRulesOnyxData({policyID, rulesDiff, previousRules: rules});
}

type CreateApprovalWorkflowRulesParams = CreateApprovalWorkflowParams & {
    rules: OnyxCollection<Rule>;
};

/** Create an approval workflow using the rules-based backend structure. */
function createApprovalWorkflowRules({approvalWorkflow, policy, addExpenseApprovalsTaskReport, rules}: CreateApprovalWorkflowRulesParams) {
    if (!policy) {
        return;
    }

    const existingRules = getApprovalWorkflowRulesForPolicy(rules, policy.id);
    const memberEmails = getWorkflowMemberEmails(approvalWorkflow.members);

    // A submitter can only belong to one workflow, so first drop these members from any OTHER
    // workflow's rules, then add them to the new workflow.
    const removeDiff = reconcileApprovalWorkflowRulesForRemove(memberEmails, {existingRules});
    const rulesAfterRemoval = applyApprovalWorkflowRulesDiff(existingRules, removeDiff);

    const newRules = buildApprovalWorkflowRulesForSave(approvalWorkflow, {
        existingRules: rulesAfterRemoval,
        employees: policy.employeeList ?? {},
        defaultApprover: getDefaultApprover(policy),
    });
    const createDiff = reconcileApprovalWorkflowRulesForCreate(newRules, memberEmails, {existingRules: rulesAfterRemoval});

    const rulesDiff = {...removeDiff, ...createDiff};

    setApprovalWorkflowRules({policyID: policy.id, rulesDiff, previousRules: rules});
    updatePolicyDefaultApprover(approvalWorkflow, policy);

    if (
        addExpenseApprovalsTaskReport &&
        (addExpenseApprovalsTaskReport.stateNum !== CONST.REPORT.STATE_NUM.APPROVED || addExpenseApprovalsTaskReport.statusNum !== CONST.REPORT.STATUS_NUM.APPROVED)
    ) {
        completeTask(addExpenseApprovalsTaskReport, false, false, undefined, undefined, undefined, false);
    }
}

/**
 * Change the Policy's default first approver. Used to keep `policy.approver` in sync when we change
 * who the first approver for the default workflow is
 */
function updatePolicyDefaultApprover(approvalWorkflow: ApprovalWorkflow, policy: Policy) {
    if (!approvalWorkflow.isDefault) {
        return;
    }

    const previousDefaultApprover = getDefaultApprover(policy);
    const newDefaultApprover = approvalWorkflow.approvers.at(0)?.email;
    if (!newDefaultApprover || newDefaultApprover === previousDefaultApprover) {
        return;
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [{onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {approver: newDefaultApprover}}];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [{onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {approver: previousDefaultApprover}}];

    const parameters: UpdateWorkspaceApprovalParams = {policyID: policy.id, employees: '[]', defaultApprover: newDefaultApprover};
    write(WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL, parameters, {optimisticData, failureData});
}

type UpdateApprovalWorkflowRulesParams = {
    approvalWorkflow: ApprovalWorkflow;
    initialApprovalWorkflow: ApprovalWorkflow;
    policy: OnyxEntry<Policy>;
    rules: OnyxCollection<Rule>;

    /** The policy's default workflow, which members taken out of this workflow go back to. */
    defaultApprovalWorkflow?: ApprovalWorkflow;
};

/** Update an existing workflow using the rules-based backend structure. */
function updateApprovalWorkflowRules({approvalWorkflow, initialApprovalWorkflow, policy, rules, defaultApprovalWorkflow}: UpdateApprovalWorkflowRulesParams) {
    if (!policy) {
        return;
    }

    const existingRules = getApprovalWorkflowRulesForPolicy(rules, policy.id);
    const previousMemberEmails = getWorkflowMemberEmails(initialApprovalWorkflow.members);
    const newMemberEmails = getWorkflowMemberEmails(approvalWorkflow.members);

    // 1. A submitter can only belong to one workflow, so drop joining members (those not previously in
    // this workflow) from any OTHER workflow's rules first.
    const joiningMemberEmails = newMemberEmails.filter((email) => !previousMemberEmails.includes(email));
    const removeFromOthersDiff = reconcileApprovalWorkflowRulesForRemove(joiningMemberEmails, {existingRules});
    const rulesAfterRemoval = applyApprovalWorkflowRulesDiff(existingRules, removeFromOthersDiff);

    // 2. Sync membership across this workflow's rules (add joiners, drop leavers).
    const memberDiff = reconcileApprovalWorkflowRulesForMembersChange(previousMemberEmails, newMemberEmails, {existingRules: rulesAfterRemoval});
    const rulesAfterMembers = applyApprovalWorkflowRulesDiff(rulesAfterRemoval, memberDiff);

    // 3. Reconcile the approver chain with the membership-updated rules.
    const newRules = buildApprovalWorkflowRulesForSave(approvalWorkflow, {
        existingRules: rulesAfterMembers,
        employees: policy.employeeList ?? {},
        defaultApprover: getDefaultApprover(policy),
    });
    const chainDiff = reconcileApprovalWorkflowRulesForEdit(newRules, newMemberEmails, {existingRules: rulesAfterMembers});

    // 4. Members taken out of this workflow go back to the default workflow.
    const returnToDefaultDiff = buildReturnToDefaultWorkflowDiff({
        approvalWorkflow: {...initialApprovalWorkflow, members: initialApprovalWorkflow.members.filter((member) => !newMemberEmails.includes(member.email))},
        defaultApprovalWorkflow,
        existingRules: applyApprovalWorkflowRulesDiff(rulesAfterMembers, chainDiff),
        employees: policy.employeeList ?? {},
        defaultApprover: getDefaultApprover(policy),
    });

    const rulesDiff = {...removeFromOthersDiff, ...memberDiff, ...chainDiff, ...returnToDefaultDiff};

    setApprovalWorkflowRules({policyID: policy.id, rulesDiff, previousRules: rules});
    updatePolicyDefaultApprover(approvalWorkflow, policy);
}

type BuildReturnToDefaultWorkflowDiffParams = {
    /** The workflow these members are leaving, because it is deleted or they are taken out of it, listing only them. */
    approvalWorkflow: ApprovalWorkflow;

    /** The policy's default workflow, or undefined when the page couldn't resolve one. */
    defaultApprovalWorkflow: ApprovalWorkflow | undefined;

    /** The policy's rules with these members already taken out of the workflow they are leaving. */
    existingRules: Record<string, ApprovalWorkflowRule>;

    /** The policy's employees, used to check where these members would fall back to without rules. */
    employees: PolicyEmployeeList;

    /** The policy's default approver. */
    defaultApprover: string;
};

/**
 * List the members leaving a workflow in the default workflow's rules.
 */
function buildReturnToDefaultWorkflowDiff({
    approvalWorkflow,
    defaultApprovalWorkflow,
    existingRules,
    employees,
    defaultApprover,
}: BuildReturnToDefaultWorkflowDiffParams): ApprovalWorkflowRulesDiff {
    const memberEmails = getWorkflowMemberEmails(approvalWorkflow.members);
    if (!defaultApprovalWorkflow || memberEmails.length === 0) {
        return {};
    }

    const hasRuleBasedDefault = hasRuleBasedDefaultWorkflow(existingRules);
    const buildDefaultRules = (isDefault: boolean) => buildApprovalWorkflowRules({...defaultApprovalWorkflow, members: approvalWorkflow.members, isDefault});

    const foldDiff = reconcileApprovalWorkflowRulesForCreate(buildDefaultRules(hasRuleBasedDefault), memberEmails, {existingRules});
    if (Object.keys(foldDiff).every((ruleID) => ruleID in existingRules)) {
        return foldDiff;
    }

    // A policy has a single default workflow, so when its rules route differently from the chain we were handed, the
    // members still join those rules. New rules declaring themselves default would stand up a second default workflow.
    if (hasRuleBasedDefault) {
        return Object.fromEntries(
            Object.entries(existingRules)
                .filter(([, rule]) => !!rule.isDefaultApprovalWorkflow)
                .map(([ruleID, rule]) => [ruleID, addMembersToRule(rule, memberEmails)]),
        );
    }

    if (memberEmails.every((email) => employees[email]?.submitsTo === defaultApprover)) {
        return {};
    }

    return reconcileApprovalWorkflowRulesForCreate(buildDefaultRules(true), memberEmails, {existingRules});
}

/**
 * Delete an approval workflow using the rules-based backend structure.
 *
 * Returns false without calling the API when neither the workflow's members nor the default workflow have rules, so
 * the caller can fall back to the `employeeList` path.
 */
function removeApprovalWorkflowRules(approvalWorkflow: ApprovalWorkflow, policy: OnyxEntry<Policy>, rules: OnyxCollection<Rule>, defaultApprovalWorkflow?: ApprovalWorkflow): boolean {
    if (!policy) {
        return false;
    }

    const existingRules = getApprovalWorkflowRulesForPolicy(rules, policy.id);
    const memberEmails = getWorkflowMemberEmails(approvalWorkflow.members);
    const removeDiff = reconcileApprovalWorkflowRulesForRemove(memberEmails, {existingRules});

    // Members no rule covers still join a rule-backed default workflow through its rules, since the backend rejects
    // `employeeList` routing changes once a policy's approvals are rule-based.
    if (isEmptyObject(removeDiff) && !hasRuleBasedDefaultWorkflow(existingRules)) {
        return false;
    }

    const returnToDefaultDiff = buildReturnToDefaultWorkflowDiff({
        approvalWorkflow,
        defaultApprovalWorkflow,
        existingRules: applyApprovalWorkflowRulesDiff(existingRules, removeDiff),
        employees: policy.employeeList ?? {},
        defaultApprover: getDefaultApprover(policy),
    });

    setApprovalWorkflowRules({policyID: policy.id, rulesDiff: {...removeDiff, ...returnToDefaultDiff}, previousRules: rules});
    return true;
}

/** Set the members of the approval workflow that is currently edited */
function setApprovalWorkflowMembers(members: Member[]) {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {members, errors: null});
}

/**
 * Set the approver at the specified index in the approval workflow that is currently edited
 * @param approver - The new approver to set
 * @param approverIndex - The index of the approver to set
 * @param policy - The policy to set the approver for
 */
function setApprovalWorkflowApprover({approver, approverIndex, currentApprovalWorkflow, policy, personalDetailsByEmail}: SetApprovalWorkflowApproverParams) {
    if (!currentApprovalWorkflow || !policy?.employeeList || !personalDetailsByEmail) {
        return;
    }

    const approvers: Array<Approver | undefined> = [...currentApprovalWorkflow.approvers];
    const overLimitForwardsToDisplayName = getOverLimitForwardsToDisplayName(approver.overLimitForwardsTo, personalDetailsByEmail);
    approvers[approverIndex] = {...approver, overLimitForwardsToDisplayName};

    // Check if the approver forwards to other approvers and add them to the list
    if (policy.employeeList[approver.email]?.forwardsTo) {
        const additionalApprovers = calculateApprovers({employees: policy.employeeList, firstEmail: approver.email, personalDetailsByEmail});

        approvers.splice(approverIndex, approvers.length, ...additionalApprovers);

        // Preserve the new approvalLimit and overLimitForwardsTo values that were passed in,
        // since calculateApprovers reads from stale policy data
        const existingApprover = approvers.at(approverIndex);
        if (existingApprover) {
            approvers[approverIndex] = {
                ...existingApprover,
                approvalLimit: approver.approvalLimit,
                overLimitForwardsTo: approver.overLimitForwardsTo,
                overLimitForwardsToDisplayName,
            };
        }
    }

    // Always clear the additional approver error when an approver is added
    const errors: Record<string, TranslationPaths | null> = {additionalApprover: null};

    // Check for circular references (approver forwards to themselves) and reset other errors
    const updatedApprovers = approvers.map((existingApprover, index) => {
        if (!existingApprover) {
            return;
        }

        const hasCircularReference = approvers.slice(0, index).some((previousApprover) => existingApprover.email === previousApprover?.email);
        if (hasCircularReference) {
            errors[`approver-${index}`] = 'workflowsPage.approverCircularReference';
        } else {
            errors[`approver-${index}`] = null;
        }

        return {
            ...existingApprover,
            isCircularReference: hasCircularReference,
        };
    });

    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: updatedApprovers, errors});
}

/** Clear one approver at the specified index in the approval workflow that is currently edited */
function clearApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow}: ClearApprovalWorkflowApproverParams) {
    if (!currentApprovalWorkflow) {
        return;
    }

    const approvers: Array<Approver | undefined> = [...currentApprovalWorkflow.approvers];
    approvers[approverIndex] = undefined;

    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: lodashDropRightWhile(approvers, (approver) => !approver), errors: null});
}

/** Clear all approvers of the approval workflow that is currently edited */
function clearApprovalWorkflowApprovers() {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {approvers: []});
}

/** Set whether the user is in the initial creation flow */
function setApprovalWorkflowIsInitialFlow(isInitialFlow: boolean) {
    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {isInitialFlow});
}

function setApprovalWorkflow(approvalWorkflow: NullishDeep<ApprovalWorkflowOnyx>) {
    Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, approvalWorkflow);
}

type SelectApprovalWorkflowForEditParams = {
    workflow: ApprovalWorkflow;
    /** Members not already in this workflow — used to populate the picker. */
    defaultWorkflowMembers: Member[];
    /** Approver emails already taken by other workflows. */
    usedApproverEmails: string[];
    /** Override for the approvers list (the Edit page uses this to seed an optimistic agent). */
    approvers?: Approver[];
    /** Identity anchor of the member whose workflow is being edited, preserved across sub-page back routes. */
    memberEmail?: string;
    /** The policy's default workflow, where members taken out of this workflow go back to. */
    defaultApprovalWorkflow?: ApprovalWorkflow;
    /** Set by the "+N more" shortcut, which skips the Edit RHP, so the members page knows to save the workflow itself. */
    isFastEdit?: boolean;
};

/** Commits a workflow to onyx in EDIT mode so any sub-page can be entered directly, skipping the Edit RHP. */
function selectApprovalWorkflowForEdit({
    workflow,
    defaultWorkflowMembers,
    usedApproverEmails,
    approvers,
    memberEmail,
    defaultApprovalWorkflow,
    isFastEdit,
}: SelectApprovalWorkflowForEditParams) {
    setApprovalWorkflow({
        ...workflow,
        approvers: approvers ?? workflow.approvers,
        availableMembers: mergeWorkflowMembersWithAvailableMembers(workflow.members, defaultWorkflowMembers),
        usedApproverEmails,
        action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
        errors: null,
        originalApprovers: workflow.approvers,
        originalMembers: workflow.members,
        defaultApprovalWorkflow,
        memberEmail,
        isFastEdit,
    });
}

function clearApprovalWorkflow() {
    Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, null);
}

type SaveFastEditApprovalWorkflowParams = {
    approvalWorkflow: ApprovalWorkflowOnyx;
    policy: OnyxEntry<Policy>;
    rules: OnyxCollection<Rule>;
    isMultipleApproversBetaEnabled: boolean;
};

/** Saves the member changes made through the "+N more" shortcut and discards the draft, since no edit page will. */
function saveFastEditApprovalWorkflow({approvalWorkflow, policy, rules, isMultipleApproversBetaEnabled}: SaveFastEditApprovalWorkflowParams) {
    // A workflow with everyone in it leaves every other workflow empty, so it becomes the default one
    const isDefault = approvalWorkflow.isDefault || includesEveryWorkspaceMember(getWorkflowMemberEmails(approvalWorkflow.members), policy?.employeeList);
    const workflow: ApprovalWorkflow = {...approvalWorkflow, isDefault, approvers: approvalWorkflow.approvers.filter((approver): approver is Approver => !!approver)};
    const originalMembers = approvalWorkflow.originalMembers ?? [];

    if (isMultipleApproversBetaEnabled) {
        updateApprovalWorkflowRules({
            approvalWorkflow: workflow,
            initialApprovalWorkflow: {...workflow, members: originalMembers},
            policy,
            rules,
            defaultApprovalWorkflow: approvalWorkflow.defaultApprovalWorkflow,
        });
    } else {
        const membersToRemove = originalMembers.filter((originalMember) => !workflow.members.some((member) => member.email === originalMember.email));
        updateApprovalWorkflow(workflow, membersToRemove, [], policy);
    }

    clearApprovalWorkflow();
}

type ApprovalWorkflowOnyxValidated = Omit<ApprovalWorkflowOnyx, 'approvers'> & {approvers: Approver[]};

/**
 * Validates the approval workflow and sets the errors on the approval workflow
 * @param approvalWorkflow the approval workflow to validate
 * @returns true if the approval workflow is valid, false otherwise
 */
function validateApprovalWorkflow(approvalWorkflow: ApprovalWorkflowOnyx): approvalWorkflow is ApprovalWorkflowOnyxValidated {
    const errors: Record<string, TranslationPaths> = {};

    for (const [approverIndex, approver] of approvalWorkflow.approvers.entries()) {
        if (!approver) {
            errors[`approver-${approverIndex}`] = 'common.error.fieldRequired';
        }

        if (approver?.isCircularReference) {
            errors[`approver-${approverIndex}`] = 'workflowsPage.approverCircularReference';
        }

        if (approver?.isNotWorkspaceMember) {
            errors[`approver-${approverIndex}`] = getNonMemberApproverError(approvalWorkflow.isDefault);
        }

        // Validate that if overLimitForwardsTo is set, approvalLimit must also be set
        if (approver?.overLimitForwardsTo && (!approver?.approvalLimit || approver.approvalLimit <= 0)) {
            errors[`approver-${approverIndex}`] = 'workflowsApprovalLimitPage.enterAmountError';
        }

        // Validate that if approvalLimit is set, overLimitForwardsTo must also be set
        if (approver?.approvalLimit && approver.approvalLimit > 0 && !approver?.overLimitForwardsTo) {
            errors[`approver-${approverIndex}`] = 'workflowsApprovalLimitPage.enterApproverError';
        }
    }

    if (!approvalWorkflow.members.length && !approvalWorkflow.isDefault) {
        errors.members = 'common.error.fieldRequired';
    }

    if (!approvalWorkflow.approvers.length) {
        errors.additionalApprover = 'common.error.fieldRequired';
    }

    Onyx.merge(ONYXKEYS.APPROVAL_WORKFLOW, {errors});
    return isEmptyObject(errors);
}

export {
    buildDeleteApprovalWorkflowRulesOnyxData,
    createApprovalWorkflow,
    createApprovalWorkflowRules,
    removeApprovalWorkflowRules,
    updateApprovalWorkflow,
    updateApprovalWorkflowRules,
    removeApprovalWorkflow,
    setApprovalWorkflowMembers,
    setApprovalWorkflowApprover,
    setApprovalWorkflow,
    selectApprovalWorkflowForEdit,
    clearApprovalWorkflowApprover,
    clearApprovalWorkflowApprovers,
    clearApprovalWorkflow,
    saveFastEditApprovalWorkflow,
    validateApprovalWorkflow,
    setApprovalWorkflowIsInitialFlow,
};
