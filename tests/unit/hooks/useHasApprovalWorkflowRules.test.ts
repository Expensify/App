/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook, waitFor} from '@testing-library/react-native';

import useHasApprovalWorkflowRules from '@hooks/useHasApprovalWorkflowRules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Rule} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy1';

function buildApprovalWorkflowRule(extra: Partial<Omit<Rule, 'actions' | 'filters' | 'triggers'>> = {}): Rule {
    return {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: POLICY_ID,
        triggers: {'1': CONST.RULES.TRIGGERS.REPORT_SUBMIT},
        filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: 'a@example.com'},
        actions: {'1': {name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'b@example.com'}},
        ...extra,
    };
}

describe('useHasApprovalWorkflowRules', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('only counts the rules that route reports', async () => {
        // Given a workspace whose only rule is an expense default, which shares the rules collection with approval workflows
        const expenseDefaultRule: Rule = {
            scope: CONST.RULES.SCOPE.POLICY,
            scopeID: POLICY_ID,
            triggers: {'1': CONST.RULES.TRIGGERS.CREATE_TRANSACTION},
            filters: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, right: 'Starbucks'},
            actions: {'1': {name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, value: 'Coffee'}},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}1`, expenseDefaultRule);
        const {result} = renderHook(() => useHasApprovalWorkflowRules(POLICY_ID));
        await waitForBatchedUpdates();

        // Then no approval workflow rule routes its reports
        expect(result.current).toBe(false);

        // When the workspace gets a rule that forwards its reports
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}2`, buildApprovalWorkflowRule());

        // Then approval workflow rules route its reports
        await waitFor(() => expect(result.current).toBe(true));
    });

    it("only counts the workspace's own rules that are not pending deletion", async () => {
        // Given an approval workflow rule of another workspace, and one of this workspace that is being deleted offline
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}1`, buildApprovalWorkflowRule({scopeID: 'policy2'}));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}2`, buildApprovalWorkflowRule({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}));
        const {result} = renderHook(() => useHasApprovalWorkflowRules(POLICY_ID));
        await waitForBatchedUpdates();

        // Then neither counts for this workspace
        expect(result.current).toBe(false);

        // When the deletion is undone
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}2`, {pendingAction: null});

        // Then the workspace's rule routes its reports again
        await waitFor(() => expect(result.current).toBe(true));
    });
});
