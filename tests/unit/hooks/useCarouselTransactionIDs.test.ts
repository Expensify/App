import {renderHook, waitFor} from '@testing-library/react-native';

import useCarouselTransactionIDs from '@hooks/useCarouselTransactionIDs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';

const REPORT_ID = 'report1';

/** The report a split original is parked in while its children exist. It is not a report with a screen. */
const HIDDEN_SPLIT_REPORT_ID = CONST.REPORT.SPLIT_REPORT_ID;

function makeTransaction(transactionID: string, reportID: string): Transaction {
    const transaction = createRandomTransaction(1);
    transaction.transactionID = transactionID;
    transaction.reportID = reportID;
    return transaction;
}

/** Seeds the carousel the way pressing a row on a report's own list does, then fills in the live collection. */
async function seedCarousel(transactionIDs: string[], transactions: Transaction[]) {
    await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, transactionIDs);
    for (const transaction of transactions) {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
    }
}

describe('useCarouselTransactionIDs', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('keeps every seeded expense while they all still sit on the report it was seeded from', async () => {
        await seedCarousel(['txnA', 'txnB'], [makeTransaction('txnA', REPORT_ID), makeTransaction('txnB', REPORT_ID)]);

        const {result} = renderHook(() => useCarouselTransactionIDs());

        await waitFor(() => {
            expect(result.current.transactionIDs).toEqual(['txnA', 'txnB']);
        });
    });

    // Issue #104307: splitting moves the original into the hidden split report but leaves it in the seed, and the
    // children it creates were never part of that seed - so deleting them leaves a one-expense report reading "1 of 2"
    // and sending the arrow at a report that has no screen.
    it('excludes an expense that a split moved into the hidden split report', async () => {
        await seedCarousel(['txnA', 'txnB'], [makeTransaction('txnA', REPORT_ID), makeTransaction('txnB', HIDDEN_SPLIT_REPORT_ID)]);

        const {result} = renderHook(() => useCarouselTransactionIDs());

        await waitFor(() => {
            expect(result.current.transactionIDs).toEqual(['txnA']);
        });
    });

    // The filter is derived from live Onyx rather than written, which is what makes it safe: a split the server
    // rejects restores the original's real reportID, so its arrow comes back with nothing having to put it back.
    it('brings the expense back once its split is reverted', async () => {
        await seedCarousel(['txnA', 'txnB'], [makeTransaction('txnA', REPORT_ID), makeTransaction('txnB', HIDDEN_SPLIT_REPORT_ID)]);

        const {result} = renderHook(() => useCarouselTransactionIDs());

        await waitFor(() => {
            expect(result.current.transactionIDs).toEqual(['txnA']);
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txnB`, {reportID: REPORT_ID});

        await waitFor(() => {
            expect(result.current.transactionIDs).toEqual(['txnA', 'txnB']);
        });
    });

    it('still excludes deleted and pending-delete expenses', async () => {
        const trashed = makeTransaction('txnA', CONST.REPORT.TRASH_REPORT_ID);
        const pendingDelete = makeTransaction('txnB', REPORT_ID);
        pendingDelete.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        await seedCarousel(['txnA', 'txnB'], [trashed, pendingDelete]);

        const {result} = renderHook(() => useCarouselTransactionIDs());

        await waitFor(() => {
            expect(result.current.transactionIDs).toEqual([]);
        });
    });

    // OneTransactionThreadRedirectHandler acts on how many siblings exist, so it needs to know whether the filter is
    // still waiting on the collection - otherwise a sibling that has not reported yet reads as the only one.
    it('exposes whether the collection it filters from has reported yet', async () => {
        await seedCarousel(['txnA', 'txnB'], [makeTransaction('txnA', REPORT_ID), makeTransaction('txnB', REPORT_ID)]);

        const {result} = renderHook(() => useCarouselTransactionIDs());

        await waitFor(() => {
            expect(typeof result.current.isLoading).toBe('boolean');
        });
    });
});
