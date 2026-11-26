/* eslint-disable @typescript-eslint/naming-convention -- fixtures use `rules_<id>` Onyx collection keys */
import {filterRulesForPolicy, groupRulesByPolicyID} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import type Rule from '@src/types/onyx/Rule';

describe('RuleUtils', () => {
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

    describe('filterRulesForPolicy', () => {
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

    describe('groupRulesByPolicyID', () => {
        it('groups policy rules by workspace in one pass, matching a per-workspace filter', () => {
            // Given rules for two workspaces plus a rule with no workspace, which can't belong to any of them
            const collection = {
                rules_1: ruleForPolicy('policy1'),
                rules_2: ruleForPolicy('policy2'),
                rules_3: ruleForPolicy('policy1'),
                rules_4: ruleForPolicy(''),
            };

            // When grouping the collection by workspace
            const result = groupRulesByPolicyID(collection);

            // Then each workspace gets exactly what filtering for it would return, so callers can swap one for the other
            expect(Object.keys(result).sort()).toEqual(['policy1', 'policy2']);
            expect(result.policy1).toEqual(filterRulesForPolicy(collection, 'policy1'));
            expect(result.policy2).toEqual(filterRulesForPolicy(collection, 'policy2'));
        });
    });
});
