import PrevNextButtons from '@components/PrevNextButtons';
import useLiveRowLimit from '@components/Search/hooks/useLiveRowLimit';
import {useSearchResultsContext} from '@components/Search/SearchContext';

import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSections from '@hooks/useSearchSections';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSearchPending} from '@libs/SearchUIUtils';
import {startSpan} from '@libs/telemetry/activeSpans';

import Navigation from '@navigation/Navigation';

import {search} from '@userActions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import type {OnyxEntry} from 'react-native-onyx';

import React, {startTransition, useEffect, useState} from 'react';
import {View} from 'react-native';

import MoneyRequestReportNavigationCounter from './MoneyRequestReportNavigationCounter';

type MoneyRequestReportNavigationProps = {
    reportID?: string;
    shouldDisplayNarrowVersion: boolean;
};

type MoneyRequestReportNavigationContentProps = MoneyRequestReportNavigationProps & {
    contextReports: Array<string | undefined>;
};

type MoneyRequestReportNavigationStandaloneProps = {
    onReportsChange: (updater: (previousReports: Array<string | undefined>) => Array<string | undefined>) => void;
};

type SnapshotGuard = {
    hasMultiple: boolean;
    includesReport: boolean;
};

/** Paging state of the search snapshot the navigation pages through */
type SnapshotPaging = {
    isLoading: boolean;

    hasMoreResults: boolean;

    /** Offset of the last page requested, written when the request goes out rather than when it answers */
    offset: number;

    /** Whether a search on this snapshot is still running, including the ones that don't set `isLoading` */
    isPending: boolean;

    /** Whether the last search on this snapshot failed. Its rows stay in place, but `offset` already moved to the failed page */
    didFail: boolean;
};

const EMPTY_PAGING: SnapshotPaging = {
    isLoading: false,
    hasMoreResults: false,
    offset: 0,
    isPending: false,
    didFail: false,
};

const EMPTY_GUARD: SnapshotGuard = {
    hasMultiple: false,
    includesReport: false,
};

const selectIsExpenseReportSearch = (lastSearchQuery: OnyxEntry<LastSearchParams>): boolean => lastSearchQuery?.queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

const selectQueryHash = (lastSearchQuery: OnyxEntry<LastSearchParams>): number | undefined => lastSearchQuery?.queryJSON?.hash;

const selectSnapshotPaging = (snapshot: OnyxEntry<SearchResults>): SnapshotPaging => ({
    isLoading: !!snapshot?.search?.isLoading,
    hasMoreResults: !!snapshot?.search?.hasMoreResults,
    offset: snapshot?.search?.offset ?? 0,
    isPending: isSearchPending(snapshot),
    // Live results drop `errors`, so the response code is the only failure signal both kinds of search keep
    didFail: typeof snapshot?.search?.responseJsonCode === 'number',
});

/**
 * Search sections can yield entries that aren't openable reports. An unreported (self-DM) expense is grouped under
 * the "0" placeholder rather than a real report, so paging onto it lands the user on an empty report. It also
 * inflates the "x of y" counter with a report the Reports list never showed them.
 */
const isNavigableReportID = (reportID: string | undefined): reportID is string => !!reportID && reportID !== CONST.REPORT.UNREPORTED_REPORT_ID;

const isSameReportList = (a: Array<string | undefined>, b: Array<string | undefined> | null): boolean => {
    if (a === b) {
        return true;
    }
    if (b === null || a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a.at(i) !== b.at(i)) {
            return false;
        }
    }
    return true;
};

/**
 * Puts the open report back into a live list that dropped it, right after the report that came before it in the
 * last list that held it. When the live list holds none of the reports past the open one, the last list is returned instead.
 */
const keepReportInPlace = (liveReports: Array<string | undefined>, previousReports: Array<string | undefined>, reportID: string | undefined): Array<string | undefined> => {
    const previousIndex = previousReports.indexOf(reportID);
    if (!reportID || previousIndex === -1) {
        return liveReports;
    }
    // A first page refetch replaces the results with page 1, and the standalone list is empty until it is computed.
    // Neither one reaches the open report, and placing the open report in them would end the list there.
    const liveReportIDs = new Set(liveReports);
    const isLastReport = previousIndex === previousReports.length - 1;
    const reportsPastOpenReport = isLastReport ? previousReports.slice(0, previousIndex) : previousReports.slice(previousIndex + 1);
    if (!reportsPastOpenReport.some((id) => liveReportIDs.has(id))) {
        return previousReports;
    }
    for (let i = previousIndex - 1; i >= 0; i--) {
        const liveIndex = liveReports.indexOf(previousReports.at(i));
        if (liveIndex !== -1) {
            return [...liveReports.slice(0, liveIndex + 1), reportID, ...liveReports.slice(liveIndex + 1)];
        }
    }
    return [reportID, ...liveReports];
};

