import {act, renderHook} from '@testing-library/react-native';

import useReportIDToNameMap, {getReportIDToNameMapForRoomsInMarkdown} from '@hooks/useReportIDToNameMap';

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
