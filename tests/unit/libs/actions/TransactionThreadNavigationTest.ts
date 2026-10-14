import {
    CAROUSEL_SOURCE,
    clearActiveTransactionIDs,
    clearActiveTransactionIDsForSource,
    disownActiveTransactionIDs,
    getActiveTransactionIDs,
    setActiveTransactionIDs,
    shouldRefreshActiveTransactionIDs,
} from '@libs/actions/TransactionThreadNavigation';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxEntry, OnyxKey, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../../utils/collections/transaction';
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

    /** Reads the three carousel keys straight out of Onyx, which is where every consumer actually reads them. */
    async function readCarouselFromOnyx() {
        await waitForBatchedUpdates();
        const readOnce = <TKey extends OnyxKey>(key: TKey) =>
            new Promise<OnyxEntry<OnyxValue<TKey>>>((resolve) => {
                const connection = Onyx.connect({
                    key,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
        const [ids, snapshotHash, descriptors] = await Promise.all([
            readOnce(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS),
            readOnce(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH),
            readOnce(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS),
        ]);
        return {ids, snapshotHash, descriptors};
    }

    describe('setActiveTransactionIDs', () => {
        it('records the owning source alongside the IDs', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            expect(getActiveTransactionIDs()).toEqual({ids: SEEDED_IDS, descriptors: null, source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
        });

        /**
         * `getActiveTransactionIDs` reads the in-module mirror, which only arbitrates writes within one session.
         * Every consumer - the header, the carousel - reads Onyx, so the Onyx writes need asserting on their own:
         * without this, deleting them would leave the suite green while the arrows vanished app-wide.
         */
        it('writes the IDs, snapshot hash and descriptors through to Onyx', async () => {
            const descriptors = {A1: {reportID: 'rA', transaction: {...createRandomTransaction(1), transactionID: 'A1'}}};
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH, descriptors});

            await expect(readCarouselFromOnyx()).resolves.toEqual({ids: SEEDED_IDS, snapshotHash: SEARCH_HASH, descriptors});
        });

        it('clears all three Onyx keys when the carousel is released', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
            await clearActiveTransactionIDsForSource(SEARCH_SOURCE);

            await expect(readCarouselFromOnyx()).resolves.toEqual({ids: undefined, snapshotHash: undefined, descriptors: undefined});
        });

        it('lets a different screen take ownership of the carousel', async () => {
            await setActiveTransactionIDs(SPEND_PAGE_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});

            expect(getActiveTransactionIDs()).toEqual({ids: REPORT_B_IDS, descriptors: null, source: REPORT_SOURCE, snapshotHash: null});
        });

        /**
         * Duplicate review takes the carousel over while it is open and hands the previous one back on refocus. It
         * can only do that if everything it read back is also something it can write, so a restored carousel keeps
         * its original owner (which is what lets that screen refresh and release it) along with the snapshot hash
         * and descriptors its siblings are resolved from.
         */
        it('round-trips a displaced carousel back to its original owner', async () => {
            const descriptors = {A1: {reportID: 'rA', transaction: {...createRandomTransaction(1), transactionID: 'A1'}}};
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH, descriptors});
            const displaced = getActiveTransactionIDs();

            await setActiveTransactionIDs(REPORT_B_IDS, {source: CAROUSEL_SOURCE.duplicateReview('B1')});
            await setActiveTransactionIDs(displaced.ids ?? [], {
                source: displaced.source ?? undefined,
                snapshotHash: displaced.snapshotHash ?? undefined,
                descriptors: displaced.descriptors ?? undefined,
            });

            expect(getActiveTransactionIDs()).toEqual({ids: SEEDED_IDS, descriptors, source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
            // The original owner can refresh its own carousel again, which is what the source is for.
            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, SPEND_PAGE_IDS)).toBe(true);
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

        /**
         * That length rule applies only to taking the carousel over, never to the screen that already owns it.
         * Applied to the owner too, it let a list grow its carousel but never shrink or release it, so a list that
         * dropped to a single expense left the old, longer list active and the arrows still showing.
         */
        it('lets its owner shrink the carousel down to nothing to page between', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, ['A1'])).toBe(true);
            expect(shouldRefreshActiveTransactionIDs(SEARCH_SOURCE, [])).toBe(true);
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

            expect(getActiveTransactionIDs()).toEqual({ids: null, descriptors: null, source: null, snapshotHash: null});
        });

        it('leaves a carousel another screen has taken over', async () => {
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});
            await setActiveTransactionIDs(SPEND_PAGE_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            await clearActiveTransactionIDsForSource(REPORT_SOURCE);

            expect(getActiveTransactionIDs()).toEqual({ids: SPEND_PAGE_IDS, descriptors: null, source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
        });
    });

    /**
     * Search is keyed by its query hash, so re-sorting or re-filtering unmounts the list that seeded the carousel
     * and mounts a replacement under a new source. Clearing on the way out stripped the arrows of an expense open
     * in the RHP until the replacement had loaded - and for good, when the new results no longer held it.
     */
    describe('disownActiveTransactionIDs', () => {
        it('keeps the list so an expense open on top of it keeps its arrows', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            disownActiveTransactionIDs(SEARCH_SOURCE);

            expect(getActiveTransactionIDs()).toEqual({ids: SEEDED_IDS, descriptors: null, source: null, snapshotHash: SEARCH_HASH});
            expect((await readCarouselFromOnyx()).ids).toEqual(SEEDED_IDS);
        });

        it('lets the screen that replaces the previous writer take the carousel over', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
            expect(shouldRefreshActiveTransactionIDs(OTHER_SEARCH_SOURCE, SPEND_PAGE_IDS)).toBe(false);

            disownActiveTransactionIDs(SEARCH_SOURCE);

            expect(shouldRefreshActiveTransactionIDs(OTHER_SEARCH_SOURCE, SPEND_PAGE_IDS)).toBe(true);
        });

        /**
         * Regression guard for https://github.com/Expensify/App/pull/100331#issuecomment-5812384643: switching from
         * Spend > Expenses to Spend > Reports unmounts the expense list (which disowns its carousel) and mounts a
         * list of report groups with no transaction rows to seed from. Refusing that empty write left the Expenses
         * tab's list active, so the first one-expense report the user paged onto swapped its report arrows for that
         * stale expense carousel and paged them out of the reports they were browsing.
         */
        it('lets the screen that replaces the previous writer retire a disowned carousel', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            disownActiveTransactionIDs(SEARCH_SOURCE);

            expect(shouldRefreshActiveTransactionIDs(OTHER_SEARCH_SOURCE, ['A1'])).toBe(true);
            expect(shouldRefreshActiveTransactionIDs(OTHER_SEARCH_SOURCE, [])).toBe(true);
        });

        it('leaves a disowned carousel alone when the replacement list is identical', async () => {
            await setActiveTransactionIDs(SEEDED_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            disownActiveTransactionIDs(SEARCH_SOURCE);

            expect(shouldRefreshActiveTransactionIDs(OTHER_SEARCH_SOURCE, SEEDED_IDS)).toBe(false);
        });

        it('leaves a carousel another screen has taken over', async () => {
            await setActiveTransactionIDs(REPORT_B_IDS, {source: REPORT_SOURCE});
            await setActiveTransactionIDs(SPEND_PAGE_IDS, {source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});

            disownActiveTransactionIDs(REPORT_SOURCE);

            expect(getActiveTransactionIDs()).toEqual({ids: SPEND_PAGE_IDS, descriptors: null, source: SEARCH_SOURCE, snapshotHash: SEARCH_HASH});
        });
    });
});
