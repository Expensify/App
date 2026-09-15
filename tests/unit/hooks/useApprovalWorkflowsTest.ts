import {renderHook, waitFor} from '@testing-library/react-native';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createMock from '../../utils/createMock';
import {buildPersonalDetails} from '../../utils/TestHelper';

jest.mock('@hooks/useLocalize');
jest.mock('@hooks/usePermissions');

/** usePermissions reads betas from OnyxListItemProvider's React context, not straight from Onyx, so the beta flag
 * is mocked directly here rather than wrapping renderHook with that provider. */
function mockIsBetaEnabled(enabledBetas: string[]) {
    jest.mocked(usePermissions).mockReturnValue(createMock<ReturnType<typeof usePermissions>>({isBetaEnabled: (beta) => enabledBetas.includes(beta)}));
}

const POLICY_ID = '1';
const OTHER_POLICY_ID = '2';
const SUBMITTER_ACCOUNT_ID = 1;
const APPROVER_ACCOUNT_ID = 2;
const SUBMITTER_EMAIL = 'submitter@example.com';
const APPROVER_EMAIL = 'approver@example.com';
const CURRENT_USER_LOGIN = 'admin@example.com';

const personalDetails: PersonalDetailsList = {};
personalDetails[SUBMITTER_ACCOUNT_ID] = buildPersonalDetails(SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, 'Submitter');
personalDetails[APPROVER_ACCOUNT_ID] = buildPersonalDetails(APPROVER_EMAIL, APPROVER_ACCOUNT_ID, 'Approver');

function indexMap<T>(...values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

/** Writes the submit -> forward + approve rule pair `createForwardApproveRules` in WorkflowTest.ts builds by hand. */
async function seedForwardApproveRules(policyID: string, submitter: string, approver: string, keyPrefix: string) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}${keyPrefix}1`, {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: policyID,
        triggers: indexMap(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT),
        filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: [submitter]},
        actions: indexMap({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver}),
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}${keyPrefix}2`, {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: policyID,
        triggers: indexMap(CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_APPROVE),
        filters: {
            operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
            left: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: [submitter]},
            right: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO, right: approver},
        },
        actions: indexMap({name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.APPROVE_REPORT}),
    });
}

describe('useApprovalWorkflows', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.mocked(useLocalize).mockReturnValue(createMock<ReturnType<typeof useLocalize>>({localeCompare: (a: string, b: string) => a.localeCompare(b)}));
        mockIsBetaEnabled([]);
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it('derives workflows from employeeList when the beta is off', async () => {
        const policy = {
            ...createRandomPolicy(1),
            approver: APPROVER_EMAIL,
            employeeList: {
                [SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL, submitsTo: APPROVER_EMAIL},
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL},
            },
        };

        const {result} = renderHook(() => useApprovalWorkflows({policy, personalDetails, currentUserLogin: CURRENT_USER_LOGIN}));

        await waitFor(() => {
            expect(result.current.approvalWorkflows).toHaveLength(1);
            expect(result.current.approvalWorkflows.at(0)?.members.map((member) => member.email)).toEqual([SUBMITTER_EMAIL]);
            expect(result.current.approvalWorkflows.at(0)?.approvers.map((approver) => approver.email)).toEqual([APPROVER_EMAIL]);
        });
    });

    it('derives workflows from rules when MULTIPLE_APPROVERS is enabled', async () => {
        mockIsBetaEnabled([CONST.BETAS.MULTIPLE_APPROVERS]);
        await seedForwardApproveRules(POLICY_ID, SUBMITTER_EMAIL, APPROVER_EMAIL, 'rule');

        // employeeList has no submitsTo entry at all: if the hook fell back to the employeeList path (beta not
        // actually read), this workflow would come back empty instead of built from the rules. `approver` matches
        // the rule's approver, so this is the policy's one and only (default) workflow, and no separate empty
        // placeholder workflow gets prepended for a "default" no one is actually on.
        const policy = {
            ...createRandomPolicy(1),
            id: POLICY_ID,
            approver: APPROVER_EMAIL,
            employeeList: {[SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL}, [APPROVER_EMAIL]: {email: APPROVER_EMAIL}},
        };

        const {result} = renderHook(() => useApprovalWorkflows({policy, personalDetails, currentUserLogin: CURRENT_USER_LOGIN}));

        await waitFor(() => {
            expect(result.current.approvalWorkflows).toHaveLength(1);
            expect(result.current.approvalWorkflows.at(0)?.members.map((member) => member.email)).toEqual([SUBMITTER_EMAIL]);
            expect(result.current.approvalWorkflows.at(0)?.approvers.map((approver) => approver.email)).toEqual([APPROVER_EMAIL]);
        });
    });

    it('ignores rules belonging to another policy', async () => {
        mockIsBetaEnabled([CONST.BETAS.MULTIPLE_APPROVERS]);
        await seedForwardApproveRules(OTHER_POLICY_ID, SUBMITTER_EMAIL, APPROVER_EMAIL, 'otherPolicyRule');

        const policy = {...createRandomPolicy(1), id: POLICY_ID, employeeList: {[SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL}}};

        const {result} = renderHook(() => useApprovalWorkflows({policy, personalDetails, currentUserLogin: CURRENT_USER_LOGIN}));

        await waitFor(() => {
            expect(result.current.approvalWorkflows).toHaveLength(0);
        });
    });
});
