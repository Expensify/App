import {PortalHost} from '@gorhom/portal';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList} from 'react-native';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyRequestReportView from '@components/MoneyRequestReportView/MoneyRequestReportView';
import ScreenWrapper from '@components/ScreenWrapper';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import {isValidReportIDFromPath} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import ReactionListWrapper from '@pages/home/ReactionListWrapper';
import {openReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ActionListContextType, ScrollPosition} from '@src/pages/home/ReportScreenContext';
import {ActionListContext} from '@src/pages/home/ReportScreenContext';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type SearchMoneyRequestPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT>;

const defaultReportMetadata = {
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
    hasOnceLoadedReportActions: false,
};

function SearchMoneyRequestReportPage({route}: SearchMoneyRequestPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {allowStaleData: true, canBeMissing: true});
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {canBeMissing: true, allowStaleData: true});
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, canBeMissing: false});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});

    const {isEditingDisabled, isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute);

    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});
    const flatListRef = useRef<FlatList>(null);
    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    const reportID = report?.reportID;

    useEffect(() => {
        openReport(reportIDFromRoute, '', [], undefined, undefined, false, [], undefined);
    }, [reportIDFromRoute]);
    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(reportID);
    const transactions = useMemo(() => getAllNonDeletedTransactions(reportTransactions, reportActions), [reportTransactions, reportActions]);
    const newTransactions = useNewTransactions(reportMetadata?.hasOnceLoadedReportActions, transactions);

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
            <ActionListContext.Provider value={actionListValue}>
                <ReactionListWrapper>
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
                        >
                            <DragAndDropProvider isDisabled={isEditingDisabled}>
                                <MoneyRequestReportView
                                    report={report}
                                    reportMetadata={reportMetadata}
                                    policy={policy}
                                    reportActions={reportActions}
                                    transactions={transactions}
                                    newTransactions={newTransactions}
                                    hasNewerActions={hasNewerActions}
                                    hasOlderActions={hasOlderActions}
                                    shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx}
                                    backToRoute={route.params.backTo}
                                />
                            </DragAndDropProvider>
                        </FullPageNotFoundView>
                    </ScreenWrapper>
                </ReactionListWrapper>
            </ActionListContext.Provider>
        );
    }

    return (
        <ActionListContext.Provider value={actionListValue}>
            <ReactionListWrapper>
                <ScreenWrapper
                    testID={SearchMoneyRequestReportPage.displayName}
                    shouldEnableMaxHeight
                    offlineIndicatorStyle={styles.mtAuto}
                    headerGapStyles={[styles.searchHeaderGap, styles.h0]}
                >
                    <View style={[styles.searchSplitContainer, styles.flexColumn, styles.flex1]}>
                        <FullPageNotFoundView
                            shouldShow={shouldShowNotFoundPage}
                            subtitleKey="notFound.noAccess"
                            subtitleStyle={[styles.textSupporting]}
                            shouldDisplaySearchRouter
                            shouldShowBackButton={shouldUseNarrowLayout}
                            onBackButtonPress={Navigation.goBack}
                        >
                            <DragAndDropProvider isDisabled={isEditingDisabled}>
                                <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                                    <MoneyRequestReportView
                                        report={report}
                                        reportMetadata={reportMetadata}
                                        policy={policy}
                                        reportActions={reportActions}
                                        transactions={transactions}
                                        newTransactions={newTransactions}
                                        hasNewerActions={hasNewerActions}
                                        hasOlderActions={hasOlderActions}
                                        shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx}
                                        backToRoute={route.params.backTo}
                                    />
                                </View>
                                <PortalHost name="suggestions" />
                            </DragAndDropProvider>
                        </FullPageNotFoundView>
                    </View>
                </ScreenWrapper>
            </ReactionListWrapper>
        </ActionListContext.Provider>
    );
}

SearchMoneyRequestReportPage.displayName = 'SearchMoneyRequestReportPage';

export default SearchMoneyRequestReportPage;
