/* eslint-disable @typescript-eslint/naming-convention -- fixtures use `rules_<id>` Onyx collection keys */
import {filterRulesForPolicy, hasTravelConditionRule} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import type Rule from '@src/types/onyx/Rule';

describe('RuleUtils', () => {
    describe('filterRulesForPolicy', () => {
        const ruleForPolicy = (scopeID: string, extra: Partial<Omit<Rule, 'actions' | 'filters' | 'triggers'>> = {}): Rule => ({
            scope: CONST.RULES.SCOPE.POLICY,
            scopeID,
            triggers: {'1': CONST.RULES.TRIGGERS.REPORT_SUBMIT},
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                right: 'a@example.com',
            },
            actions: {
                '1': {
                    name: CONST.RULES.ACTIONS.FORWARD_TO,
                    approver: 'b@example.com',
                },
            },
            ...extra,
        });

        it('keeps only the rules scoped to the given policy, preserving the collection keys', () => {
            // Given a rules collection holding rules for two different policies
            const mine = ruleForPolicy('policy1');
            const collection = {rules_1: mine, rules_2: ruleForPolicy('policy2')};

            // When filtering it for one of them
            const result = filterRulesForPolicy(collection, 'policy1');

            // Then only that policy's rule is kept under its original key, passed through by reference so callers still see the full rule
            expect(result).toEqual({rules_1: mine});
            expect(result.rules_1).toBe(mine);
        });

        it('keeps rules pending deletion, leaving that decision to the caller', () => {
            // Given a policy rule that is pending deletion
            const pendingDelete = ruleForPolicy('policy1', {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            });

            // When filtering the collection for that policy
            const result = filterRulesForPolicy({rules_1: pendingDelete}, 'policy1');

            // Then the rule is still returned, because only callers know whether pending deletes should count
            expect(result).toEqual({rules_1: pendingDelete});
        });

        it('returns an empty collection when there is no policy or no rules', () => {
            // Given a missing policyID or a missing rules collection, as callers pass them before Onyx or the route has loaded
            const rules = {rules_1: ruleForPolicy('policy1')};

            // When filtering with either one missing
            const withoutPolicy = filterRulesForPolicy(rules, undefined);
            const withoutRules = filterRulesForPolicy(undefined, 'policy1');

            // Then an empty collection comes back, so callers can always spread or iterate the result
            expect(withoutPolicy).toEqual({});
            expect(withoutRules).toEqual({});
        });
    });

    describe('hasTravelConditionRule', () => {
        const travelPlatformCondition = {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TRAVEL_PLATFORM, right: CONST.SEARCH.TRAVEL_PLATFORM.OTHER};
        const categoryCondition = {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, right: 'Travel'};
        const ruleWithFilters = (scopeID: string, filters: Rule['filters'], extra: Partial<Omit<Rule, 'actions' | 'filters' | 'triggers'>> = {}): Rule => ({
            scope: CONST.RULES.SCOPE.POLICY,
            scopeID,
            triggers: {'1': CONST.RULES.TRIGGERS.CREATE_TRANSACTION},
            filters,
            actions: {'1': {name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, value: 'Travel'}},
            ...extra,
        });

        it('finds a travel condition nested anywhere in a rule of the policy', () => {
            // Given a policy rule that combines a category condition with a travel platform condition
            const rules = {rules_1: ruleWithFilters('policy1', {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: categoryCondition, right: travelPlatformCondition})};

            // When checking whether the policy already flags travel
            const result = hasTravelConditionRule(rules, 'policy1');

            // Then the nested travel condition counts, so the Travel page stops suggesting a rule the admin already has
            expect(result).toBe(true);
        });

        it.each([
            ['the travel rule belongs to another workspace', {rules_1: ruleWithFilters('policy2', travelPlatformCondition)}],
            ['the travel rule is being deleted', {rules_1: ruleWithFilters('policy1', travelPlatformCondition, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})}],
            ['the rule has no travel condition', {rules_1: ruleWithFilters('policy1', categoryCondition)}],
        ])('ignores a rule when %s', (_description, rules) => {
            // Given rules that shouldn't count as flagging this workspace's travel
            // When checking the workspace
            const result = hasTravelConditionRule(rules, 'policy1');

            // Then no travel rule is found, so the Travel page keeps suggesting one
            expect(result).toBe(false);
        });
    });
});
