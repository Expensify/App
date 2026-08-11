import {clearActiveTransactionIDs, getActiveTransactionIDsSyncAction, setActiveTransactionIDs, shouldPreserveActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';

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

describe('getActiveTransactionIDsSyncAction', () => {
    it('refreshes when the search gained one expense, so y grows by one', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe('refresh');
    });

    it('refreshes when the search gained two expenses, so y grows by two', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A0', 'A00', ...SEEDED_IDS])).toBe('refresh');
    });

    it('refreshes when the search lost an expense but still has two to navigate between', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A1', 'A3'])).toBe('refresh');
    });

    it('refreshes when the same expenses are re-sorted, because the counter index follows the list order', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A3', 'A2', 'A1'])).toBe('refresh');
    });

    it('does nothing when the carousel already matches the search', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, [...SEEDED_IDS])).toBe('none');
    });

    it('leaves another search\u2019s carousel alone', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, OTHER_SEARCH_HASH, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe('none');
    });

    it('leaves a report-scoped carousel alone, since a drill-in clears the snapshot hash', () => {
        expect(getActiveTransactionIDsSyncAction(['B1', 'B2'], undefined, SEARCH_HASH, ['A0', ...SEEDED_IDS])).toBe('none');
    });

    it('does not seed a carousel that is not active yet \u2014 that is the row press\u2019s job', () => {
        expect(getActiveTransactionIDsSyncAction(undefined, SEARCH_HASH, SEARCH_HASH, SEEDED_IDS)).toBe('none');
        expect(getActiveTransactionIDsSyncAction([], SEARCH_HASH, SEARCH_HASH, SEEDED_IDS)).toBe('none');
    });

    // Without this the stale 3-expense list stayed active, so the RHP kept prev/next arrows that paged to expenses the
    // search no longer contained. Pressing a row with fewer than two siblings already clears, so this matches it.
    it('clears when the search shrinks to a single expense, which has nothing to navigate between', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, ['A1'])).toBe('clear');
    });

    it('clears when the search shrinks to no expenses at all', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, SEARCH_HASH, SEARCH_HASH, [])).toBe('clear');
    });

    it('does not clear another search\u2019s carousel when this search is empty', () => {
        expect(getActiveTransactionIDsSyncAction(SEEDED_IDS, OTHER_SEARCH_HASH, SEARCH_HASH, [])).toBe('none');
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
