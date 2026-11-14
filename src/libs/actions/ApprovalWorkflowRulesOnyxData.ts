/**
 * Builders for the Onyx updates of requests that change a policy's approval workflow rules
 * (`ONYXKEYS.COLLECTION.RULE`). They neither read Onyx nor send requests, only build updates from their arguments.
 * Kept out of `Workflow.ts` so that connection actions (Merge, Gusto, Zenefits) can use them without importing the
 * whole workflow action module.
 */
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {ApprovalWorkflowRulesDiff} from '@libs/RuleUtils';
import {getApprovalWorkflowRulesForPolicy} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type ApprovalWorkflowRulesOnyxDataParams = {
    policyID: string;

    /**
     * Diff of rules keyed by ruleID. A value of `ApprovalWorkflowRule` sets/replaces the rule
     * under its `ruleID` in the `ONYXKEYS.COLLECTION.RULE` collection; a value of `null` removes it.
     */
    rulesDiff: ApprovalWorkflowRulesDiff;

    /** The rules as currently stored in Onyx, which `rulesDiff` is applied on top of. Used to roll back on failure. */
    previousRules: OnyxCollection<Rule>;

    /**
     * Members whose approver this save changes without any rule of theirs recording it, which happens when they fall
     * back to a default workflow that routes through the employee list. They are marked pending so the surfaces
     * showing their approver dim until the save lands.
     */
    membersWithPendingApprover?: string[];
};

type ApprovalWorkflowRulesOnyxUpdate = OnyxUpdate<typeof ONYXKEYS.COLLECTION.RULE | typeof ONYXKEYS.COLLECTION.POLICY>;

type ApprovalWorkflowRulesOnyxData = {
    optimisticData: ApprovalWorkflowRulesOnyxUpdate[];
    successData: ApprovalWorkflowRulesOnyxUpdate[];
    failureData: ApprovalWorkflowRulesOnyxUpdate[];
};

/**
 * Build the Onyx updates for a request that applies a diff of approval-workflow rules: the diff shows while the request
 * is pending, and is kept when it succeeds or rolled back when it fails.
 */
function buildApprovalWorkflowRulesOnyxData({policyID, rulesDiff, previousRules, membersWithPendingApprover}: ApprovalWorkflowRulesOnyxDataParams): ApprovalWorkflowRulesOnyxData {
    const genericError = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');

    const optimisticData: ApprovalWorkflowRulesOnyxUpdate[] = [];
    const successData: ApprovalWorkflowRulesOnyxUpdate[] = [];
    const failureData: ApprovalWorkflowRulesOnyxUpdate[] = [];

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

    if (membersWithPendingApprover?.length) {
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
        const markMembers = (pendingAction: PendingAction | null) => Object.fromEntries(membersWithPendingApprover.map((email) => [email, {pendingFields: {submitsTo: pendingAction}}]));

        optimisticData.push({onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: markMembers(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE)}});
        successData.push({onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: markMembers(null)}});
        failureData.push({onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: markMembers(null)}});
    }

    return {optimisticData, successData, failureData};
}

/**
 * Build the Onyx updates for a request whose backend deletes the policy's approval workflow rules, the way
 * setApprovalWorkflowRules deletes rules: they stop routing while the request is pending, and come back if it fails.
 */
function buildDeleteApprovalWorkflowRulesOnyxData(policyID: string, rules: OnyxCollection<Rule>) {
    const rulesDiff: ApprovalWorkflowRulesDiff = Object.fromEntries(Object.keys(getApprovalWorkflowRulesForPolicy(rules, policyID)).map((ruleID) => [ruleID, null]));
    return buildApprovalWorkflowRulesOnyxData({policyID, rulesDiff, previousRules: rules});
}

export {buildApprovalWorkflowRulesOnyxData, buildDeleteApprovalWorkflowRulesOnyxData};
export type {ApprovalWorkflowRulesOnyxDataParams};
