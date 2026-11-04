import {getExpenseReportIDs, search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {getSuggestedSearches} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

const draftsQueryJSON = getSuggestedSearches(1)[CONST.SEARCH.SEARCH_KEYS.SUBMIT].searchQueryJSON;
if (!draftsQueryJSON) {
    throw new Error('The Drafts query should build');
}
const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${draftsQueryJSON.hash}` as const;

function buildSearchData(reports: Array<{reportID: string; type: string}>): SearchResults['data'] {
    const data = createMock<SearchResults['data']>({});
    for (const report of reports) {
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = createMock<Report>(report);
    }
    return data;
}

/**
 * Answers the next request the way the API layer does: it applies the response's onyxData before search() sees the
 * result. Like a real to-do response, it lists another collection first and the snapshot last.
 */
function answerWith(onyxMethod: typeof Onyx.METHOD.SET | typeof Onyx.METHOD.MERGE, data: SearchResults['data'], jsonCode: number = CONST.JSON_CODE.SUCCESS) {
    const onyxData: Array<OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: {}},
        {onyxMethod, key: snapshotKey, value: {search: {reportCount: 120}, data}},
    ];
    jest.mocked(makeRequestWithSideEffects).mockImplementationOnce(async () => {
        await Onyx.update(onyxData);
        return {jsonCode, onyxData};
    });
}

async function getCountedReportIDs() {
    await waitForBatchedUpdates();
    const snapshot = await getOnyxValue(snapshotKey);
    return snapshot?.search?.countedReportIDs;
}

describe('getExpenseReportIDs', () => {
    it('keeps only the expense reports, which are the only reports a live to-do list holds', () => {
        // Given search data with expense, IOU, invoice and chat reports
        const data = buildSearchData([
            {reportID: 'expense1', type: CONST.REPORT.TYPE.EXPENSE},
            {reportID: 'iou', type: CONST.REPORT.TYPE.IOU},
            {reportID: 'invoice', type: CONST.REPORT.TYPE.INVOICE},
            {reportID: 'chat', type: CONST.REPORT.TYPE.CHAT},
            {reportID: 'expense2', type: CONST.REPORT.TYPE.EXPENSE},
        ]);

        // When their IDs are collected
        const reportIDs = getExpenseReportIDs(data);

        // Then only the expense reports are kept
        expect(reportIDs).toEqual({expense1: true, expense2: true});
    });

    it("takes each report's ID from its key, so an entry without a reportID is still recorded", () => {
        // Given an expense report entry whose value carries no reportID
        const data = createMock<SearchResults['data']>({});
        data[`${ONYXKEYS.COLLECTION.REPORT}expense1`] = createMock<Report>({type: CONST.REPORT.TYPE.EXPENSE});

        // When its ID is collected
        const reportIDs = getExpenseReportIDs(data);

        // Then it is recorded under its key's ID, never as "undefined", which would count as a report that left
        expect(reportIDs).toEqual({expense1: true});
    });

    it('returns nothing for data without reports', () => {
        // Given search data holding no reports
        // When the IDs are collected
        // Then there are none
        expect(getExpenseReportIDs(createMock<SearchResults['data']>({}))).toEqual({});
    });
});

describe('search() records the reports a to-do search counted', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(waitForWrites).mockResolvedValue(undefined);
        await Onyx.clear();
    });

    it("records the expense reports a to-do search's first page held", async () => {
        // Given Drafts answers its first page with two expense reports and a chat report
        answerWith(
            Onyx.METHOD.SET,
            buildSearchData([
                {reportID: 'A', type: CONST.REPORT.TYPE.EXPENSE},
                {reportID: 'B', type: CONST.REPORT.TYPE.EXPENSE},
                {reportID: 'chat', type: CONST.REPORT.TYPE.CHAT},
            ]),
        );

        // When the first page is searched
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // Then the two expense reports are recorded as the ones its count covers
        expect(await getCountedReportIDs()).toEqual({A: true, B: true});
    });

    it("adds a later page's reports to the record", async () => {
        // Given Drafts already recorded report A from its first page
        answerWith(Onyx.METHOD.SET, buildSearchData([{reportID: 'A', type: CONST.REPORT.TYPE.EXPENSE}]));
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // When the next page answers with report C, merged into the snapshot
        answerWith(Onyx.METHOD.MERGE, buildSearchData([{reportID: 'C', type: CONST.REPORT.TYPE.EXPENSE}]));
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: CONST.SEARCH.RESULTS_PAGE_SIZE, shouldCalculateTotals: false, isLoading: false});

        // Then both are recorded
        expect(await getCountedReportIDs()).toEqual({A: true, C: true});
    });

    it('starts the record over with a first-page response, which replaces the snapshot', async () => {
        // Given a record from an earlier response holding report OLD
        await Onyx.set(snapshotKey, createMock<SearchResults>({search: {countedReportIDs: {OLD: true}}, data: {}}));

        // When a new first page answers with report A
        answerWith(Onyx.METHOD.SET, buildSearchData([{reportID: 'A', type: CONST.REPORT.TYPE.EXPENSE}]));
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // Then only report A is recorded, since the old record went with the replaced snapshot
        expect(await getCountedReportIDs()).toEqual({A: true});
    });

    it('starts the record over with a response to a request for totals, even when it merges into the snapshot', async () => {
        // Given a record from an earlier response holding report OLD
        await Onyx.set(snapshotKey, createMock<SearchResults>({search: {countedReportIDs: {OLD: true}}, data: {}}));

        // When a first page asked for totals answers with report A, merged into the snapshot instead of replacing it
        answerWith(Onyx.METHOD.MERGE, buildSearchData([{reportID: 'A', type: CONST.REPORT.TYPE.EXPENSE}]));
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // Then only report A is recorded, so the record matches the fresh count the response brought
        expect(await getCountedReportIDs()).toEqual({A: true});
    });

    it('starts the record over with a later page asked for totals, as when the report count was missing', async () => {
        // Given Drafts recorded report A from its first page
        answerWith(Onyx.METHOD.SET, buildSearchData([{reportID: 'A', type: CONST.REPORT.TYPE.EXPENSE}]));
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // When a later page asked for totals answers with report C
        answerWith(Onyx.METHOD.MERGE, buildSearchData([{reportID: 'C', type: CONST.REPORT.TYPE.EXPENSE}]));
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: CONST.SEARCH.RESULTS_PAGE_SIZE, shouldCalculateTotals: true, isLoading: false});

        // Then only C is recorded, so a page-1 report that left before the fresh count can't come off twice
        expect(await getCountedReportIDs()).toEqual({C: true});
    });

    it('records nothing for a search that is not a to-do', async () => {
        // Given the same response answers a search that isn't a to-do
        answerWith(Onyx.METHOD.SET, buildSearchData([{reportID: 'A', type: CONST.REPORT.TYPE.EXPENSE}]));

        // When it is searched
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // Then no record is kept, since only a live to-do search corrects its count
        expect(await getCountedReportIDs()).toBeUndefined();
    });

    it('records nothing when the response failed', async () => {
        // Given Drafts' request fails
        answerWith(Onyx.METHOD.MERGE, {}, 500);

        // When the first page is searched
        await search({queryJSON: draftsQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // Then no record is kept
        expect(await getCountedReportIDs()).toBeUndefined();
    });
});