const buildSnapshotGuardSelector =
    (reportID: string | undefined) =>
    (snapshot: OnyxEntry<SearchResults>): SnapshotGuard => {
        const data = snapshot?.data;
        if (!data || !reportID) {
            return EMPTY_GUARD;
        }
        const prefix = ONYXKEYS.COLLECTION.REPORT;
        let count = 0;
        let includesReport = false;
        for (const key of Object.keys(data)) {
            if (!key.startsWith(prefix)) {
                continue;
            }
            count++;
            if (!includesReport && key.slice(prefix.length) === reportID) {
                includesReport = true;
            }
            if (count > 1 && includesReport) {
                break;
            }
        }
        return {hasMultiple: count > 1, includesReport};
    };

// Mounts the heavy useSearchSections subscriptions (card feeds, report NVPs, bank accounts, report
// attributes) and the getSections/getSortedSections rebuild, then lifts the computed list up. It is
// rendered by the content component ONLY on the slow path (pagination in flight or no context list), so
// those subscriptions never run while the fast context path is active — restoring the lightweight fast
// path from #86238. Keeping the lifted value in the always-mounted content component means it (and the
// lastValidReports cache) survive the isSearchLoading toggle instead of being wiped by a subtree swap.
function MoneyRequestReportNavigationStandalone({onReportsChange}: MoneyRequestReportNavigationStandaloneProps) {
    const {allReports} = useSearchSections();

    useEffect(() => {
        // Guard by content, not reference: useSearchSections rebuilds allReports via filter/map each
        // render, so an identity check would refire this update every render and loop.
        const navigableReports = allReports.filter(isNavigableReportID);
        onReportsChange((previousReports) => (isSameReportList(navigableReports, previousReports) ? previousReports : navigableReports));
    }, [allReports, onReportsChange]);

    return null;
}

function MoneyRequestReportNavigationContent({reportID, shouldDisplayNarrowVersion, contextReports}: MoneyRequestReportNavigationContentProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseLiveData} = useSearchResultsContext();

    // Lightweight subscriptions only: the current search query and its paging state. These never mount
    // the heavy useSearchSections subscription set, so the fast context path stays cheap.
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const shouldReturnTripRooms = useShouldReturnTripRooms(lastSearchQuery?.queryJSON?.type);
    const [paging = EMPTY_PAGING] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`, {selector: selectSnapshotPaging});
    // Other searches on this query, like a refetch carrying the Search list's offset, also mark the snapshot pending,
    // so only the page this component asked for holds Next back
    const [requestedPageOffset, setRequestedPageOffset] = useState<number>();
    const isOwnPageRequestPending = paging.isPending && paging.offset === requestedPageOffset;
    const isFirstPageRefreshing = paging.isPending && paging.offset === 0;
    const isSearchLoading = paging.isLoading || isOwnPageRequestPending;

    const hasUnconfirmedPage = paging.isPending || paging.didFail;
    const {answeredOffset: answeredLiveOffset, confirmedOffset: confirmedSnapshotOffset} = useLiveRowLimit(paging.offset, hasUnconfirmedPage);
    // A failed first page refetch leaves `offset` at 0 while the pages after it are still loaded, so the snapshot
    // cursor only follows a search that answered
    const [settledSnapshotOffset, setSettledSnapshotOffset] = useState(confirmedSnapshotOffset);
    if (!hasUnconfirmedPage && settledSnapshotOffset !== confirmedSnapshotOffset) {
        setSettledSnapshotOffset(confirmedSnapshotOffset);
    }
    // A refresh rewinds the offset of a to-do search while its loaded rows stay in Onyx, so it pages on from the pages that answered
    const nextPageOffset = (shouldUseLiveData ? answeredLiveOffset : settledSnapshotOffset) + CONST.SEARCH.RESULTS_PAGE_SIZE;

    // Fast path: use the pre-computed IDs from the search context when they are usable and no page is in
    // flight. Otherwise fall back to the standalone list, which is produced by the child below that mounts
    // the heavy subscriptions only on this slow path. Because this is a value swap inside a single, stable
    // component, toggling isSearchLoading (e.g. the search refresh triggered by submitting a report) no
    // longer unmounts the component and wipes the lastValidReports cache below.
    const shouldUseContextReports = contextReports.length > 0 && !isSearchLoading;
    const [standaloneReports, setStandaloneReports] = useState<Array<string | undefined>>([]);
    const allReports = shouldUseContextReports ? contextReports : standaloneReports;

    const liveCurrentIndex = allReports.indexOf(reportID);

    // A refresh can drop the open report from the results, for example after approving it from Spend > Approve.
    // The last list that still held it tells us which report came before it, so the report goes back right after
    // that one in the live list. That keeps the arrows visible and lets Next continue with the reports that are
    // live now, instead of a cached list that ends where the old results ended.
    // The cache is compared by content, because useSearchSections rebuilds allReports on every render and a
    // reference check would set state on every render and loop.
    const [lastValidReports, setLastValidReports] = useState<Array<string | undefined> | null>(null);
    if (liveCurrentIndex !== -1 && !isSameReportList(allReports, lastValidReports)) {
        setLastValidReports(allReports);
    }
    const effectiveAllReports = liveCurrentIndex === -1 && lastValidReports ? keepReportInPlace(allReports, lastValidReports, reportID) : allReports;
    const currentIndex = effectiveAllReports.indexOf(reportID);

    // A first page response that lands after the next page would replace the snapshot and drop that page, and offline the
    // request could only fail
    const canRequestNextPage = paging.hasMoreResults && !isOwnPageRequestPending && !isFirstPageRefreshing && !isOffline;
    const hideNextButton = !canRequestNextPage && currentIndex === effectiveAllReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    const shouldDisplayNavigationArrows = effectiveAllReports.length > 1 && currentIndex !== -1 && !!lastSearchQuery?.queryJSON;

    const goToReportId = (reportId?: string) => {
        if (!reportId) {
            return;
        }
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportId}`, {
            name: 'ReportNavigation',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });
        startTransition(() => {
            Navigation.setParams({
                reportID: reportId,
                reportActionID: undefined,
                referrer: undefined,
            });
        });
    };

    const goToNextReport = () => {
        if (currentIndex === -1 || effectiveAllReports.length === 0 || !lastSearchQuery?.queryJSON) {
            return;
        }
        const threshold = Math.min(effectiveAllReports.length * 0.75, effectiveAllReports.length - 2);

        if (currentIndex + 1 >= threshold && canRequestNextPage) {
            const queryJSON = lastSearchQuery.queryJSON;
            const searchKey = lastSearchQuery.searchKey;
            const offset = nextPageOffset;
            setRequestedPageOffset(offset);
            // Each Next press queues an OpenReport write, so waiting for writes would hold the page back. A refetch for an
            // expense created meanwhile returns early while `isLoading` is set and is never retried, so the request leaves it unset.
            requestAnimationFrame(() => {
                search({
                    queryJSON,
                    offset,
                    shouldCalculateTotals: false,
                    searchKey,
                    isLoading: false,
                    skipWaitForWrites: true,
                    shouldShowLoading: false,
                    shouldReturnTripRooms,
                });
            });
        }

        goToReportId(effectiveAllReports.at(currentIndex + 1));
    };

    const goToPrevReport = () => {
        if (currentIndex === -1 || effectiveAllReports.length === 0) {
            return;
        }

        const prevIndex = (currentIndex - 1) % effectiveAllReports.length;
        goToReportId(effectiveAllReports.at(prevIndex));
    };

    return (
        <>
            {/* Slow path only: mount the heavy subscriptions and lift the computed list up. Rendered even
                when the arrows are hidden, since standaloneReports is what decides whether to show them. */}
            {!shouldUseContextReports && <MoneyRequestReportNavigationStandalone onReportsChange={setStandaloneReports} />}
            {shouldDisplayNavigationArrows && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                    {!shouldDisplayNarrowVersion && (
                        <MoneyRequestReportNavigationCounter
                            current={currentIndex + 1}
                            total={effectiveAllReports.length}
                        />
                    )}
                    <PrevNextButtons
                        isPrevButtonDisabled={hidePrevButton}
                        isNextButtonDisabled={hideNextButton}
                        onNext={goToNextReport}
                        onPrevious={goToPrevReport}
                    />
                </View>
            )}
        </>
    );
}

