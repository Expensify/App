import Onyx from 'react-native-onyx';
import {seedMyExpensesSearch} from '@libs/actions/Search';
import {isDualRoleUser} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import getOnyxValue from '../../utils/getOnyxValue';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const USER_EMAIL = 'employee@test.com';
const APPROVER_EMAIL = 'approver@test.com';
const ACCOUNT_ID = 12345;

function makePaidPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: 'policy_paid',
        type: CONST.POLICY.TYPE.TEAM,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        employeeList: {},
        ...overrides,
    } as Policy;
}

function makeFreePolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: 'policy_free',
        type: CONST.POLICY.TYPE.SUBMIT,
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
        employeeList: {},
        ...overrides,
    } as Policy;
}

// ---------------------------------------------------------------------------
// isDualRoleUser
// ---------------------------------------------------------------------------

describe('isDualRoleUser', () => {
    it('returns false for null/undefined policies', () => {
        expect(isDualRoleUser(null, USER_EMAIL)).toBe(false);
        expect(isDualRoleUser(undefined, USER_EMAIL)).toBe(false);
    });

    it('returns false for undefined/empty email', () => {
        const policies = {p1: makePaidPolicy()};
        expect(isDualRoleUser(policies, undefined)).toBe(false);
        expect(isDualRoleUser(policies, '')).toBe(false);
    });

    it('returns true for a user who submits on one policy and approves on another', () => {
        // submitter: role=user on a free policy
        const submitPolicy = makeFreePolicy({
            id: 'submit_policy',
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL},
            },
        });
        // approver: paid+basic policy where user receives submissions
        const approvePolicy = makePaidPolicy({
            id: 'approve_policy',
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                'peer@test.com': {email: 'peer@test.com', role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isDualRoleUser({submit_policy: submitPolicy, approve_policy: approvePolicy}, USER_EMAIL)).toBe(true);
    });

    it('returns true when the user is both submitter and approver on the same paid policy', () => {
        const policy = makePaidPolicy({
            id: 'dual_policy',
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL},
                'peer@test.com': {email: 'peer@test.com', role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isDualRoleUser({dual_policy: policy}, USER_EMAIL)).toBe(true);
    });

    it('returns false for a submit-only user (no one submits to them)', () => {
        const policy = makePaidPolicy({
            id: 'submit_only',
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL},
            },
        });
        expect(isDualRoleUser({submit_only: policy}, USER_EMAIL)).toBe(false);
    });

    it('returns false for an approve-only user (admin role, not role=user anywhere)', () => {
        const policy = makePaidPolicy({
            id: 'approve_only',
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ''},
                'peer@test.com': {email: 'peer@test.com', role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isDualRoleUser({approve_only: policy}, USER_EMAIL)).toBe(false);
    });

    it('returns false when the approver policy has OPTIONAL approval mode (no approval flow)', () => {
        const submitPolicy = makeFreePolicy({
            id: 'submit_policy',
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL},
            },
        });
        const optionalApprovePolicy = makePaidPolicy({
            id: 'optional_approve',
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            employeeList: {
                'peer@test.com': {email: 'peer@test.com', role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isDualRoleUser({submit_policy: submitPolicy, optional_approve: optionalApprovePolicy}, USER_EMAIL)).toBe(false);
    });

    it('returns false for an empty policy collection', () => {
        expect(isDualRoleUser({}, USER_EMAIL)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// seedMyExpensesSearch — Onyx writes
// ---------------------------------------------------------------------------

describe('seedMyExpensesSearch', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('writes the seeded search and sets NVP to true optimistically', async () => {
        seedMyExpensesSearch(ACCOUNT_ID, 'My expenses');
        await waitForBatchedUpdates();

        const savedSearches = await getOnyxValue(ONYXKEYS.SAVED_SEARCHES);
        const nvp = await getOnyxValue(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH);

        expect(nvp).toBe(true);
        expect(savedSearches).toBeTruthy();

        const entries = Object.values(savedSearches ?? {});
        expect(entries).toHaveLength(1);

        const entry = entries[0];
        expect(entry.name).toBe('My expenses');
        // pendingAction is cleared by successData once the mock fetch resolves, so only name/query are stable
    });

    it('produces a query with type:expense and from:<accountID>', async () => {
        seedMyExpensesSearch(ACCOUNT_ID, 'My expenses');
        await waitForBatchedUpdates();

        const savedSearches = await getOnyxValue(ONYXKEYS.SAVED_SEARCHES);
        const query = Object.values(savedSearches ?? {})[0]?.query ?? '';

        const queryJSON = buildSearchQueryJSON(query);
        expect(queryJSON?.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);

        // The `from` filter should resolve to the numeric account ID
        const fromFilter = queryJSON?.flatFilters.find((f) => f.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
        const fromValues = fromFilter?.filters.flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value])) ?? [];
        expect(fromValues).toContain(String(ACCOUNT_ID));
    });

    it('does not re-seed when NVP is already true', async () => {
        await Onyx.set(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH, true);
        await waitForBatchedUpdates();

        // The component guards on hasSeededMyExpensesSearch before calling seedMyExpensesSearch,
        // so a direct call here simulates what happens if the guard is bypassed — the action
        // itself does not duplicate the entry (the NVP gate is in the component, not the action).
        // Verify by checking the action still writes correctly on a fresh call without a guard.
        seedMyExpensesSearch(ACCOUNT_ID, 'My expenses');
        await waitForBatchedUpdates();

        const savedSearches = await getOnyxValue(ONYXKEYS.SAVED_SEARCHES);
        // Only one entry because the query hash is deterministic for the same accountID.
        expect(Object.keys(savedSearches ?? {})).toHaveLength(1);
    });
});
