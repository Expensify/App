import {getTodoReportCount} from '@hooks/useTodoSearchResults';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults} from '@src/types/onyx';

import createMock from '../../utils/createMock';

// The server matched 120 reports. Its responses held reports A, B and C, and this device has listed all three.
const SERVER_REPORT_COUNT = 120;
const COUNTED_REPORT_IDS = {A: true, B: true, C: true};
const SEEN_REPORT_IDS = COUNTED_REPORT_IDS;

function buildServerSearch(search: Partial<SearchResults['search']> = {}): SearchResults['search'] {
    return createMock<SearchResults['search']>({reportCount: SERVER_REPORT_COUNT, countedReportIDs: COUNTED_REPORT_IDS, ...search});
}

/** The to-do list on the device, holding the given reports */
function buildLiveData(reportIDs: string[]): SearchResults['data'] {
    const data = createMock<SearchResults['data']>({});
    for (const reportID of reportIDs) {
        data[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = createMock<Report>({reportID, type: CONST.REPORT.TYPE.EXPENSE});
    }
    return data;
}

describe('getTodoReportCount', () => {
    it("has no report count when the server hasn't sent one", () => {
        // Given no server snapshot yet
        // When the report count is worked out
        const reportCount = getTodoReportCount({serverSearch: undefined, liveData: buildLiveData(['B', 'C']), isLoaded: true, seenReportIDs: SEEN_REPORT_IDS});

        // Then there is none to show
        expect(reportCount).toBeUndefined();
    });

    it("keeps the server's report count while every counted report is still in the list", () => {
        // Given the device still holds every report the server's responses held
        // When the report count is worked out
        const reportCount = getTodoReportCount({serverSearch: buildServerSearch(), liveData: buildLiveData(['A', 'B', 'C']), isLoaded: true, seenReportIDs: SEEN_REPORT_IDS});

        // Then it is the server's, which also covers the reports this device doesn't hold
        expect(reportCount).toBe(SERVER_REPORT_COUNT);
    });

    it('takes a counted report that left the list off the server count', () => {
        // Given report A was listed on this device and has left the list, so it's gone from it whatever the snapshot's rows still hold
        // When the report count is worked out
        const reportCount = getTodoReportCount({serverSearch: buildServerSearch(), liveData: buildLiveData(['B', 'C']), isLoaded: true, seenReportIDs: SEEN_REPORT_IDS});

        // Then one report comes off, without waiting for the next search
        expect(reportCount).toBe(SERVER_REPORT_COUNT - 1);
    });

    it('keeps a counted report this device never listed on the count, such as one its own rules hide', () => {
        // Given report A was counted by the server but never listed here, as with a receipt still scanning on Needs approval
        // When the report count is worked out
        const reportCount = getTodoReportCount({serverSearch: buildServerSearch(), liveData: buildLiveData(['B', 'C']), isLoaded: true, seenReportIDs: {B: true, C: true}});

        // Then the server's count stands, since "Select all" still acts on that report
        expect(reportCount).toBe(SERVER_REPORT_COUNT);
    });

    it('leaves a report the server never counted out until the next response, such as a draft created on this device', () => {
        // Given the list also holds a draft this device created, which isn't among the reports the server's responses held
        // When the report count is worked out
        const reportCount = getTodoReportCount({serverSearch: buildServerSearch(), liveData: buildLiveData(['A', 'B', 'C', 'created']), isLoaded: true, seenReportIDs: SEEN_REPORT_IDS});

        // Then the server's count stands. The next first-page response counts the draft
        expect(reportCount).toBe(SERVER_REPORT_COUNT);
    });

    it("keeps the server's report count while local data is still loading", () => {
        // Given local data hasn't finished loading, so the list is still empty
        // When the report count is worked out
        const reportCount = getTodoReportCount({serverSearch: buildServerSearch(), liveData: buildLiveData([]), isLoaded: false, seenReportIDs: SEEN_REPORT_IDS});

        // Then nothing counts as having left, since reports that still match are missing until then
        expect(reportCount).toBe(SERVER_REPORT_COUNT);
    });

    it("keeps the server's report count when the snapshot has no record of the reports it counted", () => {
        // Given a snapshot cached before the counted reports were recorded
        // When the report count is worked out
        const reportCount = getTodoReportCount({
            serverSearch: buildServerSearch({countedReportIDs: undefined}),
            liveData: buildLiveData(['B', 'C']),
            isLoaded: true,
            seenReportIDs: SEEN_REPORT_IDS,
        });

        // Then it is the server's until the next response records them
        expect(reportCount).toBe(SERVER_REPORT_COUNT);
    });

    it('never goes below zero', () => {
        // Given a stale server count smaller than what has left
        // When the report count is worked out
        const reportCount = getTodoReportCount({serverSearch: buildServerSearch({reportCount: 1}), liveData: buildLiveData([]), isLoaded: true, seenReportIDs: SEEN_REPORT_IDS});

        // Then it stops at zero
        expect(reportCount).toBe(0);
    });
});
