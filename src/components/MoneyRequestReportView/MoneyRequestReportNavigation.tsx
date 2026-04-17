import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import {useSearchStateContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useFilterPendingDeleteReports from '@hooks/useFilterPendingDeleteReports';
import useOnyx from '@hooks/useOnyx';
import useSearchSections from '@hooks/useSearchSections';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {saveLastSearchParams} from '@userActions/ReportNavigation';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {SearchResults} from '@src/types/onyx';
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

function MoneyRequestReportNavigationContent({reportID, shouldDisplayNarrowVersion, allReports, isSearchLoading, lastSearchQuery}: MoneyRequestReportNavigationContentProps) {
    const type = lastSearchQuery?.queryJSON?.type;
    const currentIndex = allReports.indexOf(reportID);
    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;

    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === allReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    const styles = useThemeStyles();
    const isExpenseReportSearch = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const shouldDisplayNavigationArrows = isExpenseReportSearch && allReports && allReports.length > 1 && currentIndex !== -1 && !!lastSearchQuery?.queryJSON;

    useEffect(() => {
        if (!lastSearchQuery?.queryJSON) {
            return;
        }

        if (lastSearchQuery.allowPostSearchRecount) {
            saveLastSearchParams({
                ...lastSearchQuery,
                allowPostSearchRecount: false,
                previousLengthOfResults: allReports.length,
            });
            return;
        }

        // Update count when reports are added or removed (e.g., created offline)
        if (allReports.length !== allReportsCount) {
            saveLastSearchParams({
                ...lastSearchQuery,
                previousLengthOfResults: allReports.length,
            });
            return;
        }

        if (currentIndex < allReportsCount - 1) {
            return;
        }

        saveLastSearchParams({
            ...lastSearchQuery,
            previousLengthOfResults: allReports.length,
        });
    }, [currentIndex, allReportsCount, allReports.length, lastSearchQuery?.queryJSON, lastSearchQuery]);

    const goToReportId = (reportId?: string) => {
        if (!reportId) {
            return;
        }
        Navigation.setParams({
            reportID: reportId,
        });
    };

    const goToNextReport = () => {
        if (currentIndex === -1 || allReports.length === 0 || !lastSearchQuery?.queryJSON) {
            return;
        }
        const threshold = Math.min(allReports.length * 0.75, allReports.length - 2);

        if (currentIndex + 1 >= threshold && lastSearchQuery?.hasMoreResults) {
            const newOffset = (lastSearchQuery.offset ?? 0) + CONST.SEARCH.RESULTS_PAGE_SIZE;
            search({
                queryJSON: lastSearchQuery.queryJSON,
                offset: newOffset,
                prevReportsLength: allReports.length,
                shouldCalculateTotals: false,
                searchKey: lastSearchQuery.searchKey,
                isLoading: isSearchLoading,
            });
        }

        const nextIndex = (currentIndex + 1) % allReports.length;
        goToReportId(allReports.at(nextIndex));
    };

    const goToPrevReport = () => {
        if (currentIndex === -1 || allReports.length === 0) {
            return;
        }

        const prevIndex = (currentIndex - 1) % allReports.length;
        goToReportId(allReports.at(prevIndex));
    };

    return (
        shouldDisplayNavigationArrows && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                {!shouldDisplayNarrowVersion && <Text style={styles.mutedTextLabel}>{`${currentIndex + 1} of ${allReportsCount}`}</Text>}
                <PrevNextButtons
                    isPrevButtonDisabled={hidePrevButton}
                    isNextButtonDisabled={hideNextButton}
                    onNext={goToNextReport}
                    onPrevious={goToPrevReport}
                />
            </View>
        )
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
    const {sortedReportIDs} = useSearchStateContext();
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const searchLoadingSelector = (data: OnyxEntry<SearchResults>) => !!data?.search?.isLoading;
    const [isSearchLoading = false] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`, {
        selector: searchLoadingSelector,
    });
    const allReports = useFilterPendingDeleteReports(sortedReportIDs);

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
