import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import REPORT_LINK_ROUTE_PARAMS from '@libs/Navigation/reportLinkRouteParams';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {getFilteredReportActionsForReportView, getLatestConciergeFeedbackActionID, getOneTransactionThreadReportID, hasNextActionMadeBySameActor} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction,
    chatIncludesChronosWithID,
    getReportLastVisibleActionCreated,
    isHarvestCreatedExpenseReport,
    shouldReportAlignToTop,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';
import {useActionListRef} from '@pages/inbox/ActionListContext';
import {useConciergeDraft} from '@pages/inbox/ConciergeDraftContext';
import CollapsedSystemMessages from '@pages/inbox/report/CollapsedSystemMessages';
import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';
import {ReportActionPositionContextProvider, ReportActionScrollToNewestContext} from '@pages/inbox/report/ReportActionIndexContext';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';
import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import {pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent} from 'react-native';

import {useIsFocused, useRoute} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import MoneyRequestReportEmptyStateView from './MoneyRequestReportEmptyStateView';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';
import SelectionToolbar from './SelectionToolbar';
import useMoneyRequestReportPagination from './useMoneyRequestReportPagination';
import useMoneyRequestReportScroll from './useMoneyRequestReportScroll';
import useMoneyRequestReportVisibleActions from './useMoneyRequestReportVisibleActions';

/**
 * In this view we are not handling the special single transaction case, we're just handling the report
 */
const EmptyParentReportActionForTransactionThread = undefined;

type MoneyRequestReportListProps = {
    onLayout?: (event: LayoutChangeEvent) => void;
};

type MoneyRequestReportActionsListContentProps = MoneyRequestReportListProps & {
    /** The reportID from the route, keying the content per report */
    reportIDFromRoute: string | undefined;
};

/**
 * Renders the money-request report's unified list (transactions table + report actions). Composes the
 * view's data/behavior hooks (`useMoneyRequestReportVisibleActions` / `useMoneyRequestReportPagination` /
 * `useMoneyRequestReportScroll`) with the hooks shared with the chat list (`useUnreadMarker` / `useMarkAsRead`).
 * Mounted with `key={reportID}` by the wrapper below, so all hook state resets on report switch.
 */
