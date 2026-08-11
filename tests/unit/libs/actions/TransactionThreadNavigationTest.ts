import {shouldRefreshActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';

const SEARCH_HASH = 959171759;
const OTHER_SEARCH_HASH = 123456;

// The Spend page's expense list, as the carousel was seeded with it when a row was pressed.
const SEEDED_IDS = ['A1', 'A2', 'A3'];

describe('shouldRefreshActiveTransactionIDs', () => {
    it('refreshes when the search gained one expense, so y grows by one', () => {
        expect(shouldRefreshActiveTransactionIDs(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe(true);
    });

    it('refreshes when the search gained two expenses, so y grows by two', () => {
        expect(shouldRefreshActiveTransactionIDs(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A0', 'A00', ...SEEDED_IDS])).toBe(true);
    });

    it('refreshes when the search lost an expense', () => {
        expect(shouldRefreshActiveTransactionIDs(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A1', 'A3'])).toBe(true);
    });

    it('refreshes when the same expenses are re-sorted, because the counter index follows the list order', () => {
        expect(shouldRefreshActiveTransactionIDs(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A3', 'A2', 'A1'])).toBe(true);
    });

    it('does nothing when the carousel already matches the search', () => {
        expect(shouldRefreshActiveTransactionIDs(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, [...SEEDED_IDS])).toBe(false);
    });

    it('leaves another search’s carousel alone', () => {
        expect(shouldRefreshActiveTransactionIDs(SEEDED_IDS, OTHER_SEARCH_HASH, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe(false);
    });

    it('leaves a report-scoped carousel alone, since a drill-in clears the snapshot hash', () => {
        expect(shouldRefreshActiveTransactionIDs(['B1', 'B2'], undefined, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe(false);
    });

    it('does not seed a carousel that is not active yet — that is the row press’s job', () => {
        expect(shouldRefreshActiveTransactionIDs(undefined, SEARCH_HASH, SEARCH_HASH, SEEDED_IDS)).toBe(false);
        expect(shouldRefreshActiveTransactionIDs([], SEARCH_HASH, SEARCH_HASH, SEEDED_IDS)).toBe(false);
    });

    it('does not refresh down to a single expense, which has nothing to navigate between', () => {
        expect(shouldRefreshActiveTransactionIDs(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A1'])).toBe(false);
    });
});
