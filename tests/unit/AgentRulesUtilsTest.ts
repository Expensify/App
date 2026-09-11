import {getAgentRuleDisplayTitle, getVisibleAgentRules, isRuleBotEnforcingRules, isRuleBotEnforcingRulesOnAnyPolicy} from '@libs/AgentRulesUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {AgentRule} from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';

const RULE_BOT_ACCOUNT_ID = 12345;

function buildAgentRule(ruleID: string, overrides: Partial<AgentRule> = {}): AgentRule {
    return {
        ruleID,
        prompt: `Prompt for ${ruleID}`,
        created: '2025-01-01 00:00:00',
        ...overrides,
    };
}

function buildPolicyWithAgentRules(agentRules: Record<string, AgentRule> | undefined, ruleBotAccountID: number | undefined = RULE_BOT_ACCOUNT_ID): Policy {
    const policy = createRandomPolicy(1);
    return {
        ...policy,
        ruleBotAccountID,
        rules: {
            ...policy.rules,
            agentRules,
        },
    };
}

describe('AgentRulesUtils', () => {
    describe('getAgentRuleDisplayTitle', () => {
        it('returns the title when present, collapsing extra whitespace', () => {
            const rule = buildAgentRule('rule1', {title: '  Flag   meals\nover $50  '});
            expect(getAgentRuleDisplayTitle(rule)).toBe('Flag meals over $50');
        });

        it('falls back to the prompt when the rule has no title', () => {
            const rule = buildAgentRule('rule1', {prompt: 'Flag all weekend expenses'});
            expect(getAgentRuleDisplayTitle(rule)).toBe('Flag all weekend expenses');
        });
    });

    describe('getVisibleAgentRules', () => {
        it('returns rules sorted with the most recently created first', () => {
            const agentRules = {
                older: buildAgentRule('older', {created: '2025-01-01 00:00:00'}),
                newer: buildAgentRule('newer', {created: '2025-06-01 00:00:00'}),
            };
            const visibleRules = getVisibleAgentRules(agentRules, false);
            expect(visibleRules.map((rule) => rule.ruleID)).toEqual(['newer', 'older']);
        });

        it('hides rules pending deletion when online but keeps them when offline', () => {
            const agentRules = {
                active: buildAgentRule('active'),
                deleted: buildAgentRule('deleted', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            };
            expect(getVisibleAgentRules(agentRules, false).map((rule) => rule.ruleID)).toEqual(['active']);
            expect(getVisibleAgentRules(agentRules, true)).toHaveLength(2);
        });

        it('returns an empty array when there are no rules', () => {
            expect(getVisibleAgentRules(undefined, false)).toEqual([]);
        });
    });

    describe('isRuleBotEnforcingRules', () => {
        it('returns true when the account is the policy RuleBot and an active rule exists', () => {
            const policy = buildPolicyWithAgentRules({rule1: buildAgentRule('rule1')});
            expect(isRuleBotEnforcingRules(RULE_BOT_ACCOUNT_ID, policy)).toBe(true);
        });

        it('returns false when the account is not the policy RuleBot', () => {
            const policy = buildPolicyWithAgentRules({rule1: buildAgentRule('rule1')});
            expect(isRuleBotEnforcingRules(RULE_BOT_ACCOUNT_ID + 1, policy)).toBe(false);
        });

        it('returns false when the accountID is undefined', () => {
            const policy = buildPolicyWithAgentRules({rule1: buildAgentRule('rule1')});
            expect(isRuleBotEnforcingRules(undefined, policy)).toBe(false);
        });

        it('returns false when the policy has no agent rules', () => {
            const policy = buildPolicyWithAgentRules(undefined);
            expect(isRuleBotEnforcingRules(RULE_BOT_ACCOUNT_ID, policy)).toBe(false);
        });

        it('returns false when every agent rule is pending deletion', () => {
            const policy = buildPolicyWithAgentRules({
                rule1: buildAgentRule('rule1', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            });
            expect(isRuleBotEnforcingRules(RULE_BOT_ACCOUNT_ID, policy)).toBe(false);
        });

        it('returns false when the policy is undefined', () => {
            expect(isRuleBotEnforcingRules(RULE_BOT_ACCOUNT_ID, undefined)).toBe(false);
        });
    });

    describe('isRuleBotEnforcingRulesOnAnyPolicy', () => {
        it('returns true when the account enforces rules on at least one policy', () => {
            const policies: OnyxCollection<Policy> = {
                policy1: buildPolicyWithAgentRules(undefined, undefined),
                policy2: buildPolicyWithAgentRules({rule1: buildAgentRule('rule1')}),
            };
            expect(isRuleBotEnforcingRulesOnAnyPolicy(RULE_BOT_ACCOUNT_ID, policies)).toBe(true);
        });

        it('returns false when no policy has the account as an enforcing RuleBot', () => {
            const policies: OnyxCollection<Policy> = {
                policy1: buildPolicyWithAgentRules({rule1: buildAgentRule('rule1')}, RULE_BOT_ACCOUNT_ID + 1),
                policy2: undefined,
            };
            expect(isRuleBotEnforcingRulesOnAnyPolicy(RULE_BOT_ACCOUNT_ID, policies)).toBe(false);
        });

        it('returns false when the accountID is undefined', () => {
            const policies: OnyxCollection<Policy> = {
                policy1: buildPolicyWithAgentRules({rule1: buildAgentRule('rule1')}),
            };
            expect(isRuleBotEnforcingRulesOnAnyPolicy(undefined, policies)).toBe(false);
        });

        it('returns false when the policy collection is undefined', () => {
            expect(isRuleBotEnforcingRulesOnAnyPolicy(RULE_BOT_ACCOUNT_ID, undefined)).toBe(false);
        });
    });
});
