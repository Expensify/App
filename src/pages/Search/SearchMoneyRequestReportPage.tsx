import {PortalHost} from '@gorhom/portal';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderGap from '@components/HeaderGap';
import MoneyRequestReportView from '@components/MoneyRequestReportView/MoneyRequestReportView';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {isValidReportIDFromPath} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {openReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import {ActionListContext, ReactionListContext} from '@src/pages/home/ReportScreenContext';
import type {ActionListContextType, ReactionListRef, ScrollPosition} from '@src/pages/home/ReportScreenContext';
import type SCREENS from '@src/SCREENS';
import SearchTypeMenu from './SearchTypeMenu';

type SearchMoneyRequestPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT>;

const defaultReportMetadata = {
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

function SearchMoneyRequestReportPage({route}: SearchMoneyRequestPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {allowStaleData: true});
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const {isEditingDisabled, isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute);

    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});
    const flatListRef = useRef<FlatList>(null);
    const reactionListRef = useRef<ReactionListRef>(null);
    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    const reportID = report?.reportID;

    useEffect(() => {
        openReport(reportIDFromRoute, '', [], undefined, undefined, false, [], undefined, true);
    }, [reportIDFromRoute]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(
        (): boolean => {
            if (isLoadingApp !== false) {
                return false;
            }

            // eslint-disable-next-line react-compiler/react-compiler
            if (!reportID && !reportMetadata?.isLoadingInitialReportActions) {
                // eslint-disable-next-line react-compiler/react-compiler
                return true;
            }

            return !!reportID && !isValidReportIDFromPath(reportID);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [reportID, reportMetadata?.isLoadingInitialReportActions],
    );

    if (shouldUseNarrowLayout) {
        return (
            <ScreenWrapper
                testID={SearchMoneyRequestReportPage.displayName}
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                headerGapStyles={styles.searchHeaderGap}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundPage}
                    subtitleKey="notFound.noAccess"
                    subtitleStyle={[styles.textSupporting]}
                    shouldDisplaySearchRouter
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                    linkKey="notFound.noAccess"
                >
                    <MoneyRequestReportView
                        report={report}
                        reportMetadata={reportMetadata}
                        policy={policy}
                        shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx}
                        backToRoute={route.params.backTo}
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }

    return (
        <ActionListContext.Provider value={actionListValue}>
            <ReactionListContext.Provider value={reactionListRef}>
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
                                <SearchTypeMenu queryJSON={undefined} />
                            </View>
                            <BottomTabBar selectedTab={BOTTOM_TABS.SEARCH} />
                        </View>
                        <View style={[styles.flexColumn, styles.flex1]}>
                            <FullPageNotFoundView
                                shouldShow={shouldShowNotFoundPage}
                                subtitleKey="notFound.noAccess"
                                subtitleStyle={[styles.textSupporting]}
                                shouldDisplaySearchRouter
                                shouldShowBackButton={shouldUseNarrowLayout}
                                onBackButtonPress={Navigation.goBack}
                                linkKey="notFound.noAccess"
                            >
                                <DragAndDropProvider isDisabled={isEditingDisabled}>
                                    <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                                        <MoneyRequestReportView
                                            report={report}
                                            reportMetadata={reportMetadata}
                                            policy={policy}
                                            shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx}
                                            backToRoute={route.params.backTo}
                                        />
                                    </View>
                                    <PortalHost name="suggestions" />
                                </DragAndDropProvider>
                            </FullPageNotFoundView>
                        </View>
                    </View>
                </ScreenWrapper>
            </ReactionListContext.Provider>
        </ActionListContext.Provider>
    );
}

SearchMoneyRequestReportPage.displayName = 'SearchMoneyRequestReportPage';

export default SearchMoneyRequestReportPage;
