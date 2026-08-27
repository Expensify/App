import {clearActiveTransactionIDs, setActiveTransactionIDs, shouldPreserveActiveTransactionIDs, shouldWriteActiveTransactionIDsForSearch} from '@libs/actions/TransactionThreadNavigation';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const SEARCH_HASH = 959171759;
const OTHER_SEARCH_HASH = 123456;

// The Spend page's expense list, as the carousel was seeded with it when a row was pressed.
const SEEDED_IDS = ['A1', 'A2', 'A3'];

// The Spend page holds one expense from report A and two from report B; report B owns only its own two.
const SPEND_PAGE_IDS = ['A1', 'B1', 'B2'];
const REPORT_B_IDS = ['B1', 'B2'];

describe('shouldWriteActiveTransactionIDsForSearch', () => {
    it('refreshes when the search gained one expense, so y grows by one', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe(true);
    });

    it('refreshes when the search gained two expenses, so y grows by two', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A0', 'A00', ...SEEDED_IDS])).toBe(true);
    });

    it('refreshes when the search lost an expense but still has two to navigate between', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A1', 'A3'])).toBe(true);
    });

    it('refreshes when the same expenses are re-sorted, because the counter index follows the list order', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A3', 'A2', 'A1'])).toBe(true);
    });

    it('does nothing when the carousel already matches the search', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, [...SEEDED_IDS])).toBe(false);
    });

    it('leaves another search\u2019s carousel alone', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, OTHER_SEARCH_HASH, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe(false);
    });

    it('leaves a report-scoped carousel alone, since a drill-in clears the snapshot hash', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(['B1', 'B2'], undefined, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe(false);
    });

    it('adopts the carousel when nothing is active, so it comes back after a clear', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(undefined, undefined, SEARCH_HASH, SEEDED_IDS)).toBe(true);
        expect(shouldWriteActiveTransactionIDsForSearch([], undefined, SEARCH_HASH, SEEDED_IDS)).toBe(true);
    });

    it('does not adopt a carousel for a single expense, which is nothing to navigate between', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(undefined, undefined, SEARCH_HASH, ['A1'])).toBe(false);
    });

    it('re-seeds down to a single remaining expense rather than retiring the carousel', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A1'])).toBe(true);
    });

    it('restores the carousel once a shrunken search grows back to two expenses', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(['A1'], SEARCH_HASH, SEARCH_HASH, ['A1', 'A2'])).toBe(true);
    });

    // A merge deletes transactions through an unbatched Onyx.set, so the derived list momentarily empties. Writing that
    // would leave nothing for the settled render to recover from.
    it('ignores an empty search list, which is the shape a search takes mid-update', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, [])).toBe(false);
    });

    it('leaves another search\u2019s carousel alone even when this search is empty', () => {
        expect(shouldWriteActiveTransactionIDsForSearch(SEEDED_IDS, OTHER_SEARCH_HASH, SEARCH_HASH, [])).toBe(false);
    });
});

/**
 * Regression guard for https://github.com/Expensify/App/issues/98196: opening an expense from Spend seeds the carousel
 * with every expense in the search, but drilling into the owning report and tapping a row there re-seeded it with just
 * that report's expenses. Navigating back then left the counter showing the report's total instead of the search's.
 */
describe('shouldPreserveActiveTransactionIDs', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await clearActiveTransactionIDs();
        await waitForBatchedUpdates();
    });

    it('preserves a strictly broader carousel that contains the tapped expense', async () => {
        await setActiveTransactionIDs(SPEND_PAGE_IDS, SEARCH_HASH);

        expect(shouldPreserveActiveTransactionIDs(REPORT_B_IDS, 'B2')).toBe(true);
    });

    it('does not preserve when no carousel is active', () => {
        expect(shouldPreserveActiveTransactionIDs(REPORT_B_IDS, 'B2')).toBe(false);
    });

    it('does not preserve when the active carousel is missing the tapped expense', async () => {
        await setActiveTransactionIDs(['C1', 'C2', 'C3'], SEARCH_HASH);

        expect(shouldPreserveActiveTransactionIDs(REPORT_B_IDS, 'B2')).toBe(false);
    });

    it('does not preserve when the active carousel does not cover every sibling', async () => {
        // Broader by length, but B2 is absent, so prev/next would skip an expense the report shows.
        await setActiveTransactionIDs(['A1', 'B1', 'C1'], SEARCH_HASH);

        expect(shouldPreserveActiveTransactionIDs(REPORT_B_IDS, 'B1')).toBe(false);
    });

    it('does not preserve an equally sized carousel, so a re-sorted report re-seeds in its new visual order', async () => {
        await setActiveTransactionIDs(['B2', 'B1'], SEARCH_HASH);

        expect(shouldPreserveActiveTransactionIDs(REPORT_B_IDS, 'B1')).toBe(false);
    });

    it('does not preserve a narrower carousel', async () => {
        await setActiveTransactionIDs(['B1'], SEARCH_HASH);

        expect(shouldPreserveActiveTransactionIDs(REPORT_B_IDS, 'B1')).toBe(false);
    });

    it('does not preserve a carousel that only exists in persisted Onyx state', async () => {
        // The Onyx key is persisted, so on a fresh load it can hold a carousel from an earlier session or a search that
        // no longer matches the screen. Preserving that made a drill-in show a stale total ("4 of 6" in a 2-expense
        // report), so only a list seeded during this session counts.
        await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, SPEND_PAGE_IDS);
        await waitForBatchedUpdates();

        expect(shouldPreserveActiveTransactionIDs(REPORT_B_IDS, 'B2')).toBe(false);
    });
});
