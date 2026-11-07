import {act, renderHook} from '@testing-library/react-native';

import useReportsParentHierarchy from '@hooks/useReportsParentHierarchy';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const THREAD_REPORT_ID = '1';
const PARENT_REPORT_ID = '2';
const UNRELATED_REPORT_ID = '3';
const OTHER_THREAD_REPORT_ID = '4';
const PARENT_REPORT_ACTION_ID = '100';

const reportKey = (reportID: string) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;

describe('useReportsParentHierarchy', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should keep the same reference across report changes and re-renders that do not touch the chain', async () => {
        // Given a thread and its parent in Onyx, and the hook mounted for the thread
        await act(async () => {
            await Onyx.merge(reportKey(THREAD_REPORT_ID), {reportID: THREAD_REPORT_ID, parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID});
            await Onyx.merge(reportKey(PARENT_REPORT_ID), {reportID: PARENT_REPORT_ID});
        });
        const {result, rerender} = renderHook(() => useReportsParentHierarchy(THREAD_REPORT_ID));
        await waitForBatchedUpdatesWithAct();
        const initialHierarchy = result.current;

        // When an unrelated report is added, a chain report changes a field that is not a parent link, and the list re-renders
        await act(async () => {
            await Onyx.merge(reportKey(UNRELATED_REPORT_ID), {reportID: UNRELATED_REPORT_ID});
            await Onyx.merge(reportKey(THREAD_REPORT_ID), {lastMessageText: 'new message'});
        });
        await waitForBatchedUpdatesWithAct();
        rerender({});

        // Then the hook returns the same object, so the list that shares it with every row does not re-render them
        expect(initialHierarchy).toEqual({
            [reportKey(THREAD_REPORT_ID)]: {parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID},
            [reportKey(PARENT_REPORT_ID)]: {parentReportID: undefined, parentReportActionID: undefined},
        });
        expect(result.current).toBe(initialHierarchy);
    });

    it('should include a parent report that loads after the hook is mounted', async () => {
        // Given a thread whose parent report is not in Onyx yet
        await act(async () => {
            await Onyx.merge(reportKey(THREAD_REPORT_ID), {reportID: THREAD_REPORT_ID, parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID});
        });
        const {result} = renderHook(() => useReportsParentHierarchy(THREAD_REPORT_ID));
        await waitForBatchedUpdatesWithAct();
        expect(Object.keys(result.current ?? {})).toEqual([reportKey(THREAD_REPORT_ID)]);

        // When the parent report arrives, e.g. from an API response
        await act(async () => {
            await Onyx.merge(reportKey(PARENT_REPORT_ID), {reportID: PARENT_REPORT_ID});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the chain includes it, so dismissing an error can still walk up to the parent
        expect(Object.keys(result.current ?? {})).toEqual([reportKey(THREAD_REPORT_ID), reportKey(PARENT_REPORT_ID)]);
    });

    it('should switch to the new chain when the reportID changes', async () => {
        // Given two unrelated threads in Onyx and the hook mounted for the first one
        await act(async () => {
            await Onyx.merge(reportKey(THREAD_REPORT_ID), {reportID: THREAD_REPORT_ID, parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID});
            await Onyx.merge(reportKey(OTHER_THREAD_REPORT_ID), {reportID: OTHER_THREAD_REPORT_ID});
        });
        const {result, rerender} = renderHook(({reportID}: {reportID: string}) => useReportsParentHierarchy(reportID), {initialProps: {reportID: THREAD_REPORT_ID}});
        await waitForBatchedUpdatesWithAct();

        // When the hook is re-rendered for the other thread
        rerender({reportID: OTHER_THREAD_REPORT_ID});
        await waitForBatchedUpdatesWithAct();

        // Then only the other thread's chain is returned, so no stale links from the first thread leak into the walk
        expect(Object.keys(result.current ?? {})).toEqual([reportKey(OTHER_THREAD_REPORT_ID)]);
    });
});
