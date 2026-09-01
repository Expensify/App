import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import REPORT_LINK_ROUTE_PARAMS from '@libs/Navigation/reportLinkRouteParams';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {getOneTransactionThreadReportID, hasNextActionMadeBySameActor} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID, getReportLastVisibleActionCreated, isHarvestCreatedExpenseReport, shouldShowMarkAsDone} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';
import {useActionListRef} from '@pages/inbox/ActionListContext';
import {useConciergeDraft} from '@pages/inbox/ConciergeDraftContext';
import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';
import ReportActionIndexContext from '@pages/inbox/report/ReportActionIndexContext';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import {pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent} from 'react-native';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import MoneyRequestReportEmptyStateView from './MoneyRequestReportEmptyStateView';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';
import SelectionToolbar from './SelectionToolbar';
import useMoneyRequestReportData from './useMoneyRequestReportData';
import useMoneyRequestReportPagination from './useMoneyRequestReportPagination';
import useMoneyRequestReportScroll from './useMoneyRequestReportScroll';
import useMoneyRequestReportVisibleActions from './useMoneyRequestReportVisibleActions';

/**
 * In this view we are not handling the special single transaction case, we're just handling the report
 */
const EmptyParentReportActionForTransactionThread = undefined;

type MoneyRequestReportListProps = {
    /** Callback executed on layout */
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
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportIDFromRoute}`);
    const [reportPaginationState] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${reportIDFromRoute}`);
    const reportID = report?.reportID;

    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, linkedReportActionID);
    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const draftReportActionID = draftReportAction?.reportActionID;

    const {reportActions, reportTransactions, transactions, hasPendingDeletionTransaction, reportTransactionIDs, reportActionIDs} = useMoneyRequestReportData(
        reportIDFromRoute,
        unfilteredReportActions,
    );
    const [pendingNewTransactionIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: pendingNewTransactionIDsSelector,
    });
    const newTransactions = useNewTransactions(reportLoadingState?.hasOnceLoadedReportActions, reportTransactions, pendingNewTransactionIDs, reportIDFromRoute, isFocused);
    const showReportActionsLoadingState = reportLoadingState?.isLoadingInitialReportActions && !reportLoadingState?.hasOnceLoadedReportActions;
    const isInitialReportLoadPending = !isOffline && isReportLoadPending && !reportLoadingState?.hasOnceLoadedReportActions;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

    // Opened from the "X Replies" link: land on the latest message instead of the default top of the report.
    // The ref holds the report we already scrolled for, so the scroll fires only once per report open.
    const shouldScrollToLatestOnOpen = route?.params?.[REPORT_LINK_ROUTE_PARAMS.SHOULD_SCROLL_TO_LATEST] === 'true';
    const scrolledToLatestOnOpenForReportIDRef = useRef<string | undefined>(undefined);

    const parentReportAction = useParentReportAction(report);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], false, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`);
    const shouldShowHarvestCreatedAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

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

    const {onStartReached, onEndReached} = useMoneyRequestReportPagination({
        reportID,
        reportActions,
        reportActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        isOffline,
        reportPaginationState,
        reportLoadingState,
    });

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(false);

    const {unreadMarkerReportActionID, unreadMarkerReportActionIndex} = useUnreadMarker({
        reportID: reportID ?? reportIDFromRoute ?? '',
        sortedVisibleReportActions: visibleReportActions,
        isReversed: true,
        sortedReportActions: reportActions,
        oldestUnreadReportActionID: undefined,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!reportLoadingState?.hasOnceLoadedReportActions,
    });

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID: reportID ?? reportIDFromRoute ?? '',
        report,
        transactionThreadReport,
        sortedVisibleReportActions: visibleReportActionsNewestFirst,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
        scopeKey: 'moneyRequestReport',
    });

    const {isFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged, scrollToLatestMessages, onListContentSizeChange, onListScrollBeginDrag, updateLastItemIndex} =
        useMoneyRequestReportScroll({
            reportID,
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

    // When the report is opened from the "X Replies" link, scroll to the latest message once the actions are
    // available (this list otherwise opens at the top). scrollToLatestMessages pins to the bottom while the
    // deferred content settles, mirroring the floating "new messages" button. We clear the route param afterwards
    // so a later re-render or remount doesn't yank the user back down.
    useEffect(() => {
        if (!shouldScrollToLatestOnOpen || scrolledToLatestOnOpenForReportIDRef.current === reportIDFromRoute || visibleReportActions.length === 0) {
            return;
        }
        scrolledToLatestOnOpenForReportIDRef.current = reportIDFromRoute;
        scrollToLatestMessages();
        Navigation.setParams({[REPORT_LINK_ROUTE_PARAMS.SHOULD_SCROLL_TO_LATEST]: undefined});
    }, [shouldScrollToLatestOnOpen, visibleReportActions.length, scrollToLatestMessages, reportIDFromRoute]);

    const renderReportAction = (reportAction: OnyxTypes.ReportAction, indexWithinReportActions: number) => {
        const displayAsGroup =
            !isConsecutiveChronosAutomaticTimerAction(visibleReportActions, indexWithinReportActions, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
            hasNextActionMadeBySameActor(visibleReportActions, indexWithinReportActions, isOffline);
        const shouldDisableContextMenuForConciergeDraft = isDraftPendingCompletion && draftReportActionID === reportAction.reportActionID;

        return (
            <ReportActionIndexContext.Provider value={indexWithinReportActions}>
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
                />
            </ReportActionIndexContext.Provider>
        );
    };

    const reportActionsExtraData = [draftReportActionID, isDraftPendingCompletion];

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = () => {
        if (didLayout.current || !reportIDFromRoute) {
            return;
        }

        didLayout.current = true;

        markOpenReportEnd(reportIDFromRoute, report, {warm: true});
    };

    // `.length === 0` instead of lodash isEmpty: the compiler must treat an external call as possibly
    // mutating its argument, which extends these arrays' mutable ranges and blocks memoization of
    // `renderReportAction` (and everything else created between here and their creation).
    const isReportEmpty = visibleReportActions.length === 0 && transactions.length === 0 && !isInitialReportLoadPending;
    const showEmptyState = isReportEmpty;

    if (!report) {
        return null;
    }

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
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
                        visibleReportActions={visibleReportActions}
                        renderReportAction={renderReportAction}
                        reportActionsExtraData={reportActionsExtraData}
                        linkedReportActionID={linkedReportActionID}
                        listRef={listRef}
                        onLastItemIndexChange={updateLastItemIndex}
                        accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                        onListLayout={recordTimeToMeasureItemLayout}
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

/**
 * Public money-request report actions list. Thin wrapper that keys the content per report so all
 * hook state (unread marker time, pagination cursors, scroll refs) resets on report switch — the
 * same contract `ReportActionsList` gets from its `key={report.reportID}` consumers.
 */
function MoneyRequestReportActionsList({onLayout}: MoneyRequestReportListProps) {
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportIDFromRoute = route?.params?.reportID;

    return (
        <MoneyRequestReportActionsListContent
            key={reportIDFromRoute}
            reportIDFromRoute={reportIDFromRoute}
            onLayout={onLayout}
        />
    );
}

export default MoneyRequestReportActionsList;
