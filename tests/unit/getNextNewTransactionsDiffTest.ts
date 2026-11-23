import getNextNewTransactionsDiff, {EMPTY_TRANSACTION_IDS, getInitialNewTransactionsDiff} from '@libs/getNextNewTransactionsDiff';
import type {NewTransactionsDiff} from '@libs/getNextNewTransactionsDiff';

const REPORT_ID = 'report-1';

function settledDiff(sourceIDs: readonly string[], addedIDs: readonly string[] = EMPTY_TRANSACTION_IDS): NewTransactionsDiff {
    return {reportID: REPORT_ID, sourceIDs, addedIDs, hasSettledAfterInitialLoad: true};
}

describe('getNextNewTransactionsDiff', () => {
    it('restarts the diff for a list from another report, settled only when that report has loaded', () => {
        // Given a settled diff with a baseline and added rows for one report
        const previous = settledDiff(['a', 'b'], ['b']);

        // When the list now belongs to another report, which has not loaded yet, or to one that has
        const nextUnloaded = getNextNewTransactionsDiff(previous, {transactionsReportID: 'report-2', trackedTransactionIDs: ['c'], hasOnceLoadedReportActions: false});
        const nextLoaded = getNextNewTransactionsDiff(previous, {transactionsReportID: 'report-3', trackedTransactionIDs: ['d'], hasOnceLoadedReportActions: true});

        // Then only the other report's own list can set its baseline, so the diff starts empty, and settled only for the report that has loaded
        expect(nextUnloaded).toEqual(getInitialNewTransactionsDiff('report-2', false));
        expect(nextLoaded).toEqual(getInitialNewTransactionsDiff('report-3', true));
    });

    it('does not settle a report that has not loaded, even when its list grows', () => {
        // Given an unsettled diff with a baseline
        const previous: NewTransactionsDiff = {reportID: REPORT_ID, sourceIDs: ['a'], addedIDs: EMPTY_TRANSACTION_IDS, hasSettledAfterInitialLoad: false};

        // When its list grows while the report is not loaded
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: ['a', 'b'], hasOnceLoadedReportActions: false});

        // Then it stays unsettled, since an unloaded report cannot have settled, and nothing is added
        expect(next.hasSettledAfterInitialLoad).toBe(false);
        expect(next.addedIDs).toEqual([]);
    });

    it('takes the first full list as the baseline, with nothing added', () => {
        // Given a loaded report whose full list has not arrived yet
        const previous = getInitialNewTransactionsDiff(REPORT_ID, true);

        // When the full list arrives
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: ['a', 'b'], hasOnceLoadedReportActions: true});

        // Then it becomes the baseline, since rows that were always there are not new
        expect(next).toEqual(settledDiff(['a', 'b']));
    });

    it('settles on the first growth after loading instead of counting it as adds', () => {
        // Given a report whose list arrived in parts while it loaded
        const previous: NewTransactionsDiff = {reportID: REPORT_ID, sourceIDs: ['a'], addedIDs: EMPTY_TRANSACTION_IDS, hasSettledAfterInitialLoad: false};

        // When the rest of its rows arrive
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: ['a', 'b'], hasOnceLoadedReportActions: true});

        // Then the growth is the load arriving, so nothing is added and the diff settles
        expect(next).toEqual(settledDiff(['a', 'b']));
    });

    it('marks every row missing from the baseline as added once settled, even when all rows are new, as after a split', () => {
        // Given a settled diff whose baseline is one expense
        const previous = settledDiff(['a']);

        // When a split replaces it with three new rows
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: ['c', 'd', 'e'], hasOnceLoadedReportActions: true});

        // Then every row it did not hold before is added
        expect(next.addedIDs).toEqual(['c', 'd', 'e']);
        expect(next.sourceIDs).toEqual(['c', 'd', 'e']);
    });

    it('returns the same diff for a reorder, so nothing new is stored', () => {
        // Given a settled diff
        const previous = settledDiff(['a', 'b'], ['b']);

        // When the same rows come back in another order
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: ['b', 'a'], hasOnceLoadedReportActions: true});

        // Then the diff is unchanged, since a reorder is not an add
        expect(next).toBe(previous);
    });

    it('keeps the same added IDs array when a row is removed, so the highlight window does not restart', () => {
        // Given a settled diff with one added row still in its highlight window
        const addedIDs = ['c'];
        const previous = settledDiff(['a', 'b', 'c'], addedIDs);

        // When another row is removed
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: ['a', 'c'], hasOnceLoadedReportActions: true});

        // Then the baseline follows the list and the added rows keep their array, which the window is keyed on
        expect(next.sourceIDs).toEqual(['a', 'c']);
        expect(next.addedIDs).toBe(addedIDs);
    });

    it('drops the baseline and the added rows when the full list is withheld again', () => {
        // Given a settled diff with an added row
        const previous = settledDiff(['a', 'b'], ['b']);

        // When the report stops counting as loaded, which withholds its list
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: undefined, hasOnceLoadedReportActions: false});

        // Then the diff waits for the full list again, and an unloaded report cannot have settled
        expect(next).toEqual({reportID: REPORT_ID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS, hasSettledAfterInitialLoad: false});
    });

    it('clears settled for a report that is no longer loaded, even with no list to compare', () => {
        // Given a settled report that never had a full list
        const previous: NewTransactionsDiff = {reportID: REPORT_ID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS, hasSettledAfterInitialLoad: true};

        // When its loaded flag drops
        const next = getNextNewTransactionsDiff(previous, {transactionsReportID: REPORT_ID, trackedTransactionIDs: undefined, hasOnceLoadedReportActions: false});

        // Then it is no longer settled, so its next load is again taken as the baseline
        expect(next.hasSettledAfterInitialLoad).toBe(false);
    });
});
