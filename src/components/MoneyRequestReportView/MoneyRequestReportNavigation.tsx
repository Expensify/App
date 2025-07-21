import {findFocusedRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import UseOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import {saveLastSearchParams, setActiveReportIDs} from '@userActions/ReportNavigation';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyRequestReportRHPNavigationButtonsProps = {
    reportID: string;
    lastSearchQuery?: OnyxTypes.LastSearchParams;
    rawReports?: string[];
    shouldDisplayNarrowVersion: boolean;
};

function MoneyRequestReportNavigation({reportID, lastSearchQuery, rawReports, shouldDisplayNarrowVersion}: MoneyRequestReportRHPNavigationButtonsProps) {
    //
    const allReports = rawReports ?? [];
    const currentIndex = allReports.indexOf(reportID ?? '');
    //
    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;

    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === allReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    //
    const styles = useThemeStyles();
    //
    const goToReportId = (reportId?: string) => {
        if (!reportId) {
            return;
        }
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());

        Navigation.navigate(
            ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({
                reportID: reportId,
                backTo: focusedRoute?.params?.backTo,
            }),
            {forceReplace: true},
        );
    };
    //
    const goToNextReport = () => {
        if (currentIndex === -1 || allReports.length === 0) {
            return '';
        }

        if (currentIndex > allReportsCount * 0.75 && lastSearchQuery?.hasMoreResults) {
            search({
                queryJSON: {...lastSearchQuery.queryJSON, filters: null},
                offset: lastSearchQuery.offset + CONST.SEARCH.RESULTS_PAGE_SIZE,
            }).then((results) => {
                const data = results?.onyxData?.[0]?.value?.data;
                if (data) {
                    const reportNumbers = Object.keys(data)
                        .filter((key) => key.startsWith('report_'))
                        .map((key) => key.replace('report_', ''));
                    setActiveReportIDs([...allReports, ...reportNumbers]);
                }
                saveLastSearchParams({
                    queryJSON: {...lastSearchQuery.queryJSON, filters: null},
                    offset: lastSearchQuery.offset + CONST.SEARCH.RESULTS_PAGE_SIZE,
                    hasMoreResults: !!results?.onyxData?.[0]?.value?.search?.hasMoreResults,
                    previousLengthOfResults: allReportsCount < allReports.length && currentIndex === allReports.length ? allReports.length : allReportsCount,
                });
                console.log(lastSearchQuery.offset + CONST.SEARCH.RESULTS_PAGE_SIZE);
            });
        }
        if (currentIndex === allReportsCount - 1) {
            debugger;
            saveLastSearchParams({
                ...lastSearchQuery,
                previousLengthOfResults: allReports.length,
            });
        }
        const nextIndex = (currentIndex + 1) % allReports.length;
        goToReportId(allReports.at(nextIndex));
    };
    //

    const goToPrevReport = () => {
        if (currentIndex === -1 || allReports.length === 0) {
            return '';
        }
        const nextIndex = (currentIndex - 1) % allReports.length;
        goToReportId(allReports.at(nextIndex));
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
