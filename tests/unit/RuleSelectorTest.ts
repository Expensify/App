import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {approvalWorkflowRulesSelector} from '@selectors/Rule';

const approvalRule: Rule = {
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: 'policy1',
    triggers: toIndexMap([CONST.RULES.TRIGGERS.REPORT_SUBMIT]),
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: ['a@example.com']},
    actions: toIndexMap([{name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'b@example.com'}]),
};

const expenseRule: Rule = {
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: 'policy1',
    triggers: toIndexMap([CONST.RULES.TRIGGERS.CREATE_TRANSACTION]),
    filters: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: ['Travel']},
    actions: toIndexMap([{name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, value: 'Travel'}]),
};

describe('approvalWorkflowRulesSelector', () => {
    it('keeps only the policy approval workflow rules, under their collection keys', () => {
        // Given an account whose rules mix approval workflow rules with expense rules and an account-scoped rule
        const pendingDeleteApprovalRule: Rule = {...approvalRule, scopeID: 'policy2', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const rules: OnyxCollection<Rule> = {
            [`${ONYXKEYS.COLLECTION.RULE}1`]: approvalRule,
            [`${ONYXKEYS.COLLECTION.RULE}2`]: expenseRule,
            [`${ONYXKEYS.COLLECTION.RULE}3`]: pendingDeleteApprovalRule,
            [`${ONYXKEYS.COLLECTION.RULE}4`]: {...approvalRule, scope: CONST.RULES.SCOPE.ACCOUNT},
        };

        // When Search narrows the collection for approval routing
        const result = approvalWorkflowRulesSelector(rules);

        // Then only the policy approval workflow rules stay, by reference and including pending deletes, because approval routing already skips
        // those itself and must see exactly what it saw with the full collection
        expect(result).toEqual({[`${ONYXKEYS.COLLECTION.RULE}1`]: approvalRule, [`${ONYXKEYS.COLLECTION.RULE}3`]: pendingDeleteApprovalRule});
        expect(result?.[`${ONYXKEYS.COLLECTION.RULE}1`]).toBe(approvalRule);
    });

    it('returns an empty collection before the rules load', () => {
        // Given the rules collection hasn't loaded
        // When Search narrows it
        const result = approvalWorkflowRulesSelector(undefined);

        // Then approval routing gets no rules and falls back to the policy's employee list, as it did with no collection
        expect(result).toEqual({});
    });
});
