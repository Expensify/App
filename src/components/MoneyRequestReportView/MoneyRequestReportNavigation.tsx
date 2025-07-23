import React, {useEffect} from 'react';
import {View} from 'react-native';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {saveLastSearchParams} from '@userActions/ReportNavigation';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyRequestReportNavigationProps = {
    reportID?: string;
    lastSearchQuery?: OnyxTypes.LastSearchParams;
    rawReports?: string[];
    shouldDisplayNarrowVersion: boolean;
    backTo?: string;
};

function MoneyRequestReportNavigation({reportID, lastSearchQuery, rawReports, shouldDisplayNarrowVersion, backTo}: MoneyRequestReportNavigationProps) {
    const allReports = rawReports ?? [];
    const currentIndex = allReports.indexOf(reportID ?? CONST.REPORT.DEFAULT_REPORT_ID);
    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;

    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === allReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    const styles = useThemeStyles();

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
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            {!shouldDisplayNarrowVersion && <Text style={(styles.textSupporting, styles.mnw64p)}>{`${currentIndex + 1} of ${allReportsCount}`}</Text>}
            <PrevNextButtons
                isPrevButtonDisabled={hidePrevButton}
                isNextButtonDisabled={hideNextButton}
                onNext={goToNextReport}
                onPrevious={goToPrevReport}
            />
        </View>
    );
}

MoneyRequestReportNavigation.displayName = 'MoneyRequestReportNavigation';

export default MoneyRequestReportNavigation;
