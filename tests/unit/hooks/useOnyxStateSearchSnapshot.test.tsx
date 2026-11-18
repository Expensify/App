import {act, render, renderHook} from '@testing-library/react-native';

import {SearchQueryContext, SearchResultsContext} from '@components/Search/SearchContextDefinitions';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import useOnyxState from '@hooks/useOnyxState';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {OnyxStateView} from 'react-native-onyx';

import React, {use, useMemo} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const SEARCH_HASH = 42;
const OTHER_SEARCH_HASH = 43;
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${SEARCH_HASH}` as const;
const OTHER_SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${OTHER_SEARCH_HASH}` as const;
const REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}1` as const;
const REPORT_MISSING_FROM_SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.REPORT}2` as const;
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}A` as const;

const LIVE_REPORT: Report = {reportID: '1', reportName: 'Live report'};
const SNAPSHOT_REPORT: Report = {reportID: '1', reportName: 'Snapshot report'};
const OTHER_SNAPSHOT_REPORT: Report = {reportID: '1', reportName: 'Other snapshot report'};
const REPORT_MISSING_FROM_SNAPSHOT: Report = {reportID: '2', reportName: 'Live only report'};
const LIVE_SESSION_EMAIL = 'live@expensify.com';

const LIVE_DATA_OPTIONS = {shouldUseLiveData: true};

type SearchScreenProps = ChildrenProps & {
    shouldUseLiveData?: boolean;
    searchHash?: number;
};

function SearchScreen({children, shouldUseLiveData = false, searchHash = SEARCH_HASH}: SearchScreenProps) {
    const queryContext = use(SearchQueryContext);
    const resultsContext = use(SearchResultsContext);
    const queryContextWithHash = useMemo(() => ({...queryContext, currentSearchHash: searchHash}), [queryContext, searchHash]);
    const resultsContextWithLiveData = useMemo(() => ({...resultsContext, shouldUseLiveData}), [resultsContext, shouldUseLiveData]);

    return (
        <SearchScopeProvider>
            <SearchQueryContext.Provider value={queryContextWithHash}>
                <SearchResultsContext.Provider value={resultsContextWithLiveData}>{children}</SearchResultsContext.Provider>
            </SearchQueryContext.Provider>
        </SearchScopeProvider>
    );
}

function SearchScreenWithLiveData({children}: ChildrenProps) {
    return <SearchScreen shouldUseLiveData>{children}</SearchScreen>;
}

function selectReport(state: OnyxStateView) {
    return state[REPORT_KEY];
}

function selectReports(state: OnyxStateView) {
    return state[ONYXKEYS.COLLECTION.REPORT];
}

function selectReportMissingFromSnapshot(state: OnyxStateView) {
    return state[REPORT_MISSING_FROM_SNAPSHOT_KEY];
}

function selectSessionEmail(state: OnyxStateView) {
    return state[ONYXKEYS.SESSION]?.email;
}

function selectSnapshotReport(state: OnyxStateView) {
    return state[SNAPSHOT_KEY]?.data?.[REPORT_KEY];
}

function selectReportNameAndSessionEmail(state: OnyxStateView) {
    return {reportName: state[REPORT_KEY]?.reportName, email: state[ONYXKEYS.SESSION]?.email};
}

function selectReportsAndSessionEmail(state: OnyxStateView) {
    return {reports: state[ONYXKEYS.COLLECTION.REPORT], email: state[ONYXKEYS.SESSION]?.email};
}

function selectReportNameWithPrevious(state: OnyxStateView, previousState: OnyxStateView | undefined) {
    return {reportName: state[REPORT_KEY]?.reportName, previousReportName: previousState?.[REPORT_KEY]?.reportName};
}

function selectHasReportMissingFromSnapshot(state: OnyxStateView) {
    return REPORT_MISSING_FROM_SNAPSHOT_KEY in state;
}

async function renderSelector<T>(selector: (state: OnyxStateView, previousState: OnyxStateView | undefined) => T, wrapper?: React.ComponentType<ChildrenProps>) {
    const rendered = renderHook(() => useOnyxState(selector), {wrapper});
    await waitForBatchedUpdatesWithAct();
    return rendered;
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

describe('useOnyxState Search snapshot redirect', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.multiSet({
            [REPORT_KEY]: LIVE_REPORT,
            [REPORT_MISSING_FROM_SNAPSHOT_KEY]: REPORT_MISSING_FROM_SNAPSHOT,
            [ONYXKEYS.SESSION]: {email: LIVE_SESSION_EMAIL},
        });
        await Onyx.merge(SNAPSHOT_KEY, {
            data: {
                [REPORT_KEY]: SNAPSHOT_REPORT,
                [POLICY_KEY]: {id: 'A', name: 'Snapshot policy'},
            },
        });
        await Onyx.merge(OTHER_SNAPSHOT_KEY, {data: {[REPORT_KEY]: OTHER_SNAPSHOT_REPORT}});
        await waitForBatchedUpdatesWithAct();
    });

    it('should read live data outside Search', async () => {
        // Given a report whose live and snapshot copies differ
        // When a selector reads it outside any Search scope
        const {result} = await renderSelector(selectReport);

        // Then the live copy is returned because only Search screens use snapshots
        expect(result.current).toEqual(LIVE_REPORT);
    });

    it('should read the snapshot copy of a member inside Search', async () => {
        // Given a report whose live and snapshot copies differ
        // When a selector reads it on a Search screen
        const {result} = await renderSelector(selectReport, SearchScreen);

        // Then the snapshot copy is returned so the value matches what useOnyx returns on Search
        expect(result.current).toEqual(SNAPSHOT_REPORT);
    });

    it('should return only the snapshot members of a collection inside Search', async () => {
        // Given two live reports and a snapshot that holds only one of them next to a policy
        // When a selector reads the report collection on a Search screen
        const {result} = await renderSelector(selectReports, SearchScreen);

        // Then only the snapshot report comes back so the collection matches the search results
        expect(result.current).toEqual({[REPORT_KEY]: SNAPSHOT_REPORT});
    });

    it('should return nothing inside Search for a report the snapshot does not hold', async () => {
        // Given a report that exists live but is missing from the snapshot
        // When a selector reads it on a Search screen
        const {result} = await renderSelector(selectReportMissingFromSnapshot, SearchScreen);

        // Then nothing is returned because Search never falls back to live data
        expect(result.current).toBeUndefined();
    });

    it('should read live data inside Search when live data is requested', async () => {
        // Given a Search screen that asks for live data
        // When a selector reads a report on that screen
        const {result} = await renderSelector(selectReport, SearchScreenWithLiveData);

        // Then the live copy is returned because the screen opted out of snapshots
        expect(result.current).toEqual(LIVE_REPORT);
    });

    it('should read live data inside Search for keys that snapshots do not copy', async () => {
        // Given a live session, which snapshots never hold
        // When a selector reads it on a Search screen
        const {result} = await renderSelector(selectSessionEmail, SearchScreen);

        // Then the live value is returned because only snapshot keys are redirected
        expect(result.current).toBe(LIVE_SESSION_EMAIL);
    });

    it('should never redirect a snapshot key inside Search', async () => {
        // Given a snapshot that holds a report
        // When a selector reads the snapshot key itself on a Search screen
        const {result} = await renderSelector(selectSnapshotReport, SearchScreen);

        // Then the snapshot is read as is so Search can read its own results
        expect(result.current).toEqual(SNAPSHOT_REPORT);
    });

    it('should return nothing inside a Search scope that has no search hash', async () => {
        // Given a Search scope without a search query, so the default search hash applies
        // When a selector reads a report that exists live in that scope
        const {result} = await renderSelector(selectReport, SearchScopeProvider);

        // Then nothing is returned because the default hash has no snapshot, the same as useOnyx
        expect(result.current).toBeUndefined();
    });

    it('should redirect only the snapshot keys of a selector that reads several keys', async () => {
        // Given a selector that reads a report, which snapshots copy, and the session, which they do not
        // When it runs on a Search screen
        const {result} = await renderSelector(selectReportNameAndSessionEmail, SearchScreen);

        // Then each key is resolved on its own, so the report comes from the snapshot and the session stays live
        expect(result.current).toEqual({reportName: SNAPSHOT_REPORT.reportName, email: LIVE_SESSION_EMAIL});
    });

    it('should answer the in operator from the snapshot inside Search', async () => {
        // Given a report that exists live but is missing from the snapshot
        // When selectors check for it with the in operator inside and outside Search
        const {result: searchResult} = await renderSelector(selectHasReportMissingFromSnapshot, SearchScreen);
        const {result: liveResult} = await renderSelector(selectHasReportMissingFromSnapshot);

        // Then the check agrees with what a read returns in each place
        expect(searchResult.current).toBe(false);
        expect(liveResult.current).toBe(true);
    });

    it('should return the same collection while the snapshot data is unchanged', async () => {
        // Given a selector on a Search screen that returns the report collection next to the session email
        const {result} = await renderSelector(selectReportsAndSessionEmail, SearchScreen);
        const reportsBeforeSessionChange = result.current.reports;

        // When the session changes, which runs the selector again without touching the snapshot
        await act(() => Onyx.merge(ONYXKEYS.SESSION, {email: 'other@expensify.com'}));
        await waitForBatchedUpdatesWithAct();

        // Then the collection is the same object, because selectors compare their inputs by reference to skip work
        expect(result.current.email).toBe('other@expensify.com');
        expect(result.current.reports).toBe(reportsBeforeSessionChange);
    });

    it('should not run the selector again when the component re-renders with unchanged data', async () => {
        // Given a selector rendered on a Search screen
        const selector = jest.fn(selectReport);
        const {rerender} = await renderSelector(selector, SearchScreen);
        const runsAfterMount = selector.mock.calls.length;

        // When the component re-renders without any Onyx change
        rerender({});
        await waitForBatchedUpdatesWithAct();

        // Then the selector is not run again, because the redirect must not defeat the skip that useOnyxState does for unchanged inputs
        expect(selector.mock.calls.length).toBe(runsAfterMount);
    });

    it('should not run the selector inside Search after a plain merge to live data', async () => {
        // Given a selector that reads a report on a Search screen
        const selector = jest.fn(selectReport);
        const {result} = await renderSelector(selector, SearchScreen);
        const runsAfterMount = selector.mock.calls.length;

        // When the live report is changed with a plain merge, which does not touch the snapshot
        await act(() => Onyx.merge(REPORT_KEY, {reportName: 'Merged report'}));
        await waitForBatchedUpdatesWithAct();

        // Then the selector does not run and the snapshot copy stays, because inside Search the hook subscribes to the snapshot only
        expect(selector.mock.calls.length).toBe(runsAfterMount);
        expect(result.current).toEqual(SNAPSHOT_REPORT);
    });

    it('should return the new value inside Search after an update that reaches the snapshot', async () => {
        // Given a selector that reads a report on a Search screen
        const {result} = await renderSelector(selectReport, SearchScreen);

        // When an update changes the report name, which Onyx also applies to the snapshot
        await act(() => Onyx.update([{onyxMethod: Onyx.METHOD.MERGE, key: REPORT_KEY, value: {reportName: 'Updated report'}}]));
        await waitForBatchedUpdatesWithAct();

        // Then the new name is returned because the hook follows the snapshot
        expect(result.current).toEqual({...SNAPSHOT_REPORT, reportName: 'Updated report'});
    });

    it('should give previousState the previous snapshot copy inside Search', async () => {
        // Given a selector on a Search screen that reads the report name from both state and previousState
        const {result} = await renderSelector(selectReportNameWithPrevious, SearchScreen);

        // When an update changes the report name in the snapshot
        await act(() => Onyx.update([{onyxMethod: Onyx.METHOD.MERGE, key: REPORT_KEY, value: {reportName: 'Updated report'}}]));
        await waitForBatchedUpdatesWithAct();

        // Then previousState holds the snapshot copy from before the update, so incremental selectors compare snapshot data with snapshot data
        expect(result.current).toEqual({reportName: 'Updated report', previousReportName: SNAPSHOT_REPORT.reportName});
    });

    it('should read the new snapshot with an empty previousState after the search hash changes', async () => {
        // Given a selector that reads state and previousState on a Search screen showing the first search
        const values: Array<ReturnType<typeof selectReportNameWithPrevious>> = [];
        function Reader() {
            values.push(useOnyxState(selectReportNameWithPrevious));
            return null;
        }
        const {rerender} = render(
            <SearchScreen searchHash={SEARCH_HASH}>
                <Reader />
            </SearchScreen>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the screen switches to a second search that has its own snapshot
        rerender(
            <SearchScreen searchHash={OTHER_SEARCH_HASH}>
                <Reader />
            </SearchScreen>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the report comes from the second snapshot, and previousState has nothing for it because the last run read the first snapshot
        expect(values.at(-1)).toEqual({reportName: OTHER_SNAPSHOT_REPORT.reportName, previousReportName: undefined});
    });

    it('should read live data inside Search when the hook asks for live data', async () => {
        // Given a report whose live and snapshot copies differ, read on a Search screen by a hook that asks for live data
        const {result} = renderHook(() => useOnyxState(selectReport, LIVE_DATA_OPTIONS), {wrapper: SearchScreen});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toEqual(LIVE_REPORT);

        // When the live report is changed with a plain merge, which does not touch the snapshot
        await act(() => Onyx.merge(REPORT_KEY, {reportName: 'Merged report'}));
        await waitForBatchedUpdatesWithAct();

        // Then the hook returns the new live value, because values that must be the same on every screen ignore the snapshot
        expect(result.current).toEqual({...LIVE_REPORT, reportName: 'Merged report'});
    });
});
