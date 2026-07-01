import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSections from '@hooks/useSearchSections';
import useThemeStyles from '@hooks/useThemeStyles';
import {startSpan} from '@libs/telemetry/activeSpans';
import Navigation from '@navigation/Navigation';
import {saveLastSearchParams} from '@userActions/ReportNavigation';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

type MoneyRequestReportNavigationProps = {
    reportID?: string;
    shouldDisplayNarrowVersion: boolean;
};

type MoneyRequestReportNavigationContentProps = MoneyRequestReportNavigationProps & {
    allReports: Array<string | undefined>;
    isSearchLoading: boolean;
    lastSearchQuery: OnyxEntry<LastSearchParams>;
};

type SnapshotGuard = {
    hasMultiple: boolean;
    includesReport: boolean;
};

const EMPTY_GUARD: SnapshotGuard = {hasMultiple: false, includesReport: false};

const selectIsExpenseReportSearch = (lastSearchQuery: OnyxEntry<LastSearchParams>): boolean => lastSearchQuery?.queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

const selectQueryHash = (lastSearchQuery: OnyxEntry<LastSearchParams>): number | undefined => lastSearchQuery?.queryJSON?.hash;

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

function MoneyRequestReportNavigationContent({reportID, shouldDisplayNarrowVersion, allReports, isSearchLoading, lastSearchQuery}: MoneyRequestReportNavigationContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const liveCurrentIndex = allReports.indexOf(reportID);

    // Cache the last list where the current report was still present. When the search snapshot
    // is refreshed and the current report drops out (e.g. after approving from Spend > Needs
    // Approval), keep using the cached list so the carousel stays populated and the user can
    // navigate to the next report instead of the arrows disappearing. setState during render is
    // the React-recommended pattern for storing information from previous renders. We compare
    // by content rather than reference because useSearchSections rebuilds allReports via
    // filter/map each render, so identity comparison would refire the setState every render and
    // trigger an infinite update loop.
    const [lastValidReports, setLastValidReports] = useState<Array<string | undefined> | null>(null);
    if (liveCurrentIndex !== -1 && !isSameReportList(allReports, lastValidReports)) {
        setLastValidReports(allReports);
    }
    const effectiveAllReports = liveCurrentIndex === -1 && lastValidReports ? lastValidReports : allReports;
    const currentIndex = effectiveAllReports.indexOf(reportID);

    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;
    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === effectiveAllReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    const shouldDisplayNavigationArrows = effectiveAllReports.length > 1 && currentIndex !== -1 && !!lastSearchQuery?.queryJSON;

    useEffect(() => {
        if (!lastSearchQuery?.queryJSON) {
            return;
        }

        if (lastSearchQuery.allowPostSearchRecount) {
            saveLastSearchParams({
                ...lastSearchQuery,
                allowPostSearchRecount: false,
                previousLengthOfResults: effectiveAllReports.length,
            });
            return;
        }

        // Update count when reports are added or removed (e.g., created offline)
        if (effectiveAllReports.length !== allReportsCount) {
            saveLastSearchParams({
                ...lastSearchQuery,
                previousLengthOfResults: effectiveAllReports.length,
            });
            return;
        }

        if (currentIndex < allReportsCount - 1) {
            return;
        }

        saveLastSearchParams({
            ...lastSearchQuery,
            previousLengthOfResults: effectiveAllReports.length,
        });
    }, [currentIndex, allReportsCount, effectiveAllReports.length, lastSearchQuery?.queryJSON, lastSearchQuery]);

    const goToReportId = (reportId?: string) => {
        if (!reportId) {
            return;
        }
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportId}`, {
            name: 'ReportNavigation',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });
        Navigation.setParams({
            reportID: reportId,
            reportActionID: undefined,
            referrer: undefined,
        });
    };

    const goToNextReport = () => {
        if (currentIndex === -1 || effectiveAllReports.length === 0 || !lastSearchQuery?.queryJSON) {
            return;
        }
        const threshold = Math.min(effectiveAllReports.length * 0.75, effectiveAllReports.length - 2);

        if (currentIndex + 1 >= threshold && lastSearchQuery?.hasMoreResults) {
            const newOffset = (lastSearchQuery.offset ?? 0) + CONST.SEARCH.RESULTS_PAGE_SIZE;
            search({
                queryJSON: lastSearchQuery.queryJSON,
                offset: newOffset,
                prevReportsLength: effectiveAllReports.length,
                shouldCalculateTotals: false,
                searchKey: lastSearchQuery.searchKey,
                isLoading: isSearchLoading,
                shouldUpdateLastSearchParams: true,
            });
        }

        const nextIndex = (currentIndex + 1) % effectiveAllReports.length;
        goToReportId(effectiveAllReports.at(nextIndex));
    };

    const goToPrevReport = () => {
        if (currentIndex === -1 || effectiveAllReports.length === 0) {
            return;
        }

        const prevIndex = (currentIndex - 1) % effectiveAllReports.length;
        goToReportId(effectiveAllReports.at(prevIndex));
    };

    if (!shouldDisplayNavigationArrows) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            {!shouldDisplayNarrowVersion && (
                <Text style={[styles.mutedTextLabel, styles.textAlignRight, styles.mnw8]}>{translate('common.currentOfTotal', {current: currentIndex + 1, total: allReportsCount})}</Text>
            )}
            <PrevNextButtons
                isPrevButtonDisabled={hidePrevButton}
                isNextButtonDisabled={hideNextButton}
                onNext={goToNextReport}
                onPrevious={goToPrevReport}
            />
        </View>
    );
}

// All Onyx subscriptions via useSearchSections. Mounts if there are no sorted report IDs in the context.
function MoneyRequestReportNavigationStandalone({reportID, shouldDisplayNarrowVersion}: MoneyRequestReportNavigationProps) {
    const {allReports, isSearchLoading, lastSearchQuery} = useSearchSections();

    return (
        <MoneyRequestReportNavigationContent
            reportID={reportID}
            shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
            allReports={allReports}
            isSearchLoading={isSearchLoading}
            lastSearchQuery={lastSearchQuery}
        />
    );
}

function MoneyRequestReportNavigation({reportID, shouldDisplayNarrowVersion}: MoneyRequestReportNavigationProps) {
    // Guard: only mount inner tree when snapshot confirms multiple expense reports
    const [isExpenseReportSearch] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {selector: selectIsExpenseReportSearch});
    const [hash] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {selector: selectQueryHash});
    const snapshotGuardSelector = buildSnapshotGuardSelector(reportID);
    const [snapshotGuard = EMPTY_GUARD] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {selector: snapshotGuardSelector});

    // Fast-path hooks (always called to satisfy rules of hooks)
    const {sortedReportIDs} = useSearchResultsContext();
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const searchLoadingSelector = (data: OnyxEntry<SearchResults>) => !!data?.search?.isLoading;
    const [isSearchLoading = false] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`, {
        selector: searchLoadingSelector,
    });
    const allReports = useFilterPendingDeleteReports(sortedReportIDs);

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

    // Fast path: use pre-computed IDs from context when available and no pagination is in flight.
    // During pagination fall back to full subscription so new pages are reflected immediately.
    if (allReports.length > 0 && !isSearchLoading) {
        return (
            <MoneyRequestReportNavigationContent
                reportID={reportID}
                shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
                allReports={allReports}
                isSearchLoading={isSearchLoading}
                lastSearchQuery={lastSearchQuery}
            />
        );
    }

    return (
        <MoneyRequestReportNavigationStandalone
            reportID={reportID}
            shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
        />
    );
}

export default MoneyRequestReportNavigation;
