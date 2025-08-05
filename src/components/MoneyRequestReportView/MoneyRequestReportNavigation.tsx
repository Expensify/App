import React, {useEffect} from 'react';
import {View} from 'react-native';
import PrevNextButtons from '@components/PrevNextButtons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isExportIntegrationAction, isIntegrationMessageAction} from '@libs/ReportActionsUtils';
import {isArchivedReport} from '@libs/ReportUtils';
import {getSections, getSortedSections} from '@libs/SearchUIUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import Navigation from '@navigation/Navigation';
import saveLastSearchParams from '@userActions/ReportNavigation';
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
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`, {canBeMissing: true});
    const {localeCompare} = useLocalize();

    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canEvict: false,
        canBeMissing: true,
        selector: (allReportActions) => {
            return Object.fromEntries(
                Object.entries(allReportActions ?? {}).map(([reporTID, reportActionsGroup]) => {
                    const filteredReportActions = Object.values(reportActionsGroup ?? {}).filter((action) => isExportIntegrationAction(action) || isIntegrationMessageAction(action));
                    return [reporTID, filteredReportActions];
                }),
            );
        },
    });
    const [archivedReportsIdSet = new Set<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: (all): ArchivedReportsIDSet => {
            const ids = new Set<string>();
            if (!all) {
                return ids;
            }

            const prefixLength = ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS.length;
            for (const [key, value] of Object.entries(all)) {
                if (isArchivedReport(value)) {
                    const reporTID = key.slice(prefixLength);
                    ids.add(reporTID);
                }
            }
            return ids;
        },
    });

    const {type, status, sortBy, sortOrder, groupBy} = lastSearchQuery?.queryJSON ?? {};
    let results: string[] = [];
    if (!!type && !!groupBy && !!currentSearchResults?.data && !!currentSearchResults?.search) {
        const temp = getSections(type, currentSearchResults.data, currentSearchResults.search, groupBy, exportReportActions, lastSearchQuery?.searchKey, archivedReportsIdSet);
        results = getSortedSections(type, status ?? '', temp, localeCompare, sortBy, sortOrder, groupBy).map((value) => value.reportID);
    }
    const allReports = results;

    const currentIndex = allReports.indexOf(reportID ?? CONST.REPORT.DEFAULT_REPORT_ID);
    const allReportsCount = lastSearchQuery?.previousLengthOfResults ?? 0;

    const hideNextButton = !lastSearchQuery?.hasMoreResults && currentIndex === allReports.length - 1;
    const hidePrevButton = currentIndex === 0;
    const styles = useThemeStyles();
    const shouldDisplayNavigationArrows = allReports && allReports.length > 0;

    useEffect(() => {
        if (!lastSearchQuery?.queryJSON) {
            return;
        }

        if (currentIndex < allReportsCount - 1 && allReports.length >= (lastSearchQuery?.previousLengthOfResults ?? 0)) {
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
                shouldCalculateTotals: false,
                searchKey: lastSearchQuery.searchKey,
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
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                {!shouldDisplayNarrowVersion && <Text style={styles.textSupporting}>{`${currentIndex + 1} of ${allReportsCount}`}</Text>}
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
