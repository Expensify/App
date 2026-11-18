import PrevNextButtons from '@components/PrevNextButtons';
import {useSearchResultsContext} from '@components/Search/SearchContext';

import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSections from '@hooks/useSearchSections';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';
import useThemeStyles from '@hooks/useThemeStyles';

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

type SnapshotPaging = {
    isLoading: boolean;
    hasMoreResults: boolean;
    isPageRequestPending: boolean;
    nextPageOffset: number;
};

const EMPTY_PAGING: SnapshotPaging = {
    isLoading: false,
    hasMoreResults: false,
    isPageRequestPending: false,
    nextPageOffset: CONST.SEARCH.RESULTS_PAGE_SIZE,
};

const EMPTY_GUARD: SnapshotGuard = {
    hasMultiple: false,
    includesReport: false,
};

const selectIsExpenseReportSearch = (lastSearchQuery: OnyxEntry<LastSearchParams>): boolean => lastSearchQuery?.queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

const selectQueryHash = (lastSearchQuery: OnyxEntry<LastSearchParams>): number | undefined => lastSearchQuery?.queryJSON?.hash;

const selectSnapshotPaging = (snapshot: OnyxEntry<SearchResults>): SnapshotPaging => {
    const offset = snapshot?.search?.offset ?? 0;
    const didLastPageFail = offset > 0 && typeof snapshot?.search?.responseJsonCode === 'number';
    return {
        isLoading: !!snapshot?.search?.isLoading,
        hasMoreResults: !!snapshot?.search?.hasMoreResults,
        isPageRequestPending: offset > 0 && snapshot?.search?.state === CONST.SEARCH.SNAPSHOT_STATE.LOADING,
        nextPageOffset: didLastPageFail ? offset : offset + CONST.SEARCH.RESULTS_PAGE_SIZE,
    };
};

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

const keepReportInPlace = (liveReports: Array<string | undefined>, previousReports: Array<string | undefined>, reportID: string | undefined): Array<string | undefined> => {
    const previousIndex = previousReports.indexOf(reportID);
    if (!reportID || previousIndex === -1) {
        return liveReports;
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

    // Lightweight subscriptions only: the current search query and its paging state. These never mount
    // the heavy useSearchSections subscription set, so the fast context path stays cheap.
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const shouldReturnTripRooms = useShouldReturnTripRooms(lastSearchQuery?.queryJSON?.type);
    const [paging = EMPTY_PAGING] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`, {selector: selectSnapshotPaging});
    const isSearchLoading = paging.isLoading;

    // Fast path: use the pre-computed IDs from the search context when they are usable and no page is in
    // flight. Otherwise fall back to the standalone list, which is produced by the child below that mounts
    // the heavy subscriptions only on this slow path. Because this is a value swap inside a single, stable
    // component, toggling isSearchLoading (e.g. the search refresh triggered by submitting a report) no
    // longer unmounts the component and wipes the lastValidReports cache below.
    const shouldUseContextReports = contextReports.length > 0 && !isSearchLoading;
    const [standaloneReports, setStandaloneReports] = useState<Array<string | undefined>>([]);
    const allReports = shouldUseContextReports ? contextReports : standaloneReports;

    const liveCurrentIndex = allReports.indexOf(reportID);

    // Cache the last list where the current report was still present. When the search snapshot
    // is refreshed and the current report drops out (e.g. after approving from Spend > Needs
    // Approval), keep the report in the live list right after the report that preceded it in the
    // cached list, so the carousel stays populated and Next keeps paging through the live results
    // instead of the arrows disappearing. setState during render is
    // the React-recommended pattern for storing information from previous renders. We compare
    // by content rather than reference because useSearchSections rebuilds allReports via
    // filter/map each render, so identity comparison would refire the setState every render and
    // trigger an infinite update loop.
    const [lastValidReports, setLastValidReports] = useState<Array<string | undefined> | null>(null);
    if (liveCurrentIndex !== -1 && !isSameReportList(allReports, lastValidReports)) {
        setLastValidReports(allReports);
    }
    const effectiveAllReports = liveCurrentIndex === -1 && lastValidReports ? keepReportInPlace(allReports, lastValidReports, reportID) : allReports;
    const currentIndex = effectiveAllReports.indexOf(reportID);

    const hideNextButton = !paging.hasMoreResults && currentIndex === effectiveAllReports.length - 1;
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

        if (currentIndex + 1 >= threshold && paging.hasMoreResults && !paging.isPageRequestPending && !isOffline) {
            const queryJSON = lastSearchQuery.queryJSON;
            const searchKey = lastSearchQuery.searchKey;
            const offset = paging.nextPageOffset;
            requestAnimationFrame(() => {
                search({
                    queryJSON,
                    offset,
                    shouldCalculateTotals: false,
                    searchKey,
                    isLoading: false,
                    skipWaitForWrites: true,
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
