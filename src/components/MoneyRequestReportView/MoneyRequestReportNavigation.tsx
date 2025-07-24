import React, {useEffect} from 'react';
import {View} from 'react-native';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {saveLastSearchParams} from '@userActions/ReportNavigation';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type MoneyRequestReportNavigationProps = {
    reportID?: string;
    shouldDisplayNarrowVersion: boolean;
    backTo?: string;
};

function MoneyRequestReportNavigation({reportID, shouldDisplayNarrowVersion, backTo}: MoneyRequestReportNavigationProps) {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {canBeMissing: true});
    const [reportsObj] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, {canBeMissing: true});
    const rawReports = Object.keys(reportsObj ?? {});

    const allReports = rawReports ?? [];
    const currentIndex = allReports.indexOf(reportID ?? CONST.REPORT.DEFAULT_REPORT_ID);
    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;

    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === allReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    const styles = useThemeStyles();
    const shouldDisplayNavigationArrows = rawReports && rawReports.length > 0;

    useEffect(() => {
        if (currentIndex < allReportsCount - 1 || !lastSearchQuery?.queryJSON) {
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

        Navigation.navigate(
            ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({
                reportID: reportId,
                backTo: backTo ?? '',
            }),
            {forceReplace: true},
        );
    };

    const goToNextReport = () => {
        if (currentIndex === -1 || allReports.length === 0) {
            return '';
        }

        if (currentIndex > allReportsCount * 0.75 && lastSearchQuery?.hasMoreResults) {
            const newOffset = (lastSearchQuery.offset ?? 0) + CONST.SEARCH.RESULTS_PAGE_SIZE;
            search({
                queryJSON: lastSearchQuery.queryJSON,
                offset: newOffset,
                prevReports: allReports,
            });
        }

        const nextIndex = (currentIndex + 1) % allReports.length;
        goToReportId(allReports.at(nextIndex));
    };

    const goToPrevReport = () => {
        if (currentIndex === -1 || allReports.length === 0) {
            return '';
        }

        const prevIndex = (currentIndex - 1) % allReports.length;
        goToReportId(allReports.at(prevIndex));
    };

    return (
        shouldDisplayNavigationArrows && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                {!shouldDisplayNarrowVersion && <Text style={(styles.textSupporting, styles.mnw64p)}>{`${currentIndex + 1} of ${allReportsCount}`}</Text>}
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

MoneyRequestReportNavigation.displayName = 'MoneyRequestReportNavigation';

export default MoneyRequestReportNavigation;
