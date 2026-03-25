import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {saveLastSearchParams} from '@userActions/ReportNavigation';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type MoneyRequestReportNavigationProps = {
    reportID?: string;
    shouldDisplayNarrowVersion: boolean;
};

function MoneyRequestReportNavigation({reportID, shouldDisplayNarrowVersion}: MoneyRequestReportNavigationProps) {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [sortedReportIDs = []] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_SORTED_REPORT_IDS);
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`);

    const type = lastSearchQuery?.queryJSON?.type;
    const currentIndex = sortedReportIDs.indexOf(reportID);
    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;

    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === sortedReportIDs.length - 1;
    const hidePrevButton = currentIndex === 0;
    const styles = useThemeStyles();
    const isExpenseReportSearch = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const shouldDisplayNavigationArrows = isExpenseReportSearch && sortedReportIDs && sortedReportIDs.length > 1 && currentIndex !== -1 && !!lastSearchQuery?.queryJSON;

    useEffect(() => {
        if (!lastSearchQuery?.queryJSON) {
            return;
        }

        if (lastSearchQuery.allowPostSearchRecount) {
            saveLastSearchParams({
                ...lastSearchQuery,
                allowPostSearchRecount: false,
                previousLengthOfResults: sortedReportIDs.length,
            });
            return;
        }

        // Update count when reports are added or removed (e.g., created offline)
        if (sortedReportIDs.length !== allReportsCount) {
            saveLastSearchParams({
                ...lastSearchQuery,
                previousLengthOfResults: sortedReportIDs.length,
            });
            return;
        }

        if (currentIndex < allReportsCount - 1) {
            return;
        }

        saveLastSearchParams({
            ...lastSearchQuery,
            previousLengthOfResults: sortedReportIDs.length,
        });
    }, [currentIndex, allReportsCount, sortedReportIDs.length, lastSearchQuery?.queryJSON, lastSearchQuery]);

    const goToReportId = (reportId?: string) => {
        if (!reportId) {
            return;
        }
        Navigation.setParams({
            reportID: reportId,
        });
    };

    const goToNextReport = () => {
        if (currentIndex === -1 || sortedReportIDs.length === 0 || !lastSearchQuery?.queryJSON) {
            return;
        }
        const threshold = Math.min(sortedReportIDs.length * 0.75, sortedReportIDs.length - 2);

        if (currentIndex + 1 >= threshold && lastSearchQuery?.hasMoreResults) {
            const newOffset = (lastSearchQuery.offset ?? 0) + CONST.SEARCH.RESULTS_PAGE_SIZE;
            search({
                queryJSON: lastSearchQuery.queryJSON,
                offset: newOffset,
                prevReportsLength: sortedReportIDs.length,
                sortedReportIDs,
                shouldCalculateTotals: false,
                searchKey: lastSearchQuery.searchKey,
                isLoading: !!currentSearchResults?.search?.isLoading,
            });
        }

        const nextIndex = (currentIndex + 1) % sortedReportIDs.length;
        goToReportId(sortedReportIDs.at(nextIndex));
    };

    const goToPrevReport = () => {
        if (currentIndex === -1 || sortedReportIDs.length === 0) {
            return;
        }

        const prevIndex = (currentIndex - 1) % sortedReportIDs.length;
        goToReportId(sortedReportIDs.at(prevIndex));
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

export default MoneyRequestReportNavigation;
