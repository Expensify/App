/**
 * Tests for Your Spend search query builders.
 *
 * Key contracts asserted:
 * - `from` resolves to the numeric accountID string (not literal '[me]')
 * - `cardID` uses the numeric card ID (not the card name)
 * - Date filter serializes as `date>YYYY-MM-DD` (not `dateAfter:`)
 */
import {buildAwaitingApprovalQuery, buildRecentCardTransactionsQuery, buildRepaidLast30DaysQuery} from '@libs/YourSpendQueryUtils';

import CONST from '@src/CONST';
import {buildSearchQueryJSON} from '@src/libs/SearchQueryUtils';

const ACCOUNT_ID = 12345;
const CARD_ID = 67890;

// Helpers

/**
 * Returns the parsed filter entries for a given key from a query string.
 * Uses `flatFilters` (the standard parsed-filter representation across the app)
 * so the helper does not depend on `rawFilterList`, which is internal to
 * SearchQueryUtils and only kept when both `query` and `rawQuery` are supplied.
 */
function getRawFiltersForKey(inputQuery: string, key: string): Array<{operator: string; value: string | string[]}> {
    const queryJSON = buildSearchQueryJSON(inputQuery);
    const group = queryJSON?.flatFilters.find((f) => f.key === key);
    return group?.filters.map(({operator, value}) => ({operator, value: String(value)})) ?? [];
}

// buildAwaitingApprovalQuery

