/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook, waitFor} from '@testing-library/react-native';

import useHasApprovalWorkflowRules from '@hooks/useHasApprovalWorkflowRules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Rule} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy1';

function buildRule(overrides: Partial<Rule> = {}): Rule {
    return {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: POLICY_ID,
        triggers: {'1': CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT},
        filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: 'a@example.com'},
        actions: {'1': {name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver: 'b@example.com'}},
        ...overrides,
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
        // Given a workspace whose only rule is a merchant rule, which Auth sends to admins in the same collection even though the
        // App types only describe approval workflow rules
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test needs a rule shape the App types don't allow, which Auth still sends
        const merchantRule = {...buildRule(), actions: {'1': {name: 'Set', field: 'category', value: 'Travel'}}} as unknown as Rule;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}1`, merchantRule);
        const {result} = renderHook(() => useHasApprovalWorkflowRules(POLICY_ID));
        await waitForBatchedUpdates();

        // Then no approval workflow rule routes its reports
        expect(result.current).toBe(false);

        // When the workspace gets a rule that forwards its reports
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}2`, buildRule());

        // Then approval workflow rules route its reports
        await waitFor(() => expect(result.current).toBe(true));
    });

    it("only counts the workspace's own rules that are not pending deletion", async () => {
        // Given an approval workflow rule of another workspace, and one of this workspace that is being deleted offline
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}1`, buildRule({scopeID: 'policy2'}));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RULE}2`, buildRule({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}));
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
