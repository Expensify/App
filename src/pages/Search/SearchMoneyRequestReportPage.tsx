import {PortalHost} from '@gorhom/portal';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyRequestReportView from '@components/MoneyRequestReportView/MoneyRequestReportView';
import ScreenWrapper from '@components/ScreenWrapper';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {getIOUActionForReportID, getOneTransactionThreadReportID, isDeletedParentAction} from '@libs/ReportActionsUtils';
import {buildTransactionThread, generateReportID, getReportTransactions, isValidReportIDFromPath} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import ReactionListWrapper from '@pages/home/ReactionListWrapper';
import {openReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ActionListContextType, ScrollPosition} from '@src/pages/home/ReportScreenContext';
import {ActionListContext} from '@src/pages/home/ReportScreenContext';
import type SCREENS from '@src/SCREENS';

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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {allowStaleData: true, canBeMissing: true});
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}, canBeMissing: false});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: (value) => value?.email, canBeMissing: false});

    const {reportActions: reportActionsWithDeletedExpenses} = usePaginatedReportActions(reportIDFromRoute);
    const reportActions = reportActionsWithDeletedExpenses.filter((value) => !isDeletedParentAction(value));
    const transactionThreadReportID = getOneTransactionThreadReportID(reportIDFromRoute, reportActions ?? [], isOffline);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});

    const {isEditingDisabled, isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute);

    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});
    const flatListRef = useRef<FlatList>(null);
    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    const reportID = report?.reportID;

    const fetchReport = useCallback(() => {
        if (reportMetadata.isOptimisticReport) {
            return;
        }

        // If there is one transaction thread that has not yet been created, we should create it.
        if (transactionThreadReportID === CONST.FAKE_REPORT_ID && !transactionThreadReport && currentUserEmail) {
            const optimisticTransactionThreadReportID = generateReportID();
            const transactions = getReportTransactions(reportID).filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            const oneTransactionID = transactions.at(0)?.transactionID;
            const iouAction = getIOUActionForReportID(reportID, oneTransactionID);
            const optimisticTransactionThread = buildTransactionThread(iouAction, report, undefined, optimisticTransactionThreadReportID);
            openReport(optimisticTransactionThreadReportID, undefined, [currentUserEmail], optimisticTransactionThread, iouAction?.reportActionID, false, [], undefined, true);
        }

        openReport(reportID, undefined, [], undefined, undefined, false, [], undefined, true);
        // We don't want to call openReport when report is changed
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [reportMetadata.isOptimisticReport, currentUserEmail, reportID, transactionThreadReport, transactionThreadReportID]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

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
                            <MoneyRequestReportView
                                report={report}
                                reportMetadata={reportMetadata}
                                policy={policy}
                                shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx}
                                backToRoute={route.params.backTo}
                            />
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
