import {act, renderHook} from '@testing-library/react-native';

import useReportIDToNameMap, {getMentionedReportIDs, getReportIDToNameMapForRoomsInMarkdown, useMentionedReportIDToNameMap} from '@hooks/useReportIDToNameMap';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function createReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        reportName: `Report ${reportID}`,
        ...overrides,
    } as Report;
}

const renderReportIDToNameMap = async () => {
    const hook = renderHook(() => useReportIDToNameMap());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useReportIDToNameMap', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns an empty object when reports are not set', async () => {
        const {result} = await renderReportIDToNameMap();
        expect(result.current).toEqual({});
    });

    it('maps reportID to reportName when reportName is present', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, createReport('1', {reportName: 'Expense Report'}));
        const {result} = await renderReportIDToNameMap();
        expect(result.current['1']).toBe('Expense Report');
    });

    it('falls back to reportID when reportName is undefined', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}2`, createReport('2', {reportName: undefined}));
        const {result} = await renderReportIDToNameMap();
        expect(result.current['2']).toBe('2');
    });

    it('maps multiple reports and skips null entries', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}10`, createReport('10', {reportName: 'Trip Report'}));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}11`, createReport('11', {reportName: undefined}));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}12`, null);

        const {result} = await renderReportIDToNameMap();

        expect(result.current['10']).toBe('Trip Report');
        expect(result.current['11']).toBe('11');
        expect(result.current['12']).toBeUndefined();
    });

    it('reflects updates to reports', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, createReport('1', {reportName: 'Old Name'}));
        const {result} = await renderReportIDToNameMap();
        expect(result.current['1']).toBe('Old Name');

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportName: 'New Name'});
            await waitForBatchedUpdates();
        });

        expect(result.current['1']).toBe('New Name');
    });

    it('keeps a stable reference across re-renders when reports do not change', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, createReport('1', {reportName: 'Stable'}));
        const {result, rerender} = await renderReportIDToNameMap();
        const firstResult = result.current;

        rerender({});
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(result.current).toBe(firstResult);
    });
});

describe('getReportIDToNameMapForRoomsInMarkdown', () => {
    const adminsRoomID = '1';
    const announceRoomID = '2';
    const expenseReportID = '3';
    const unnamedReportID = '4';
    const reportIDToName = {[adminsRoomID]: '#admins', [announceRoomID]: '#announce', [expenseReportID]: 'Expense Report', [unnamedReportID]: unnamedReportID};

    it('keeps only the rooms whose name appears in the markdown', () => {
        // Given a draft that mentions one of the rooms
        const markdown = 'hello #admins';

        // When narrowing the map to that draft
        const map = getReportIDToNameMapForRoomsInMarkdown(reportIDToName, markdown);

        // Then only the mentioned room is kept, so a deferred edit does not persist every report name
        expect(map).toEqual({[adminsRoomID]: '#admins'});
    });

    it('skips reports that are not rooms even when their name appears in the markdown', () => {
        // Given a draft that contains the name of an expense report and the reportID used as a fallback name, but no room
        const markdown = 'see Expense Report 4 #';

        // When narrowing the map to that draft
        const map = getReportIDToNameMapForRoomsInMarkdown(reportIDToName, markdown);

        // Then nothing is kept, because only rooms can be mentioned in markdown and their names start with #
        expect(map).toEqual({});
    });

    it('returns undefined when the markdown has no #', () => {
        // Given a draft without any # character, so it cannot mention a room
        const markdown = 'hello admins';

        // When narrowing the map to that draft
        const map = getReportIDToNameMapForRoomsInMarkdown(reportIDToName, markdown);

        // Then no map is returned, so the deferred edit stores nothing
        expect(map).toBeUndefined();
    });

    it('returns undefined when no map is passed', () => {
        // Given a caller that has no reportIDToName map, like tests calling editReportComment without one
        // When narrowing it to a draft that mentions a room
        const map = getReportIDToNameMapForRoomsInMarkdown(undefined, 'hello #admins');

        // Then there is nothing to narrow
        expect(map).toBeUndefined();
    });
});

