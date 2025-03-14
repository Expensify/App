import {PortalHost} from '@gorhom/portal';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderGap from '@components/HeaderGap';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestReportView from '@components/MoneyRequestReportView/MoneyRequestReportView';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import ReportFooter from '@pages/home/report/ReportFooter';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import SearchTypeMenu from './SearchTypeMenu';

// We will figure out later, when this view is actually being finalized, how to pass down an actual query
const tempJSONQuery = buildSearchQueryJSON('') as unknown as SearchQueryJSON;

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT>;

const defaultReportMetadata = {
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

function SearchMoneyRequestReportPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const {reportID} = route.params;

    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, {initialValue: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {allowStaleData: true});
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];

    const [isComposerFocus, setIsComposerFocus] = useState(false);

    /**
     * When false the ReportActionsView will completely unmount and we will show a loader until it returns true.
     */
    const isCurrentReportLoadedFromOnyx = useMemo((): boolean => {
        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = report && report?.reportID !== reportID;
        return reportID !== '' && !!report?.reportID && !isTransitioning;
    }, [report, reportID]);

    const onComposerFocus = useCallback(() => setIsComposerFocus(true), []);
    const onComposerBlur = useCallback(() => setIsComposerFocus(false), []);

    if (shouldUseNarrowLayout) {
        return (
            <ScreenWrapper
                testID={SearchMoneyRequestReportPage.displayName}
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                headerGapStyles={styles.searchHeaderGap}
            >
                <MoneyReportHeader
                    report={report}
                    policy={policy}
                    reportActions={[]}
                    transactionThreadReportID={undefined}
                    onBackButtonPress={() => {
                        Navigation.goBack();
                    }}
                />
                <MoneyRequestReportView report={report} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={SearchMoneyRequestReportPage.displayName}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            headerGapStyles={styles.searchHeaderGap}
        >
            <View style={styles.searchSplitContainer}>
                <View style={styles.searchSidebar}>
                    <View style={styles.flex1}>
                        <HeaderGap />
                        <TopBar
                            breadcrumbLabel={translate('common.reports')}
                            shouldDisplaySearch={false}
                        />
                        <SearchTypeMenu queryJSON={tempJSONQuery} />
                    </View>
                    <BottomTabBar selectedTab={BOTTOM_TABS.SEARCH} />
                </View>
                <View style={[styles.flexColumn, styles.flex1]}>
                    <DragAndDropProvider isDisabled={!isCurrentReportLoadedFromOnyx || !canUserPerformWriteAction(report)}>
                        <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                            <HeaderGap />
                            <MoneyReportHeader
                                report={report}
                                policy={policy}
                                reportActions={[]}
                                transactionThreadReportID={undefined}
                                onBackButtonPress={() => {
                                    Navigation.goBack();
                                }}
                            />
                            <MoneyRequestReportView report={report} />
                            {isCurrentReportLoadedFromOnyx ? (
                                <ReportFooter
                                    onComposerFocus={onComposerFocus}
                                    onComposerBlur={onComposerBlur}
                                    report={report}
                                    reportMetadata={reportMetadata}
                                    policy={policy}
                                    // pendingAction={reportPendingAction}
                                    isComposerFullSize={!!isComposerFullSize}
                                    // lastReportAction={lastReportAction}
                                />
                            ) : null}
                        </View>
                        <PortalHost name="suggestions" />
                    </DragAndDropProvider>
                </View>
            </View>
        </ScreenWrapper>
    );
}

SearchMoneyRequestReportPage.displayName = 'SearchMoneyRequestReportPage';

export default SearchMoneyRequestReportPage;
