import useIsReportActionsLoaded from '@hooks/useIsReportActionsLoaded';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';

const REPORT_ID = '1';

const REPORT_ACTION = {
    reportActionID: '100',
    actionName: 'ADDCOMMENT',
    created: '2023-01-01 10:00:00.000',
} as ReportAction;

describe('useIsReportActionsLoaded', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(() => Onyx.clear());

    it('returns false when neither the loading state nor report actions are loaded', async () => {
        const {result} = renderHook(() => useIsReportActionsLoaded(REPORT_ID));
        expect(result.current).toBe(false);
    });

    it('returns true when hasOnceLoadedReportActions is true in the loading state', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {hasOnceLoadedReportActions: true});

        const {result} = renderHook(() => useIsReportActionsLoaded(REPORT_ID));
        expect(result.current).toBe(true);
    });

    it('returns true when the report has report actions even if it has never finished loading', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION.reportActionID]: REPORT_ACTION});

        const {result} = renderHook(() => useIsReportActionsLoaded(REPORT_ID));
        expect(result.current).toBe(true);
    });

    it('returns false when the report actions object is empty', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {});

        const {result} = renderHook(() => useIsReportActionsLoaded(REPORT_ID));
        expect(result.current).toBe(false);
    });

    it('returns false when reportID is undefined', async () => {
        const {result} = renderHook(() => useIsReportActionsLoaded(undefined));
        expect(result.current).toBe(false);
    });

    it('updates from false to true when report actions become available', async () => {
        const {result} = renderHook(() => useIsReportActionsLoaded(REPORT_ID));
        expect(result.current).toBe(false);

        await act(async () => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION.reportActionID]: REPORT_ACTION}));

        expect(result.current).toBe(true);
    });
});