describe('getMentionedReportIDs', () => {
    it('collects every reportID form ExpensiMark accepts, once each', () => {
        // Given HTML with quoted, unquoted, self-closing and duplicated report mentions, plus an attribute before reportID
        const html = '<mention-report reportID="1"></mention-report> <mention-report reportID=2/> <mention-report data-x="y" reportID="1" /> #plain';

        // When extracting the mentioned reportIDs
        const reportIDs = getMentionedReportIDs(html);

        // Then each reportID appears once, in order of first appearance
        expect(reportIDs).toEqual(['1', '2']);
    });

    it('matches the tag case-insensitively like ExpensiMark does', () => {
        // Given a mention tag in upper case, which ExpensiMark still converts
        const html = '<MENTION-REPORT reportID="7"></MENTION-REPORT>';

        // When extracting the mentioned reportIDs
        // Then the upper case tag is not skipped by the pre-check
        expect(getMentionedReportIDs(html)).toEqual(['7']);
    });

    it('returns an empty list when there is no report mention', () => {
        // Given HTML without a mention-report tag, and no HTML at all
        // When extracting the mentioned reportIDs
        // Then nothing is returned, so callers subscribe to nothing
        expect(getMentionedReportIDs('hello <mention-user accountID="1"/>')).toEqual([]);
        expect(getMentionedReportIDs(undefined)).toEqual([]);
    });
});

describe('useMentionedReportIDToNameMap', () => {
    const renderMentioned = async (html: string | undefined) => {
        const hook = renderHook(() => useMentionedReportIDToNameMap(html));
        await act(async () => {
            await waitForBatchedUpdates();
        });
        return hook;
    };

    it('maps only the reports mentioned in the HTML', async () => {
        // Given three reports, two of which are mentioned
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, createReport('1', {reportName: '#admins'}));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}2`, createReport('2', {reportName: '#announce'}));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}3`, createReport('3', {reportName: undefined}));

        // When mapping the mentioned reports
        const {result} = await renderMentioned('<mention-report reportID="1"/> and <mention-report reportID="3"/>');

        // Then the unmentioned report is left out and the fallback name is still the reportID
        const adminsRoomID = '1';
        const unnamedReportID = '3';
        expect(result.current).toEqual({[adminsRoomID]: '#admins', [unnamedReportID]: unnamedReportID});
    });

    it('keeps the same reference when an unrelated report changes', async () => {
        // Given a map scoped to one mentioned report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, createReport('1', {reportName: '#admins'}));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}2`, createReport('2', {reportName: '#announce'}));
        const {result} = await renderMentioned('<mention-report reportID="1"/>');
        const firstResult = result.current;

        // When a report that is not mentioned is renamed
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {reportName: '#renamed'});
            await waitForBatchedUpdates();
        });

        // Then the selector output is unchanged, so the caller does not re-render for that write
        expect(result.current).toBe(firstResult);
    });

    it('updates when a mentioned report is renamed', async () => {
        // Given a map scoped to one mentioned report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, createReport('1', {reportName: '#admins'}));
        const {result} = await renderMentioned('<mention-report reportID="1"/>');
        expect(result.current['1']).toBe('#admins');

        // When that report is renamed
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportName: '#renamed'});
            await waitForBatchedUpdates();
        });

        // Then the new name is what htmlToMarkdown will see
        expect(result.current['1']).toBe('#renamed');
    });

    it('returns an empty map when nothing is mentioned', async () => {
        // Given reports exist but the HTML mentions none of them
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, createReport('1', {reportName: '#admins'}));

        // When mapping the mentioned reports
        const {result} = await renderMentioned('plain text');

        // Then no report is walked or returned
        expect(result.current).toEqual({});
    });
});
