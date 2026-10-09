import {act, render} from '@testing-library/react-native';

import {SearchQueryContext} from '@components/Search/SearchContext';
import SearchResultsProvider from '@components/Search/SearchResultsProvider';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import type {SearchQueryContextValue, SearchQueryJSON} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';
import useSnapshotOnyxGet from '@hooks/useSnapshotOnyxGet';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchSuggestionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}` as const;

const EXPENSE_QUERY = buildSearchQueryJSON('type:expense');
const EXPENSE_REPORT_QUERY = buildSearchQueryJSON('type:expense-report');
const SUGGESTED_SEARCHES = getSuggestedSearches(1, undefined, false, undefined);
const TODO_QUERY = SUGGESTED_SEARCHES[CONST.SEARCH.SEARCH_KEYS.SUBMIT].searchQueryJSON;

/** The event handler a component hands to the test, which plays the event by calling it */
type ReportReadHandler = () => Promise<OnyxEntry<Report>>;

function getSnapshotKey(query: SearchQueryJSON | undefined) {
    return `${ONYXKEYS.COLLECTION.SNAPSHOT}${query?.hash ?? -1}` as const;
}

function buildSnapshot(reportName: string): SearchResults {
    return {
        search: {
            offset: 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            hash: 0,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        },
        data: {[REPORT_KEY]: {reportID: REPORT_ID, reportName}},
    };
}

type SearchTreeProps = {
    children: React.ReactNode;
    query?: SearchQueryJSON;
    isTodoSearch?: boolean;
    isOnSearch?: boolean;
};

/** The Search providers wrap every screen; only a Search page wraps its subtree in SearchScopeProvider */
function SearchTree({children, query = EXPENSE_QUERY, isTodoSearch = false, isOnSearch = true}: SearchTreeProps) {
    const queryContext: SearchQueryContextValue = {
        currentSearchHash: query?.hash ?? -1,
        currentSimilarSearchHash: query?.similarSearchHash ?? -1,
        currentSearchKey: isTodoSearch ? CONST.SEARCH.SEARCH_KEYS.SUBMIT : undefined,
        currentSearchQueryJSON: query,
        currentDefaultSearchQueryJSON: undefined,
        currentDefaultSearchQueryFilterKeys: new Set(),
        suggestedSearches: isTodoSearch ? SUGGESTED_SEARCHES : getEmptyObject<SearchQueryContextValue['suggestedSearches']>(),
        shouldResetSearchQuery: false,
    };

    return (
        <SearchQueryContext value={queryContext}>
            <SearchResultsProvider>{isOnSearch ? <SearchScopeProvider>{children}</SearchScopeProvider> : children}</SearchResultsProvider>
        </SearchQueryContext>
    );
}

type ReportReaderProps = {
    /** Receives the component's event handler on every render, so a test can count renders and call the latest handler */
    onRender: (readReport: ReportReadHandler) => void;
};

/** Reads the report only from its event handler, the way a component uses the reader */
function ReportReader({onRender}: ReportReaderProps) {
    const getOnyx = useSnapshotOnyxGet();
    const readReport = () => getOnyx(REPORT_KEY);
    onRender(readReport);
    return null;
}

type SubscribedReportReaderProps = ReportReaderProps & {
    /** Receives the report useOnyx renders */
    onRenderReport: (report: OnyxEntry<Report>) => void;
};

/** Subscribes to the report with useOnyx and renders a ReportReader, so both read from the same place in the tree */
function SubscribedReportReader({onRender, onRenderReport}: SubscribedReportReaderProps) {
    const [report] = useOnyx(REPORT_KEY);
    onRenderReport(report);
    return <ReportReader onRender={onRender} />;
}

describe('useSnapshotOnyxGet', () => {
    let readReport: ReportReadHandler | undefined;
    let renderedReport: OnyxEntry<Report>;
    let renderCount = 0;
    const onRender = (handler: ReportReadHandler) => {
        readReport = handler;
        renderCount++;
    };
    const onRenderReport = (report: OnyxEntry<Report>) => {
        renderedReport = report;
    };

    /** Reads the report with a handler and with useOnyx, from the same place in the tree */
    async function readBothWays(treeProps: Omit<SearchTreeProps, 'children'>) {
        render(
            <SearchTree {...treeProps}>
                <SubscribedReportReader
                    onRender={onRender}
                    onRenderReport={onRenderReport}
                />
            </SearchTree>,
        );
        await waitForBatchedUpdatesWithAct();

        return {readReportName: (await readReport?.())?.reportName, renderedReportName: renderedReport?.reportName};
    }

    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        readReport = undefined;
        renderedReport = undefined;
        renderCount = 0;
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(REPORT_KEY, {reportID: REPORT_ID, reportName: 'Live report'});
            await Onyx.set(getSnapshotKey(EXPENSE_QUERY), buildSnapshot('Snapshot report'));
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('reads the report out of the active snapshot inside a Search scope, the same value useOnyx renders there', async () => {
        // Given the same report ID holds one name under its own key and another inside the active snapshot
        // When a handler inside the Search scope reads the report
        const {readReportName, renderedReportName} = await readBothWays({});

        // Then it gets the snapshot copy, the same one useOnyx shows
        expect(readReportName).toBe('Snapshot report');
        expect(renderedReportName).toBe('Snapshot report');
    });

    it('reads the report from its own key outside a Search scope, even while a snapshot is active', async () => {
        // Given the Search providers have an active snapshot, but the component is not inside a SearchScopeProvider
        // When a handler reads the report
        const {readReportName, renderedReportName} = await readBothWays({isOnSearch: false});

        // Then it gets the live copy, because useOnyx only rewrites keys inside a Search scope
        expect(readReportName).toBe('Live report');
        expect(renderedReportName).toBe('Live report');
    });

    it('reads the report from its own key on a to-do search, which shows live data instead of the snapshot', async () => {
        // Given a to-do search whose snapshot also holds the report, where SearchResultsProvider switches to live Onyx data
        await act(async () => {
            await Onyx.set(getSnapshotKey(TODO_QUERY), buildSnapshot('Snapshot report'));
            await waitForBatchedUpdatesWithAct();
        });

        // When a handler inside the Search scope reads the report
        const {readReportName, renderedReportName} = await readBothWays({query: TODO_QUERY, isTodoSearch: true});

        // Then it reads the live copy, as useOnyx does, instead of a stale server copy
        expect(readReportName).toBe('Live report');
        expect(renderedReportName).toBe('Live report');
    });

    it('does not re-render when the report or the snapshot changes, yet reads the updated value on call', async () => {
        // Given a component that only reads Onyx from handlers, inside a Search scope
        render(
            <SearchTree>
                <ReportReader onRender={onRender} />
            </SearchTree>,
        );
        await waitForBatchedUpdatesWithAct();
        const rendersAfterMount = renderCount;

        // When both the live report and its snapshot copy change
        await act(async () => {
            await Onyx.merge(REPORT_KEY, {reportName: 'Live report renamed'});
            await Onyx.merge(getSnapshotKey(EXPENSE_QUERY), {data: {[REPORT_KEY]: {reportName: 'Snapshot report renamed'}}});
            await waitForBatchedUpdatesWithAct();
        });

        // Then it does not re-render, since it holds no subscription, but a handler still reads the new snapshot copy
        expect(renderCount).toBe(rendersAfterMount);
        expect((await readReport?.())?.reportName).toBe('Snapshot report renamed');
    });

    it('does not re-render outside a Search scope when the active search changes', async () => {
        // Given a handler-only component outside any Search scope, passed as the same element on every render like a screen's child
        const component = <ReportReader onRender={onRender} />;
        const {rerender} = render(<SearchTree isOnSearch={false}>{component}</SearchTree>);
        await waitForBatchedUpdatesWithAct();
        const rendersAfterMount = renderCount;

        // When the user runs another search, which changes the snapshot hash the providers expose
        rerender(
            <SearchTree
                isOnSearch={false}
                query={EXPENSE_REPORT_QUERY}
            >
                {component}
            </SearchTree>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then it does not re-render, because only a Search scope reads the snapshot hash
        expect(renderCount).toBe(rendersAfterMount);
    });

    it('switches to the new snapshot after the active search changes inside a Search scope', async () => {
        // Given a second search whose snapshot holds a different copy of the report
        await act(async () => {
            await Onyx.set(getSnapshotKey(EXPENSE_REPORT_QUERY), buildSnapshot('Other snapshot report'));
            await waitForBatchedUpdatesWithAct();
        });
        const component = <ReportReader onRender={onRender} />;
        const {rerender} = render(<SearchTree>{component}</SearchTree>);
        await waitForBatchedUpdatesWithAct();

        // When the user runs that search
        rerender(<SearchTree query={EXPENSE_REPORT_QUERY}>{component}</SearchTree>);
        await waitForBatchedUpdatesWithAct();

        // Then the handler reads the new snapshot, not rows from the previous search
        expect((await readReport?.())?.reportName).toBe('Other snapshot report');
    });
});