function MoneyRequestReportActionsListContent({reportIDFromRoute, onLayout}: MoneyRequestReportActionsListContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    // The table is visible whenever it's wide, or — on narrow — only when focused (the RHP has closed).
    const isReportVisible = shouldUseNarrowLayout ? isFocused : true;
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const linkedReportActionID = route?.params?.reportActionID;
    const isReportLoadPending = useIsReportLoadPending(reportIDFromRoute);

    // Self-subscribe to report, policy, metadata, actions, transactions
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {selector: getStableReportSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportIDFromRoute}`);
    const [reportPaginationState] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${reportIDFromRoute}`);
    const reportID = report?.reportID;

    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, linkedReportActionID);
    const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);
    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const draftReportActionID = draftReportAction?.reportActionID;

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = useMemo(() => getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true), [allReportTransactions, reportActions, isOffline]);
    const transactions = useMemo(
        () => reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) ?? [],
        [reportTransactions, isOffline],
    );
    const hasPendingDeletionTransaction = useMemo(
        () => Object.values(allReportTransactions ?? {}).some((transaction) => transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        [allReportTransactions],
    );
    const [pendingNewTransactionIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: pendingNewTransactionIDsSelector,
    });
    const newTransactions = useNewTransactions(reportLoadingState?.hasOnceLoadedReportActions, reportTransactions, pendingNewTransactionIDs, reportIDFromRoute, isFocused);
    const showReportActionsLoadingState = reportLoadingState?.isLoadingInitialReportActions && !reportLoadingState?.hasOnceLoadedReportActions;
    const isInitialReportLoadPending = !isOffline && isReportLoadPending && !reportLoadingState?.hasOnceLoadedReportActions;
    const reportTransactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

    // Set when the report is opened from an "X Replies" link, which should land on the latest message
    const shouldScrollToLatestOnOpen = route?.params?.[REPORT_LINK_ROUTE_PARAMS.SHOULD_SCROLL_TO_LATEST] === 'true';
    const scrolledToLatestOnOpenForReportIDRef = useRef<string | undefined>(undefined);

    const parentReportAction = useParentReportAction(report);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], false, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`);
    const shouldShowHarvestCreatedAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);

    const {visibleReportActions, visibleReportActionsNewestFirst, lastAction, firstVisibleReportActionID} = useMoneyRequestReportVisibleActions({
        reportID,
        reportActions,
        reportTransactionIDs,
        canPerformWriteAction: !!canPerformWriteAction,
        shouldShowHarvestCreatedAction,
        isOffline,
    });

    const listRef = useActionListRef();
    const didLayout = useRef(false);

    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated;

    const reportActionIDs = useMemo(() => {
        return reportActions?.map((action) => action.reportActionID) ?? [];
    }, [reportActions]);

    const conciergeFeedbackForReportActionID = reportNameValuePairs?.conciergeFeedbackForReportActionID;

    // Skip inside the thread the backend opens after a thumbs down, while a Concierge answer is still streaming, and while newer actions are not loaded because the newest reply may not be in the list yet
    const latestConciergeFeedbackActionID = useMemo(
        () =>
            conciergeFeedbackForReportActionID || isDraftPendingCompletion || hasNewerActions
                ? undefined
                : getLatestConciergeFeedbackActionID(visibleReportActionsNewestFirst, reportActionIDs),
        [conciergeFeedbackForReportActionID, isDraftPendingCompletion, hasNewerActions, visibleReportActionsNewestFirst, reportActionIDs],
    );

    const {onStartReached, onEndReached} = useMoneyRequestReportPagination({
        reportID,
        reportActions,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        isOffline,
        reportPaginationState,
        reportLoadingState,
    });

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(false);

    const {unreadMarkerReportActionID} = useUnreadMarker({
        reportID: reportID ?? reportIDFromRoute ?? '',
        sortedVisibleReportActions: visibleReportActions,
        isReversed: true,
        sortedReportActions: reportActions,
        oldestUnreadReportActionID: undefined,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!reportLoadingState?.hasOnceLoadedReportActions,
    });

    const {displayReportActions, runsByAnchorReportActionID, expandedSystemMessageReportActionIDs, unreadMarkerReportActionIndex, expandSystemMessageRun} = useReportActionsPresentation({
        visibleReportActions,
        linkedReportActionID,
        unreadMarkerReportActionID,
    });
    const canonicalIndexByReportActionID = useMemo(() => new Map(visibleReportActions.map((action, index) => [action.reportActionID, index])), [visibleReportActions]);

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID: reportID ?? reportIDFromRoute ?? '',
        report,
        transactionThreadReport,
        sortedVisibleReportActions: visibleReportActionsNewestFirst,
        sortedReportActions: reportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
        scopeKey: 'moneyRequestReport',
        shouldRequireScreenFocus: true,
    });

    const {
        isFloatingMessageCounterVisible,
        trackVerticalScrolling,
        onViewableItemsChanged,
        scrollToLatestMessages,
        onListContentSizeChange,
        onListScrollBeginDrag,
        updateLastItemIndex,
        scrollToBottom,
        onListLayout: syncBottomOffsetFromLayout,
    } = useMoneyRequestReportScroll({
        reportID,
        shouldBeAlignedToTop: shouldReportAlignToTop(report, parentReportAction),
        resetKey: reportID ?? reportIDFromRoute ?? '',
        visibleReportActions,
        reportActionsLength: reportActions.length,
        lastAction,
        hasNewestReportAction,
        hasNewerActions,
        unreadMarkerReportActionIndex,
        onScrolledOverThresholdChange: setHasScrolledOverThreshold,
        markNewestActionAsRead,
        completeSkippedMarkAsRead,
    });

    // Wait for the actions to arrive before jumping, and clear the route param afterwards so a later remount
    // doesn't yank the user back down.
    useEffect(() => {
        if (!shouldScrollToLatestOnOpen || scrolledToLatestOnOpenForReportIDRef.current === reportIDFromRoute || visibleReportActions.length === 0) {
            return;
        }
        scrolledToLatestOnOpenForReportIDRef.current = reportIDFromRoute;
        scrollToLatestMessages();
        Navigation.setParams({[REPORT_LINK_ROUTE_PARAMS.SHOULD_SCROLL_TO_LATEST]: undefined});
    }, [shouldScrollToLatestOnOpen, visibleReportActions.length, scrollToLatestMessages, reportIDFromRoute]);

    const renderReportAction = useCallback(
        (reportAction: OnyxTypes.ReportAction, indexWithinReportActions: number) => {
            const canonicalIndex = canonicalIndexByReportActionID.get(reportAction.reportActionID) ?? indexWithinReportActions;
            const systemMessageRun = runsByAnchorReportActionID.get(reportAction.reportActionID);
            const previousReportAction = indexWithinReportActions > 0 ? displayReportActions.at(indexWithinReportActions - 1) : undefined;
            const previousRun = previousReportAction ? runsByAnchorReportActionID.get(previousReportAction.reportActionID) : undefined;
            const isAfterCollapsedRun = indexWithinReportActions > 0 && !!previousRun && !previousRun.isExpanded;
            const displayAsGroup =
                !isAfterCollapsedRun &&
                !isConsecutiveChronosAutomaticTimerAction(visibleReportActions, canonicalIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                hasNextActionMadeBySameActor(visibleReportActions, canonicalIndex, isOffline);
            const shouldDisableContextMenuForConciergeDraft = isDraftPendingCompletion && draftReportActionID === reportAction.reportActionID;
            const isNewestReportAction = indexWithinReportActions === displayReportActions.length - 1;

            return (
                <ReportActionScrollToNewestContext.Provider value={scrollToBottom}>
                    <ReportActionPositionContextProvider
                        index={indexWithinReportActions}
                        isNewest={isNewestReportAction}
                    >
                        {systemMessageRun && !systemMessageRun.isExpanded ? (
                            <CollapsedSystemMessages
                                count={systemMessageRun.reportActionIDs.length}
                                earliestReportAction={systemMessageRun.earliestReportAction}
                                report={reportStable}
                                onPress={() => expandSystemMessageRun(systemMessageRun.reportActionIDs)}
                                unreadMarkerReportActionID={
                                    unreadMarkerReportActionID && systemMessageRun.reportActionIDs.includes(unreadMarkerReportActionID) ? unreadMarkerReportActionID : undefined
                                }
                            />
                        ) : (
                            <ReportActionsListItemRenderer
                                reportAction={reportAction}
                                parentReportAction={parentReportAction}
                                parentReportActionForTransactionThread={EmptyParentReportActionForTransactionThread}
                                report={reportStable}
                                transactionThreadReport={transactionThreadReport}
                                chatReport={chatReport}
                                displayAsGroup={displayAsGroup}
                                shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                                shouldDisplayReplyDivider={visibleReportActions.length > 1}
                                isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                                shouldHideThreadDividerLine
                                linkedReportActionID={linkedReportActionID}
                                isHarvestCreatedExpenseReport={shouldShowHarvestCreatedAction}
                                shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
                                isLatestConciergeFeedbackAction={!!latestConciergeFeedbackActionID && latestConciergeFeedbackActionID === reportAction.reportActionID}
                            />
                        )}
                    </ReportActionPositionContextProvider>
                </ReportActionScrollToNewestContext.Provider>
            );
        },
        [
            visibleReportActions,
            displayReportActions,
            canonicalIndexByReportActionID,
            runsByAnchorReportActionID,
            expandSystemMessageRun,
            parentReportAction,
            reportStable,
            chatReport,
            isOffline,
            transactionThreadReport,
            unreadMarkerReportActionID,
            firstVisibleReportActionID,
            linkedReportActionID,
            shouldShowHarvestCreatedAction,
            draftReportActionID,
            isDraftPendingCompletion,
            latestConciergeFeedbackActionID,
            scrollToBottom,
        ],
    );

    const reportActionsExtraData = useMemo(
        () => [draftReportActionID, isDraftPendingCompletion, latestConciergeFeedbackActionID, expandedSystemMessageReportActionIDs, unreadMarkerReportActionID],
        [draftReportActionID, isDraftPendingCompletion, latestConciergeFeedbackActionID, expandedSystemMessageReportActionIDs, unreadMarkerReportActionID],
    );

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = useCallback(() => {
        if (didLayout.current || !reportIDFromRoute) {
            return;
        }

        didLayout.current = true;

        markOpenReportEnd(reportIDFromRoute, report, {warm: true});
    }, [reportIDFromRoute, report]);

    const onListLayout = (event: LayoutChangeEvent) => {
        syncBottomOffsetFromLayout(event);
        recordTimeToMeasureItemLayout();
    };

    const isReportEmpty = isEmpty(visibleReportActions) && isEmpty(transactions) && !isInitialReportLoadPending;
    const showEmptyState = isReportEmpty;

    if (!report) {
        return null;
    }

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
        rules,
    });

    return (
        <View style={[styles.flex1]}>
            <SelectionToolbar
                reportID={report.reportID}
                transactions={transactions}
                reportActions={reportActions}
            />
            <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                <FloatingMessageCounter
                    hasNewMessages={!!unreadMarkerReportActionID}
                    isActive={isFloatingMessageCounterVisible}
                    onClick={scrollToLatestMessages}
                    shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
                />
                {/* Exactly one of these two branches is active at a time:
                    1. showEmptyState — genuinely empty report
                    2. !isReportEmpty — report has data, render the FlashList */}
                {showEmptyState && (
                    <MoneyRequestReportEmptyStateView
                        report={report}
                        policy={policy}
                        onLayout={onLayout}
                    />
                )}
                {!isReportEmpty && !!reportStable && (
                    <MoneyRequestReportTransactionList
                        report={reportStable}
                        onLayout={onLayout}
                        transactions={transactions}
                        newTransactions={newTransactions}
                        isReportVisible={isReportVisible}
                        hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                        reportActions={reportActions}
                        policy={policy}
                        hasComments={visibleReportActions.length > 0}
                        isLoadingInitialReportActions={showReportActionsLoadingState}
                        visibleReportActions={displayReportActions}
                        renderReportAction={renderReportAction}
                        reportActionsExtraData={reportActionsExtraData}
                        linkedReportActionID={linkedReportActionID}
                        listRef={listRef}
                        onLastItemIndexChange={updateLastItemIndex}
                        accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                        onListLayout={onListLayout}
                        onScroll={trackVerticalScrolling}
                        onScrollBeginDrag={onListScrollBeginDrag}
                        onContentSizeChange={onListContentSizeChange}
                        onViewableItemsChanged={onViewableItemsChanged}
                        onEndReached={onEndReached}
                        onStartReached={onStartReached}
                        contentContainerStyle={shouldUseNarrowLayout ? styles.pt4 : styles.pt3}
                        isLoadingInitialActions={isInitialReportLoadPending}
                        /* This list is not inverted, so the footer is the bottom of the message feed —
                           the same position the indicator occupies in the inverted ReportActionsList. */
                        listFooterComponent={<ConciergeThinkingMessage reportID={report.reportID} />}
                    />
                )}
            </View>
        </View>
    );
}

function MoneyRequestReportActionsList({onLayout}: MoneyRequestReportListProps) {
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportIDFromRoute = route?.params?.reportID;

    return (
        <MoneyRequestReportActionsListContent
            key={reportIDFromRoute ?? ''}
            reportIDFromRoute={reportIDFromRoute}
            onLayout={onLayout}
        />
    );
}

export default MoneyRequestReportActionsList;
