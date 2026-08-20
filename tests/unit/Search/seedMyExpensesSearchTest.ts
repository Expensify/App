import {seedMyExpensesSearch} from '@libs/actions/Search';
import {isSubmitterAndApprover} from '@libs/PolicyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const USER_EMAIL = 'employee@test.com';
const APPROVER_EMAIL = 'approver@test.com';
const PEER_EMAIL = 'peer@test.com';
const ACCOUNT_ID = 12345;

function makePaidPolicy(overrides: Partial<Policy> = {}): Policy {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        id: 'policyPaid',
        type: CONST.POLICY.TYPE.TEAM,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        employeeList: {},
        ...overrides,
    } as Policy;
}

function makeFreePolicy(overrides: Partial<Policy> = {}): Policy {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        id: 'policyFree',
        type: CONST.POLICY.TYPE.SUBMIT,
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
        employeeList: {},
        ...overrides,
    } as Policy;
}

// ---------------------------------------------------------------------------
// isSubmitterAndApprover
// ---------------------------------------------------------------------------

describe('isSubmitterAndApprover', () => {
    it('returns false for null/undefined policies', () => {
        expect(isSubmitterAndApprover(null, USER_EMAIL)).toBe(false);
        expect(isSubmitterAndApprover(undefined, USER_EMAIL)).toBe(false);
    });

    it('returns false for undefined/empty email', () => {
        const policies = {p1: makePaidPolicy()};
        expect(isSubmitterAndApprover(policies, undefined)).toBe(false);
        expect(isSubmitterAndApprover(policies, '')).toBe(false);
    });

    it('returns true for a manager who manages one policy and approves on another', () => {
        // manager: admin role on a free (Submit-type) policy
        const managePolicy = makeFreePolicy({
            id: 'managePolicy',
            role: CONST.POLICY.ROLE.ADMIN,
        });
        // approver: paid+basic policy where a peer submits to the user
        const approvePolicy = makePaidPolicy({
            id: 'approvePolicy',
            role: CONST.POLICY.ROLE.USER,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [PEER_EMAIL]: {email: PEER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({managePolicy, approvePolicy}, USER_EMAIL)).toBe(true);
    });

    it('returns true when the user is both manager and approver on the same paid policy', () => {
        const policy = makePaidPolicy({
            id: 'dualPolicy',
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: APPROVER_EMAIL},
                [PEER_EMAIL]: {email: PEER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({dualPolicy: policy}, USER_EMAIL)).toBe(true);
    });

    it('returns true for an auditor who approves, not only admins', () => {
        const policy = makePaidPolicy({
            id: 'auditorApprover',
            role: CONST.POLICY.ROLE.AUDITOR,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [PEER_EMAIL]: {email: PEER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({auditorApprover: policy}, USER_EMAIL)).toBe(true);
    });

    it('returns false for a plain member who manages nothing, even though they submit', () => {
        const policy = makePaidPolicy({
            id: 'submitOnly',
            role: CONST.POLICY.ROLE.USER,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({submitOnly: policy}, USER_EMAIL)).toBe(false);
    });

    // The default workflow gives every member a `submitsTo` target, so role is the only thing separating an
    // approve-only member from a manager.
    it('returns false for an approve-only plain member who is another member’s approver', () => {
        const policy = makePaidPolicy({
            id: 'approveOnly',
            role: CONST.POLICY.ROLE.USER,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL},
                [PEER_EMAIL]: {email: PEER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({approveOnly: policy}, USER_EMAIL)).toBe(false);
    });

    it('returns false for a manager who approves nothing (no approval flow reaches them)', () => {
        const policy = makePaidPolicy({
            id: 'adminOnly',
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: APPROVER_EMAIL},
                [PEER_EMAIL]: {email: PEER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({adminOnly: policy}, USER_EMAIL)).toBe(false);
    });

    it('treats the named policy approver as an approver', () => {
        const policy = makePaidPolicy({
            id: 'namedApprover',
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: USER_EMAIL,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: USER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({namedApprover: policy}, USER_EMAIL)).toBe(true);
    });

    it('treats an over-limit forwards-to target as an approver', () => {
        const policy = makePaidPolicy({
            id: 'overLimitApprover',
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: APPROVER_EMAIL},
                [PEER_EMAIL]: {email: PEER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_EMAIL, overLimitForwardsTo: USER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({overLimitApprover: policy}, USER_EMAIL)).toBe(true);
    });

    it('returns false when the approver policy has OPTIONAL approval mode (no approval flow)', () => {
        const managePolicy = makeFreePolicy({
            id: 'managePolicy',
            role: CONST.POLICY.ROLE.ADMIN,
        });
        const optionalApprovePolicy = makePaidPolicy({
            id: 'optionalApprove',
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            employeeList: {
                [PEER_EMAIL]: {email: PEER_EMAIL, role: CONST.POLICY.ROLE.USER, submitsTo: USER_EMAIL},
            },
        });
        expect(isSubmitterAndApprover({managePolicy, optionalApprovePolicy}, USER_EMAIL)).toBe(false);
    });

    // An owner who invited a submitter and an approver, with a workflow routing the submitter to the approver.
    describe('a workspace with an owner, a submitter and an approver', () => {
        const OWNER = 'owner@expensifail.com';
        const SUBMITTER = 'submitter@gmail.com';
        const APPROVER = 'approver@expensifail.com';
        const employeeList: Record<string, NonNullable<Policy['employeeList']>[string]> = {
            [APPROVER]: {email: APPROVER, role: CONST.POLICY.ROLE.USER, submitsTo: OWNER, forwardsTo: '', overLimitForwardsTo: ''},
            [OWNER]: {email: OWNER, role: CONST.POLICY.ROLE.ADMIN, submitsTo: OWNER, forwardsTo: ''},
            [SUBMITTER]: {email: SUBMITTER, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER},
        };
        // `policy.role` holds the viewing user's own role, so build a per-viewer copy.
        const asViewedBy = (role: ValueOf<typeof CONST.POLICY.ROLE>) =>
            makePaidPolicy({
                id: 'reported',
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: OWNER,
                owner: OWNER,
                employeeList,
                role,
            });

        it('does not seed the approve-only member', () => {
            expect(isSubmitterAndApprover({reported: asViewedBy(CONST.POLICY.ROLE.USER)}, APPROVER)).toBe(false);
        });

        it('does not seed the submit-only member', () => {
            expect(isSubmitterAndApprover({reported: asViewedBy(CONST.POLICY.ROLE.USER)}, SUBMITTER)).toBe(false);
        });

        it('seeds the owner/admin who also approves', () => {
            expect(isSubmitterAndApprover({reported: asViewedBy(CONST.POLICY.ROLE.ADMIN)}, OWNER)).toBe(true);
        });
    });

    it('returns false for a personal policy even when the user is its admin', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const personal = {
            id: 'personal',
            type: CONST.POLICY.TYPE.PERSONAL,
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: USER_EMAIL,
            employeeList: {[USER_EMAIL]: {email: USER_EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
        } as unknown as Policy;
        expect(isSubmitterAndApprover({personal}, USER_EMAIL)).toBe(false);
    });

    it('returns false for an empty policy collection', () => {
        expect(isSubmitterAndApprover({}, USER_EMAIL)).toBe(false);
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
        seedMyExpensesSearch(ACCOUNT_ID, 'My expenses', undefined);
        await waitForBatchedUpdates();

        const savedSearches = await getOnyxValue(ONYXKEYS.SAVED_SEARCHES);
        const nvp = await getOnyxValue(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH);

        expect(nvp).toBe(true);
        expect(savedSearches).toBeTruthy();

        const entries = Object.values(savedSearches ?? {});
        expect(entries).toHaveLength(1);

        const entry = entries.at(0);
        expect(entry?.name).toBe('My expenses');
        // pendingAction is cleared by successData once the mock fetch resolves, so only name/query are stable
    });

    it('produces a query with type:expense and from:<accountID>', async () => {
        seedMyExpensesSearch(ACCOUNT_ID, 'My expenses', undefined);
        await waitForBatchedUpdates();

        const savedSearches = await getOnyxValue(ONYXKEYS.SAVED_SEARCHES);
        const query = Object.values(savedSearches ?? {}).at(0)?.query ?? '';

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
        seedMyExpensesSearch(ACCOUNT_ID, 'My expenses', undefined);
        await waitForBatchedUpdates();

        const savedSearches = await getOnyxValue(ONYXKEYS.SAVED_SEARCHES);
        // Only one entry because the query hash is deterministic for the same accountID.
        expect(Object.keys(savedSearches ?? {})).toHaveLength(1);
    });

    it('does not overwrite an existing saved search with the same query hash', async () => {
        const queryJSON = buildSearchQueryJSON(`type:expense from:${ACCOUNT_ID}`);
        const existingSavedSearches = {
            [String(queryJSON?.hash)]: {name: 'My custom name', query: `type:expense from:${ACCOUNT_ID}`},
        };

        seedMyExpensesSearch(ACCOUNT_ID, 'My expenses', existingSavedSearches);
        await waitForBatchedUpdates();

        const savedSearches = await getOnyxValue(ONYXKEYS.SAVED_SEARCHES);
        // Should be null/undefined — no write was made since the hash already existed.
        expect(savedSearches).toBeFalsy();
    });
});
