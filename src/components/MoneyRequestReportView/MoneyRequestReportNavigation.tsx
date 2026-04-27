import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import useSearchSections from '@hooks/useSearchSections';
import useThemeStyles from '@hooks/useThemeStyles';
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

type SnapshotGuard = {
    hasMultiple: boolean;
    includesReport: boolean;
};

const EMPTY_GUARD: SnapshotGuard = {hasMultiple: false, includesReport: false};

const selectIsExpenseReportSearch = (lastSearchQuery: OnyxEntry<LastSearchParams>): boolean => lastSearchQuery?.queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

const selectQueryHash = (lastSearchQuery: OnyxEntry<LastSearchParams>): number | undefined => lastSearchQuery?.queryJSON?.hash;

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

function MoneyRequestReportNavigationInner({reportID, shouldDisplayNarrowVersion}: MoneyRequestReportNavigationProps) {
    const {allReports, isSearchLoading, lastSearchQuery} = useSearchSections();
    const styles = useThemeStyles();

    const currentIndex = allReports.indexOf(reportID);
    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;
    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === allReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    const shouldDisplayNavigationArrows = allReports.length > 1 && currentIndex !== -1 && !!lastSearchQuery?.queryJSON;

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

    if (!shouldDisplayNavigationArrows) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            {!shouldDisplayNarrowVersion && <Text style={styles.mutedTextLabel}>{`${currentIndex + 1} of ${allReportsCount}`}</Text>}
            <PrevNextButtons
                isPrevButtonDisabled={hidePrevButton}
                isNextButtonDisabled={hideNextButton}
                onNext={goToNextReport}
                onPrevious={goToPrevReport}
            />
        </View>
    );
}

function MoneyRequestReportNavigation({reportID, shouldDisplayNarrowVersion}: MoneyRequestReportNavigationProps) {
    const [isExpenseReportSearch] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {selector: selectIsExpenseReportSearch});
    const [hash] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {selector: selectQueryHash});
    const snapshotGuardSelector = buildSnapshotGuardSelector(reportID);
    const [snapshotGuard = EMPTY_GUARD] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {selector: snapshotGuardSelector});

    const shouldMount = isExpenseReportSearch && snapshotGuard.hasMultiple && snapshotGuard.includesReport;

    if (!shouldMount) {
        return null;
    }

    return (
        <MoneyRequestReportNavigationInner
            reportID={reportID}
            shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
        />
    );
}

export default MoneyRequestReportNavigation;
