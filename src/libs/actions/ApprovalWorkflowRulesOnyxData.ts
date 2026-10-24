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
};

/**
 * Build the Onyx updates for a request that applies a diff of approval-workflow rules: the diff shows while the request
 * is pending, and is kept when it succeeds or rolled back when it fails.
 */
function buildApprovalWorkflowRulesOnyxData({policyID, rulesDiff, previousRules}: ApprovalWorkflowRulesOnyxDataParams) {
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
 * Build the Onyx updates for a request whose backend deletes the policy's approval workflow rules, the way
 * setApprovalWorkflowRules deletes rules: they stop routing while the request is pending, and come back if it fails.
 */
function buildDeleteApprovalWorkflowRulesOnyxData(policyID: string, rules: OnyxCollection<Rule>) {
    const rulesDiff: ApprovalWorkflowRulesDiff = Object.fromEntries(Object.keys(getApprovalWorkflowRulesForPolicy(rules, policyID)).map((ruleID) => [ruleID, null]));
    return buildApprovalWorkflowRulesOnyxData({policyID, rulesDiff, previousRules: rules});
}

export {buildApprovalWorkflowRulesOnyxData, buildDeleteApprovalWorkflowRulesOnyxData};
export type {ApprovalWorkflowRulesOnyxDataParams};
