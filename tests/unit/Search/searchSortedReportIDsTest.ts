/* eslint-disable rulesdir/no-multiple-api-calls */
import * as ReportNavigation from '@libs/actions/ReportNavigation';
import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@libs/actions/ReportNavigation', () => ({
    saveLastSearchParams: jest.fn(),
    saveSortedReportIDs: jest.fn(),
}));

function getQueryJSON() {
    const queryJSON = buildSearchQueryJSON('');
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }
    return queryJSON;
}

function getMakeRequestMock() {
    return makeRequestWithSideEffects as unknown as jest.MockedFunction<typeof makeRequestWithSideEffects>;
}

function mockSearchResponse(offset: number, reportIDs: string[], hasMoreResults = false) {
    const data = Object.fromEntries(reportIDs.map((id) => [`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id}]));
    getMakeRequestMock().mockResolvedValue({
        // @ts-expect-error partial mock
        onyxData: [{value: {search: {offset, hasMoreResults}, data}}],
        jsonCode: CONST.JSON_CODE.SUCCESS,
    });
}

describe('search() — sortedReportIDs pagination append', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (waitForWrites as jest.Mock).mockResolvedValue(undefined);
    });

    it('does not call saveSortedReportIDs when no sortedReportIDs are passed', async () => {
        mockSearchResponse(20, ['2001', '2002']);
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 20,
            prevReportsLength: 20,
            isLoading: false,
        });

        expect(ReportNavigation.saveSortedReportIDs).not.toHaveBeenCalled();
    });

    it('appends new report IDs to existing sorted list after pagination', async () => {
        const existingIDs = ['1001', '1002', '1003'];
        const newIDs = ['2001', '2002'];
        mockSearchResponse(20, newIDs);
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 20,
            prevReportsLength: existingIDs.length,
            sortedReportIDs: existingIDs,
            isLoading: false,
        });

        expect(ReportNavigation.saveSortedReportIDs).toHaveBeenCalledWith([...existingIDs, ...newIDs]);
    });

    it('does not append IDs that already exist in the sorted list', async () => {
        const existingIDs = ['1001', '1002', '1003'];
        // '1002' is a duplicate, only '2001' should be appended
        const responseIDs = ['1002', '2001'];
        mockSearchResponse(20, responseIDs);
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 20,
            prevReportsLength: existingIDs.length,
            sortedReportIDs: existingIDs,
            isLoading: false,
        });

        expect(ReportNavigation.saveSortedReportIDs).toHaveBeenCalledWith([...existingIDs, '2001']);
    });

    it('does not call saveSortedReportIDs when all response IDs already exist', async () => {
        const existingIDs = ['1001', '1002'];
        mockSearchResponse(20, existingIDs); // same IDs, no new ones
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 20,
            prevReportsLength: existingIDs.length,
            sortedReportIDs: existingIDs,
            isLoading: false,
        });

        expect(ReportNavigation.saveSortedReportIDs).not.toHaveBeenCalled();
    });

    it('does not append IDs for a non-paginated (offset=0) search response', async () => {
        const existingIDs = ['1001', '1002'];
        mockSearchResponse(0, ['3001', '3002']); // offset=0 → not a pagination response
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            prevReportsLength: existingIDs.length,
            sortedReportIDs: existingIDs,
            isLoading: false,
        });

        expect(ReportNavigation.saveSortedReportIDs).not.toHaveBeenCalled();
    });
});
