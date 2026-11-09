import {act, renderHook} from '@testing-library/react-native';

import {SearchQueryContext, SearchResultsContext} from '@components/Search/SearchContextDefinitions';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {OnyxEntry} from 'react-native-onyx';

import React, {use, useMemo} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const SEARCH_HASH = 42;
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${SEARCH_HASH}` as const;
const REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}1` as const;
const REPORT_MISSING_FROM_SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.REPORT}2` as const;
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}A` as const;

const LIVE_REPORT: Report = {reportID: '1', reportName: 'Live report'};
const SNAPSHOT_REPORT: Report = {reportID: '1', reportName: 'Snapshot report'};
const REPORT_MISSING_FROM_SNAPSHOT: Report = {reportID: '2', reportName: 'Live only report'};
const LIVE_SESSION_EMAIL = 'live@expensify.com';

type SearchScreenProps = ChildrenProps & {
    shouldUseLiveData?: boolean;
};

function SearchScreen({children, isOnSearch = true, shouldUseLiveData = false}: SearchScreenProps) {
    const queryContext = use(SearchQueryContext);
    const resultsContext = use(SearchResultsContext);
    const queryContextWithHash = useMemo(() => ({...queryContext, currentSearchHash: SEARCH_HASH}), [queryContext]);
    const resultsContextWithLiveData = useMemo(() => ({...resultsContext, shouldUseLiveData}), [resultsContext, shouldUseLiveData]);

    return (
        <SearchScopeProvider isOnSearch={isOnSearch}>
            <SearchQueryContext.Provider value={queryContextWithHash}>
                <SearchResultsContext.Provider value={resultsContextWithLiveData}>{children}</SearchResultsContext.Provider>
            </SearchQueryContext.Provider>
        </SearchScopeProvider>
    );
}

function SearchScreenWithLiveData({children}: ChildrenProps) {
    return <SearchScreen shouldUseLiveData>{children}</SearchScreen>;
}

function SearchScreenOutsideSearchScope({children}: ChildrenProps) {
    return <SearchScreen isOnSearch={false}>{children}</SearchScreen>;
}

function selectReportName(report: OnyxEntry<Report>) {
    return report?.reportName;
}

