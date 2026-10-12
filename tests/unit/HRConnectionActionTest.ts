import {updateGustoApprovalMode} from '@libs/actions/connections/Gusto';
import {updateZenefitsApprovalMode} from '@libs/actions/connections/Zenefits';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Rule from '@src/types/onyx/Rule';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);
const policyID = 'policyID';
const approvalWorkflowRuleKey = `${ONYXKEYS.COLLECTION.RULE}1`;
const approvalWorkflowRule: Rule = {
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: policyID,
    triggers: toIndexMap([CONST.RULES.TRIGGERS.REPORT_SUBMIT]),
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: 'submitter@example.com'},
    actions: toIndexMap([{name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'approver@example.com'}]),
};
const rules = {[approvalWorkflowRuleKey]: approvalWorkflowRule};

function isRuleUpdate(update: {key: string}) {
    return update.key.startsWith(ONYXKEYS.COLLECTION.RULE);
}

describe.each([
    {provider: 'Gusto', command: WRITE_COMMANDS.UPDATE_GUSTO_APPROVAL_MODE, updateApprovalMode: updateGustoApprovalMode, approvalModes: CONST.GUSTO.APPROVAL_MODE},
    {provider: 'Zenefits', command: WRITE_COMMANDS.UPDATE_ZENEFITS_APPROVAL_MODE, updateApprovalMode: updateZenefitsApprovalMode, approvalModes: CONST.ZENEFITS.APPROVAL_MODE},
])('$provider approval mode', ({command, updateApprovalMode, approvalModes}) => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([approvalModes.BASIC, approvalModes.MANAGER])("deletes the workspace's approval workflow rules when moving from custom to %s", (approvalMode) => {
        // Given a workspace whose reports an approval workflow rule routes, connected in custom mode
        // When the connection moves to a mode where its syncs set the approvers, so the backend deletes the workspace's approval workflow rules
        updateApprovalMode(policyID, approvalMode, approvalModes.CUSTOM, rules);

        // Then the rule stops routing while the request is pending, so the workflows page shows what the connection will set up,
        // and it is gone once the request succeeds or back if it fails
        expect(mockWrite).toHaveBeenCalledWith(command, {policyID, approvalMode}, expect.anything());
        const {optimisticData, successData, failureData} = mockWrite.mock.calls.at(0)?.[2] ?? {};
        expect(optimisticData).toContainEqual({
            onyxMethod: Onyx.METHOD.MERGE,
            key: approvalWorkflowRuleKey,
            value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null},
        });
        expect(successData).toContainEqual({onyxMethod: Onyx.METHOD.SET, key: approvalWorkflowRuleKey, value: null});
        expect(failureData).toContainEqual({onyxMethod: Onyx.METHOD.SET, key: approvalWorkflowRuleKey, value: expect.objectContaining({...approvalWorkflowRule, pendingAction: null})});
    });

    it("keeps the workspace's approval workflow rules in custom", () => {
        // Given a workspace whose reports an approval workflow rule routes
        // When the connection moves to custom, where its syncs leave the approvers to the workspace's own setup
        updateApprovalMode(policyID, approvalModes.CUSTOM, approvalModes.BASIC, rules);

        // Then the request leaves the rules alone, since the backend keeps them too
        const {optimisticData, successData, failureData} = mockWrite.mock.calls.at(0)?.[2] ?? {};
        expect(optimisticData?.some(isRuleUpdate)).toBe(false);
        expect(successData?.some(isRuleUpdate)).toBe(false);
        expect(failureData?.some(isRuleUpdate)).toBe(false);
    });
});
