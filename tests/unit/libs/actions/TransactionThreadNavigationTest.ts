import {
    CAROUSEL_SOURCE,
    clearActiveTransactionIDs,
    clearActiveTransactionIDsForSource,
    getActiveTransactionIDs,
    setActiveTransactionIDs,
    shouldRefreshActiveTransactionIDs,
} from '@libs/actions/TransactionThreadNavigation';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const SEARCH_HASH = 959171759;
const SEARCH_SOURCE = CAROUSEL_SOURCE.search(SEARCH_HASH);
const OTHER_SEARCH_SOURCE = CAROUSEL_SOURCE.search(123456);
const REPORT_SOURCE = CAROUSEL_SOURCE.report('B');

// The Spend page's expense list, as the carousel was seeded with it when a row was pressed.
const SEEDED_IDS = ['A1', 'A2', 'A3'];

// The Spend page holds one expense from report A and two from report B; report B owns only its own two.
const SPEND_PAGE_IDS = ['A1', 'B1', 'B2'];
const REPORT_B_IDS = ['B1', 'B2'];

describe('TransactionThreadNavigation carousel ownership', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await clearActiveTransactionIDs();
        await waitForBatchedUpdates();
    });

    describe('setActiveTransactionIDs', () => {
        it('records the owning source alongside the IDs', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            expect(getActiveTransactionIDs()).toEqual({ids: SEEDED_IDS, descriptors: null, source: SEARCH_SOURCE});
        });

        it('lets a different screen take ownership of the carousel', async () => {
            await setActiveTransactionIDs(SPEND_PAGE_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});

            expect(getActiveTransactionIDs()).toEqual({ids: REPORT_B_IDS, descriptors: null, source: REPORT_SOURCE});
        });
    });

    /**
     * Regression guard for https://github.com/Expensify/App/issues/99609 and
     * https://github.com/Expensify/App/issues/99617: a search list left mounted behind the RHP used to keep pushing
     * its own (broader, or stale) list over the carousel of whatever screen the user had drilled into.
     */
    describe('shouldRefreshActiveTransactionIDs', () => {
        it('seeds when no carousel is active', () => {
            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, SEEDED_IDS)).toBe(true);
        });

        it('does not seed a list with nothing to page between', () => {
            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, ['A1'])).toBe(false);
            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, [])).toBe(false);
        });

        it('refreshes its own carousel when the list gained an expense', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, ['A0', ...SEEDED_IDS])).toBe(true);
        });

        it('refreshes its own carousel when the list lost an expense', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, ['A1', 'A3'])).toBe(true);
        });

        it('refreshes its own carousel when only the order changed', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, ['A3', 'A2', 'A1'])).toBe(true);
        });

        it('skips the write when its own carousel is already up to date', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, [...SEEDED_IDS])).toBe(false);
        });

        it('leaves a carousel owned by another screen alone', async () => {
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, SPEND_PAGE_IDS)).toBe(false);
        });

        it('leaves a carousel owned by a different search alone', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: OTHER_SEARCH_SOURCE, snapshotHash: 123456});

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, SPEND_PAGE_IDS)).toBe(false);
        });

        it('re-seeds once the owning screen releases the carousel', async () => {
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});
            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, SPEND_PAGE_IDS)).toBe(false);

            await clearActiveTransactionIDsForSource(REPORT_SOURCE);

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, SPEND_PAGE_IDS)).toBe(true);
        });

        it('ignores a carousel that only exists in persisted Onyx state', async () => {
            // The Onyx key is persisted, so on a fresh load it can hold a carousel from an earlier session. Without a
            // recorded owner there is nothing to defer to, so the visible list wins.
            await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, SPEND_PAGE_IDS);
            await waitForBatchedUpdates();

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, SEEDED_IDS)).toBe(true);
        });
    });

    /**
     * Regression guard for https://github.com/Expensify/App/issues/99630: a screen tearing down used to clear the
     * carousel unconditionally, wiping the list another screen had already taken over and leaving no arrows at all.
     */
    describe('clearActiveTransactionIDsForSource', () => {
        it('clears a carousel it still owns', async () => {
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});

            await clearActiveTransactionIDsForSource(REPORT_SOURCE);

            expect(getActiveTransactionIDs()).toEqual({ids: null, descriptors: null, source: null});
        });

        it('leaves a carousel another screen has taken over', async () => {
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});
            await setActiveTransactionIDs(SPEND_PAGE_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            await clearActiveTransactionIDsForSource(REPORT_SOURCE);

            expect(getActiveTransactionIDs()).toEqual({ids: SPEND_PAGE_IDS, descriptors: null, source: SEARCH_SOURCE});
        });
    });
});