function MoneyRequestReportNavigation({reportID, shouldDisplayNarrowVersion}: MoneyRequestReportNavigationProps) {
    // Guard: only mount inner tree when snapshot confirms multiple expense reports
    const [isExpenseReportSearch] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {selector: selectIsExpenseReportSearch});
    const [hash] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {
        selector: selectQueryHash,
    });
    const snapshotGuardSelector = buildSnapshotGuardSelector(reportID);
    const [snapshotGuard = EMPTY_GUARD] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {selector: snapshotGuardSelector});

    // Fast-path source: pre-computed IDs from the search context. The heavier useSearchSections
    // subscription is deferred to the standalone child rendered by the content component, which mounts
    // it only on the slow path (pagination/loading or no context list).
    const {sortedReportIDs} = useSearchResultsContext();
    const contextReports = useFilterPendingDeleteReports(sortedReportIDs).filter(isNavigableReportID);

    const isLiveGuardSatisfied = isExpenseReportSearch && snapshotGuard.hasMultiple && snapshotGuard.includesReport;

    // Once the live snapshot has satisfied the guard during this mount, keep the inner component
    // mounted even if the guard later flips false (e.g. the current report is removed from the
    // snapshot after approving it). The inner component falls back to a cached list so the
    // carousel stays visible for continued navigation.
    const [shouldKeepMounted, setShouldKeepMounted] = useState(false);
    if (isLiveGuardSatisfied && !shouldKeepMounted) {
        setShouldKeepMounted(true);
    }

    if (!shouldKeepMounted) {
        return null;
    }

    // A single, stable content instance owns the fast-path vs. standalone source selection and the
    // lastValidReports cache. Because it is never unmounted while the carousel is visible, the search
    // refresh that submitting a report triggers can no longer destroy that cache, so the navigation
    // arrows stay visible after the current report drops out of the live list.
    return (
        <MoneyRequestReportNavigationContent
            reportID={reportID}
            shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
            contextReports={contextReports}
        />
    );
}

export default MoneyRequestReportNavigation;
export {isNavigableReportID};
