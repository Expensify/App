import {act, renderHook} from '@testing-library/react-native';

import useReportIDToNameMap from '@hooks/useReportIDToNameMap';

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
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}10`]: createReport('10', {reportName: 'Trip Report'}),
            [`${ONYXKEYS.COLLECTION.REPORT}11`]: createReport('11', {reportName: undefined}),
            [`${ONYXKEYS.COLLECTION.REPORT}12`]: null,
        });

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