async function renderReport(wrapper?: React.ComponentType<ChildrenProps>) {
    const rendered = renderHook(() => useOnyx(REPORT_KEY), {wrapper});
    await waitForBatchedUpdatesWithAct();
    return rendered;
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

describe('useOnyx Search snapshot redirect', () => {
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
        await waitForBatchedUpdatesWithAct();
    });

    it('reads live data outside Search', async () => {
        // Given a report whose live and snapshot copies differ
        // When it is read outside any Search scope
        const {result} = await renderReport();

        // Then the live copy is returned because only Search screens use snapshots
        expect(result.current[0]).toEqual(LIVE_REPORT);
    });

    it('reads the snapshot copy inside Search', async () => {
        // Given a report whose live and snapshot copies differ
        // When it is read on a Search screen
        const {result} = await renderReport(SearchScreen);

        // Then the snapshot copy is returned so the row matches the search results
        expect(result.current[0]).toEqual(SNAPSHOT_REPORT);
    });

    it('reads live data inside Search when live data is requested', async () => {
        // Given a Search screen that asks for live data
        // When a report is read on that screen
        const {result} = await renderReport(SearchScreenWithLiveData);

        // Then the live copy is returned because the screen opted out of snapshots
        expect(result.current[0]).toEqual(LIVE_REPORT);
    });

    it('reads live data when the Search scope is turned off', async () => {
        // Given a Search screen with a search hash but a scope marked as not on Search
        // When a report is read on that screen
        const {result} = await renderReport(SearchScreenOutsideSearchScope);

        // Then the live copy is returned because the scope decides whether snapshots apply
        expect(result.current[0]).toEqual(LIVE_REPORT);
    });

    it('passes the snapshot copy to the selector inside Search', async () => {
        // Given a report whose live and snapshot copies have different names
        // When its name is read through a selector on a Search screen
        const {result} = renderHook(() => useOnyx(REPORT_KEY, {selector: selectReportName}), {wrapper: SearchScreen});
        await waitForBatchedUpdatesWithAct();

        // Then the selector sees the snapshot copy so it matches the search results
        expect(result.current[0]).toBe(SNAPSHOT_REPORT.reportName);
    });

    it('passes the live copy to the selector outside Search', async () => {
        // Given a report whose live and snapshot copies have different names
        // When its name is read through a selector outside any Search scope
        const {result} = renderHook(() => useOnyx(REPORT_KEY, {selector: selectReportName}));
        await waitForBatchedUpdatesWithAct();

        // Then the selector sees the live copy because only Search screens use snapshots
        expect(result.current[0]).toBe(LIVE_REPORT.reportName);
    });

    it('returns only the snapshot members of a collection inside Search', async () => {
        // Given two live reports and a snapshot that holds only one of them next to a policy
        // When the report collection is read on a Search screen
        const {result} = renderHook(() => useOnyx(ONYXKEYS.COLLECTION.REPORT), {wrapper: SearchScreen});
        await waitForBatchedUpdatesWithAct();

        // Then only the snapshot report comes back so the list matches the search results
        expect(result.current[0]).toEqual({[REPORT_KEY]: SNAPSHOT_REPORT});
    });

    it('returns nothing inside Search for a report the snapshot does not hold', async () => {
        // Given a report that exists live but is missing from the snapshot
        // When it is read on a Search screen
        const {result} = renderHook(() => useOnyx(REPORT_MISSING_FROM_SNAPSHOT_KEY), {wrapper: SearchScreen});
        await waitForBatchedUpdatesWithAct();

        // Then nothing is returned because Search never falls back to live data
        expect(result.current[0]).toBeUndefined();
    });

    it('reads live data inside Search for keys that snapshots do not copy', async () => {
        // Given a live session, which snapshots never hold
        // When it is read on a Search screen
        const {result} = renderHook(() => useOnyx(ONYXKEYS.SESSION), {wrapper: SearchScreen});
        await waitForBatchedUpdatesWithAct();

        // Then the live value is returned because only snapshot keys are redirected
        expect(result.current[0]?.email).toBe(LIVE_SESSION_EMAIL);
    });

    it('never redirects a snapshot key inside Search', async () => {
        // Given a snapshot that holds a report
        // When the snapshot key itself is read on a Search screen
        const {result} = renderHook(() => useOnyx(SNAPSHOT_KEY), {wrapper: SearchScreen});
        await waitForBatchedUpdatesWithAct();

        // Then the whole snapshot is returned so Search can read its own results
        expect(result.current[0]?.data?.[REPORT_KEY]).toEqual(SNAPSHOT_REPORT);
    });

    it('returns nothing inside a Search scope that has no search hash', async () => {
        // Given a Search scope without a search query, so the default search hash applies
        // When a report that exists live is read in that scope
        const {result} = await renderReport(SearchScopeProvider);

        // Then nothing is returned because the default hash has no snapshot
        expect(result.current[0]).toBeUndefined();
    });
});

describe('useOnyx Search snapshot updates', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(REPORT_KEY, LIVE_REPORT);
        await Onyx.merge(SNAPSHOT_KEY, {data: {[REPORT_KEY]: SNAPSHOT_REPORT}});
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps the snapshot copy inside Search after a plain merge to live data', async () => {
        // Given a report read on a Search screen
        const {result} = await renderReport(SearchScreen);

        // When the live report is changed with a plain merge
        await act(() => Onyx.merge(REPORT_KEY, {reportName: 'Merged report'}));
        await waitForBatchedUpdatesWithAct();

        // Then Search still shows the snapshot copy because only Onyx.update syncs snapshots
        expect(result.current[0]).toEqual(SNAPSHOT_REPORT);
    });

    it('applies an update to snapshot fields but not to new fields', async () => {
        // Given a report read on a Search screen whose snapshot copy has no description
        const {result} = await renderReport(SearchScreen);

        // When an update changes the name and adds a description
        await act(() => Onyx.update([{onyxMethod: Onyx.METHOD.MERGE, key: REPORT_KEY, value: {reportName: 'Updated report', description: 'New description'}}]));
        await waitForBatchedUpdatesWithAct();

        // Then Search shows the new name but not the description the snapshot never had
        expect(result.current[0]).toEqual({...SNAPSHOT_REPORT, reportName: 'Updated report'});
    });
});