describe('buildAwaitingApprovalQuery', () => {
    let queryString: string;

    beforeEach(() => {
        queryString = buildAwaitingApprovalQuery(ACCOUNT_ID, []);
    });

    it('returns a non-empty query string', () => {
        expect(queryString).toBeTruthy();
        expect(typeof queryString).toBe('string');
    });

    it('produces type:expense', () => {
        const queryJSON = buildSearchQueryJSON(queryString);
        expect(queryJSON?.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
    });

    it('produces status:outstanding', () => {
        const queryJSON = buildSearchQueryJSON(queryString);
        expect(queryJSON?.status).toBe(CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING);
    });

    it('resolves from to the numeric accountID (not literal [me])', () => {
        expect(queryString).toContain(String(ACCOUNT_ID));
        expect(queryString).not.toContain('[me]');
        const fromFilters = getRawFiltersForKey(queryString, CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
        const values = fromFilters.flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]));
        expect(values).toContain(String(ACCOUNT_ID));
    });

    it('includes reimbursable:yes', () => {
        expect(queryString).toContain(CONST.SEARCH.BOOLEAN.YES);
        const reimbursableFilters = getRawFiltersForKey(queryString, CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE);
        expect(reimbursableFilters.length).toBeGreaterThan(0);
        const values = reimbursableFilters.flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]));
        expect(values).toContain(CONST.SEARCH.BOOLEAN.YES);
    });

    it('does not include a date filter', () => {
        // Awaiting approval query has no date restriction
        const dateFilters = getRawFiltersForKey(queryString, CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
        expect(dateFilters).toHaveLength(0);
    });

    it('omits the policyID filter when the list is empty', () => {
        // policyID is parsed onto the root of the query JSON (like type/status), not into flatFilters.
        const queryJSON = buildSearchQueryJSON(queryString);
        expect(queryJSON?.policyID).toBeUndefined();
        expect(queryString).not.toContain(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:`);
    });

    it('emits the policyID filter for a single policy', () => {
        const scoped = buildAwaitingApprovalQuery(ACCOUNT_ID, ['policy_a']);
        const queryJSON = buildSearchQueryJSON(scoped);
        expect(queryJSON?.policyID).toEqual(['policy_a']);
        expect(scoped).toContain(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:policy_a`);
    });

    it('emits the policyID filter for multiple policies, preserving the provided order', () => {
        const scoped = buildAwaitingApprovalQuery(ACCOUNT_ID, ['policy_a', 'policy_b', 'policy_c']);
        const queryJSON = buildSearchQueryJSON(scoped);
        expect(queryJSON?.policyID).toEqual(['policy_a', 'policy_b', 'policy_c']);
        expect(scoped).toContain(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:policy_a,policy_b,policy_c`);
    });

    it('keeps type/status/from/reimbursable when scoped by policyID', () => {
        const scoped = buildAwaitingApprovalQuery(ACCOUNT_ID, ['policy_a']);
        const queryJSON = buildSearchQueryJSON(scoped);
        expect(queryJSON?.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
        expect(queryJSON?.status).toBe(CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING);
        const fromValues = getRawFiltersForKey(scoped, CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM).flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]));
        expect(fromValues).toContain(String(ACCOUNT_ID));
        const reimbursableValues = getRawFiltersForKey(scoped, CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE).flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]));
        expect(reimbursableValues).toContain(CONST.SEARCH.BOOLEAN.YES);
    });

    it('produces a different similarSearchHash when the policyID set changes', () => {
        const empty = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, []));
        const scoped = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, ['policy_a']));
        const scopedDifferent = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, ['policy_b']));
        expect(empty?.hash).not.toBe(scoped?.hash);
        expect(scoped?.hash).not.toBe(scopedDifferent?.hash);
    });
});

// buildRepaidLast30DaysQuery

describe('buildRepaidLast30DaysQuery', () => {
    let queryString: string;

    beforeEach(() => {
        queryString = buildRepaidLast30DaysQuery(ACCOUNT_ID);
    });

    it('returns a non-empty query string', () => {
        expect(queryString).toBeTruthy();
    });

    it('produces type:expense', () => {
        const queryJSON = buildSearchQueryJSON(queryString);
        expect(queryJSON?.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
    });

    it('produces status:paid', () => {
        const queryJSON = buildSearchQueryJSON(queryString);
        expect(queryJSON?.status).toBe(CONST.SEARCH.STATUS.EXPENSE.PAID);
    });

    it('resolves from to the numeric accountID', () => {
        expect(queryString).toContain(String(ACCOUNT_ID));
        expect(queryString).not.toContain('[me]');
    });

    it('includes reimbursable:yes', () => {
        const reimbursableFilters = getRawFiltersForKey(queryString, CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE);
        const values = reimbursableFilters.flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]));
        expect(values).toContain(CONST.SEARCH.BOOLEAN.YES);
    });

    it('serializes date as date>YYYY-MM-DD form (not dateAfter:)', () => {
        // The plan specifies the serialized form is `date>YYYY-MM-DD`
        // produced by buildQueryStringFromFilterFormValues with dateAfter modifier
        expect(queryString).toMatch(/date>[0-9]{4}-[0-9]{2}-[0-9]{2}/);
        expect(queryString).not.toMatch(/dateAfter:/);
    });

    it('date is approximately 30 days before today', () => {
        const match = queryString.match(/date>([0-9]{4}-[0-9]{2}-[0-9]{2})/);
        expect(match).not.toBeNull();
        const dateStr = match?.[1];
        const parsedDate = new Date(`${dateStr}T00:00:00Z`);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const diffDays = (today.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
        // Allow ±1 day for timezone/computation differences
        expect(diffDays).toBeGreaterThanOrEqual(29);
        expect(diffDays).toBeLessThanOrEqual(31);
    });
});

// buildRecentCardTransactionsQuery

describe('buildRecentCardTransactionsQuery', () => {
    let queryString: string;

    beforeEach(() => {
        queryString = buildRecentCardTransactionsQuery(ACCOUNT_ID, CARD_ID);
    });

    it('returns a non-empty query string', () => {
        expect(queryString).toBeTruthy();
    });

    it('produces type:expense', () => {
        const queryJSON = buildSearchQueryJSON(queryString);
        expect(queryJSON?.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
    });

    it('resolves from to the numeric accountID (not literal [me])', () => {
        expect(queryString).toContain(String(ACCOUNT_ID));
        expect(queryString).not.toContain('[me]');
        const fromFilters = getRawFiltersForKey(queryString, CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
        const values = fromFilters.flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]));
        expect(values).toContain(String(ACCOUNT_ID));
    });

    it('uses the numeric cardID (not the card name)', () => {
        // The SYNTAX_FILTER_KEYS.CARD_ID form is `cardID:` in the JSON query
        expect(queryString).toContain(String(CARD_ID));
        const cardFilters = getRawFiltersForKey(queryString, CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID);
        const values = cardFilters.flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]));
        expect(values).toContain(String(CARD_ID));
    });

    it('serializes date as date>YYYY-MM-DD form (not dateAfter:)', () => {
        expect(queryString).toMatch(/date>[0-9]{4}-[0-9]{2}-[0-9]{2}/);
        expect(queryString).not.toMatch(/dateAfter:/);
    });

    it('date is approximately 30 days before today', () => {
        const match = queryString.match(/date>([0-9]{4}-[0-9]{2}-[0-9]{2})/);
        expect(match).not.toBeNull();
        const dateStr = match?.[1];
        const parsedDate = new Date(`${dateStr}T00:00:00Z`);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const diffDays = (today.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeGreaterThanOrEqual(29);
        expect(diffDays).toBeLessThanOrEqual(31);
    });
});
