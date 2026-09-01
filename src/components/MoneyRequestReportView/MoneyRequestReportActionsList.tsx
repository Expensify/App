import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import REPORT_LINK_ROUTE_PARAMS from '@libs/Navigation/reportLinkRouteParams';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, hasNextActionMadeBySameActor, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID, getReportLastVisibleActionCreated, isHarvestCreatedExpenseReport, shouldShowMarkAsDone} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import isSearchTopmostFullScreenRoute from '@navigation/helpers/isSearchTopmostFullScreenRoute';

import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';
import {useActionListContext, useActionListRef} from '@pages/inbox/ActionListContext';
import {useAgentZeroStatus} from '@pages/inbox/AgentZeroStatusContext';
import {useConciergeDraft} from '@pages/inbox/ConciergeDraftContext';
import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';
import ReportActionIndexContext from '@pages/inbox/report/ReportActionIndexContext';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';

import {getOlderActions, openReport, subscribeToNewActionEvent} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import {pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

/* eslint-disable rulesdir/prefer-early-return */
import {useIsFocused, useRoute} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import MoneyRequestReportEmptyStateView from './MoneyRequestReportEmptyStateView';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';
import SelectionToolbar from './SelectionToolbar';
import useMoneyRequestReportVisibleActions from './useMoneyRequestReportVisibleActions';

/**
 * In this view we are not handling the special single transaction case, we're just handling the report
 */
const EmptyParentReportActionForTransactionThread = undefined;

// Amount of time to wait until all list items should be rendered and scrollToEnd will behave well
const DELAY_FOR_SCROLLING_TO_END = 100;

// The server page size for report actions is ~50. Gaps from IOU prioritization only happen
// when the initial load is truncated, so skip backfill for smaller reports.
const BACKFILL_MIN_ACTIONS_THRESHOLD = 50;

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
 * view's data/behavior hooks (`useMoneyRequestReportVisibleActions`) with the hooks shared with the
 * chat list (`useUnreadMarker` / `useMarkAsRead`).
 * Mounted with `key={reportID}` by the wrapper below, so all hook state resets on report switch.
 */
function MoneyRequestReportActionsListContent({reportIDFromRoute, onLayout}: MoneyRequestReportActionsListContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const reportScrollManager = useReportScrollManager();
    // The unified list writes its last item index here (see lastItemIndexRef prop). We jump to the bottom via
    // scrollToIndex rather than scrollToEnd: scrollToEnd targets an estimated content-end offset, which on a large
    // list (hundreds of transactions + chat) leaves the bottom blank until it renders/corrects. scrollToIndex
    // targets the last item directly and renders around it, so the landing is not blank.
    const lastItemIndexRef = useRef(0);
    const updateLastItemIndex = useCallback((index: number) => {
        lastItemIndexRef.current = index;
    }, []);

    const scrollToBottom = useCallback(() => {
        if (lastItemIndexRef.current < 0) {
            return;
        }

        reportScrollManager.scrollToIndex(lastItemIndexRef.current, {animated: false, viewPosition: 1});
    }, [reportScrollManager]);

    const didLayout = useRef(false);
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

    // Opened from the "X Replies" link: land on the latest message instead of the default top of the report.
    // The ref holds the report we already scrolled for, so the scroll fires only once per report open.
    const shouldScrollToLatestOnOpen = route?.params?.[REPORT_LINK_ROUTE_PARAMS.SHOULD_SCROLL_TO_LATEST] === 'true';
    const scrolledToLatestOnOpenForReportIDRef = useRef<string | undefined>(undefined);

    const parentReportAction = useParentReportAction(report);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], false, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`);
    const shouldShowHarvestCreatedAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);
    const [enableScrollToEnd, setEnableScrollToEnd] = useState<boolean>(false);
    const [lastActionEventId, setLastActionEventId] = useState<string>('');
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);

    const {visibleReportActions, visibleReportActionsNewestFirst, lastAction, firstVisibleReportActionID} = useMoneyRequestReportVisibleActions({
        reportID,
        reportActions,
        reportTransactionIDs,
        canPerformWriteAction: !!canPerformWriteAction,
        shouldShowHarvestCreatedAction,
        isOffline,
    });

    const {scrollOffsetRef} = useActionListContext();
    const listRef = useActionListRef();

    const scrollingVerticalBottomOffset = useRef(0);
    const stickToBottomRef = useRef(false);
    const stickToBottomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Set when the user taps "Latest messages"; the report is marked as read only once the scroll actually reaches the bottom.
    const pendingMarkAsReadRef = useRef(false);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated;

    const reportActionIDs = useMemo(() => {
        return reportActions?.map((action) => action.reportActionID) ?? [];
    }, [reportActions]);

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs: reportActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        newestFetchedReportActionID: reportPaginationState?.newestFetchedReportActionID,
    });

    const hasFinishedInitialLoad = reportLoadingState?.isLoadingInitialReportActions === false;
    const prevNewestFetchedIDRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (hasFinishedInitialLoad && hasNewerActions && reportActions.length > 0 && !isOffline && !reportLoadingState?.isLoadingNewerReportActions) {
            // Safety guard: if the cursor hasn't advanced since the last call, the server
            // isn't returning new data. Stop to prevent an infinite request loop.
            const currentCursor = reportPaginationState?.newestFetchedReportActionID;
            if (prevNewestFetchedIDRef.current !== undefined && prevNewestFetchedIDRef.current === currentCursor) {
                return;
            }
            prevNewestFetchedIDRef.current = currentCursor;
            loadNewerChats(false);
        }
    }, [
        hasFinishedInitialLoad,
        reportActions.length,
        hasNewerActions,
        isOffline,
        reportLoadingState?.isLoadingNewerReportActions,
        reportPaginationState?.newestFetchedReportActionID,
        loadNewerChats,
    ]);

    // Backfill loop: the backend prioritizes IOU actions in OpenReport/GetNewerActions for money
    // request reports, which can leave non-IOU chat messages in a gap between the IOU-biased cursor
    // and older messages. After auto-pagination finishes, walk backwards from the IOU cursor using
    // getOlderActions. Each response advances oldestFetchedReportActionID so the next call picks up
    // where the previous one left off, until the cursor stops advancing (gap filled).
    const prevBackfillCursorRef = useRef<string | undefined>(undefined);
    const isBackfillingRef = useRef(false);
    useEffect(() => {
        if (!hasFinishedInitialLoad || isOffline || hasNewerActions || reportLoadingState?.isLoadingNewerReportActions || reportLoadingState?.isLoadingOlderReportActions) {
            return;
        }

        if (!isBackfillingRef.current) {
            const hasIOUActions = reportActions.some((action) => isMoneyRequestAction(action));
            if (!hasIOUActions || reportActions.length < BACKFILL_MIN_ACTIONS_THRESHOLD || !reportPaginationState?.newestFetchedReportActionID) {
                return;
            }
        }

        const cursor = isBackfillingRef.current ? reportPaginationState?.oldestFetchedReportActionID : reportPaginationState?.newestFetchedReportActionID;
        if (!cursor) {
            return;
        }

        if (prevBackfillCursorRef.current === cursor) {
            return;
        }

        isBackfillingRef.current = true;
        prevBackfillCursorRef.current = cursor;
        const handle = TransitionTracker.runAfterTransitions({callback: () => getOlderActions(reportID, cursor)});

        return () => handle.cancel();
    }, [
        hasFinishedInitialLoad,
        isOffline,
        hasNewerActions,
        reportLoadingState?.isLoadingNewerReportActions,
        reportLoadingState?.isLoadingOlderReportActions,
        reportPaginationState?.newestFetchedReportActionID,
        reportPaginationState?.oldestFetchedReportActionID,
        reportActions,
        reportID,
    ]);

    const onStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadOlderChats(false);
            return;
        }
        TransitionTracker.runAfterTransitions({
            callback: () => loadOlderChats(false),
        });
    }, [loadOlderChats]);

    const onEndReached = useCallback(() => {
        loadNewerChats(false);
    }, [loadNewerChats]);

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

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged} = useReportUnreadMessageScrollTracking({
        reportID: reportID ?? reportIDFromRoute ?? '',
        currentVerticalScrollingOffsetRef: scrollingVerticalBottomOffset,
        onUnreadActionVisible: completeSkippedMarkAsRead,
        unreadMarkerReportActionIndex,
        isInverted: false,
        hasNewerActions,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const {layoutMeasurement, contentSize, contentOffset} = event.nativeEvent;
            const fullContentHeight = contentSize.height;

            /**
             * Count the diff between current scroll position and the bottom of the list.
             * Diff == (height of all items in the list) - (height of the layout with the list) - (how far user scrolled)
             */
            scrollingVerticalBottomOffset.current = fullContentHeight - layoutMeasurement.height - contentOffset.y;
            scrollOffsetRef.current = scrollingVerticalBottomOffset.current;
            setHasScrolledOverThreshold(scrollingVerticalBottomOffset.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);

            // Mark the report as read only once the scroll has actually reached the bottom. The jump fired by
            // "Latest messages" settles over several frames as deferred items hydrate, so we wait for the real end.
            if (pendingMarkAsReadRef.current && scrollingVerticalBottomOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD) {
                pendingMarkAsReadRef.current = false;
                markNewestActionAsRead();
            }
        },
    });

    useScrollToEndOnNewMessageReceived({
        sizeChangeType: 'grewFromReportActions',
        scrollOffsetRef,
        lastActionID: lastAction?.reportActionID,
        visibleActionsLength: visibleReportActions.length,
        reportActionsLength: reportActions.length,
        hasNewestReportAction,
        setIsFloatingMessageCounterVisible,
        scrollToEnd: scrollToBottom,
        resetKey: reportID ?? reportIDFromRoute ?? '',
    });

    // The indicator renders in the list footer, below the row scrollToBottom targets, so only
    // scrollToEnd reveals it. This list is not inverted, so nothing sticks to the bottom for us.
    const {candidateAgentIDs} = useAgentZeroStatus();
    const isThinkingIndicatorVisible = candidateAgentIDs.length > 0;
    // Scroll once per appearance: the label changes many times per run, and re-firing would yank
    // the viewport away from a user who has since scrolled up.
    const hasScrolledForThinkingIndicatorRef = useRef(false);
    useEffect(() => {
        if (!isThinkingIndicatorVisible) {
            hasScrolledForThinkingIndicatorRef.current = false;
            return;
        }
        if (hasScrolledForThinkingIndicatorRef.current || scrollingVerticalBottomOffset.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD) {
            return;
        }
        hasScrolledForThinkingIndicatorRef.current = true;

        // Wait for the footer to lay out, otherwise the content hasn't grown yet and there is
        // nothing to scroll to.
        const timeoutID = setTimeout(() => {
            reportScrollManager.scrollToEnd();
        }, DELAY_FOR_SCROLLING_TO_END);

        return () => clearTimeout(timeoutID);
    }, [isThinkingIndicatorVisible, reportScrollManager]);

    const scrollToBottomForCurrentUserAction = useCallback(
        (isFromCurrentUser: boolean, reportAction?: OnyxTypes.ReportAction) => {
            TransitionTracker.runAfterTransitions({
                callback: () => {
                    setIsFloatingMessageCounterVisible(false);
                    // If a new comment is added from the current user, scroll to the bottom, otherwise leave the user position unchanged
                    if (!isFromCurrentUser || reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
                        return;
                    }

                    // We want to scroll to the end of the list where the newest message is. We route through the indexed
                    // scrollToBottom (scrollToIndex) rather than scrollToEnd because scrollToEnd targets an estimated
                    // content-end offset that leaves the bottom blank on large transaction+chat lists. We still delay so
                    // the just-sent item has landed in the data before we jump.
                    const index = visibleReportActions.findIndex((item) => item.reportActionID === reportAction?.reportActionID);
                    if (index !== -1) {
                        setTimeout(() => {
                            scrollToBottom();
                        }, DELAY_FOR_SCROLLING_TO_END);
                    } else {
                        setEnableScrollToEnd(true);
                        setLastActionEventId(reportAction?.reportActionID);
                    }
                },
            });
        },
        [scrollToBottom, setIsFloatingMessageCounterVisible, visibleReportActions],
    );

    useEffect(() => {
        if (!report?.reportID) {
            return;
        }
        // This callback is triggered when a new action arrives via Pusher and the event is emitted from Report.ts. This allows us to maintain
        // a single source of truth for the "new action" event instead of trying to derive that a new action has appeared from looking at props.
        const unsubscribe = subscribeToNewActionEvent(report.reportID, scrollToBottomForCurrentUserAction);

        return () => {
            if (!unsubscribe) {
                return;
            }
            unsubscribe();
        };

        // This effect handles subscribing to events, so we only want to run it on mount, and in case reportID changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report?.reportID]);

    useEffect(() => {
        const index = visibleReportActions.findIndex((item) => item.reportActionID === lastActionEventId);
        if (enableScrollToEnd && index !== -1) {
            setTimeout(() => {
                scrollToBottom();
            }, DELAY_FOR_SCROLLING_TO_END);
            setEnableScrollToEnd(false);
        }
    }, [visibleReportActions, lastActionEventId, enableScrollToEnd, scrollToBottom]);

    const renderReportAction = useCallback(
        (reportAction: OnyxTypes.ReportAction, indexWithinReportActions: number) => {
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
        },
        [
            visibleReportActions,
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
        ],
    );

    const reportActionsExtraData = useMemo(() => [draftReportActionID, isDraftPendingCompletion], [draftReportActionID, isDraftPendingCompletion]);

    const scrollToLatestMessages = useCallback(() => {
        setIsFloatingMessageCounterVisible(false);

        stickToBottomRef.current = true;
        if (stickToBottomTimeoutRef.current) {
            clearTimeout(stickToBottomTimeoutRef.current);
        }
        // Safety net: stop pinning after deferred content has had time to settle, so a much later
        // unrelated layout change doesn't yank the user back down.
        stickToBottomTimeoutRef.current = setTimeout(() => {
            stickToBottomRef.current = false;
        }, 2000);

        if (!hasNewestReportAction) {
            openReport({reportID, introSelected, conciergeChat, betas, hasReportActions: true, currentUserAccountID});
            scrollToBottom();
            return;
        }

        // Defer marking the report as read until the scroll actually reaches the bottom (handled in onTrackScrolling).
        pendingMarkAsReadRef.current = true;
        scrollToBottom();
    }, [setIsFloatingMessageCounterVisible, hasNewestReportAction, scrollToBottom, reportID, introSelected, conciergeChat, betas, currentUserAccountID]);

    useEffect(() => {
        return () => {
            if (!stickToBottomTimeoutRef.current) {
                return;
            }
            clearTimeout(stickToBottomTimeoutRef.current);
        };
    }, []);

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

    const onListContentSizeChange = () => {
        if (!stickToBottomRef.current) {
            return;
        }
        scrollToBottom();
    };

    const onListScrollBeginDrag = () => {
        stickToBottomRef.current = false;
        // The user scrolled away before reaching the bottom, so cancel the pending read.
        pendingMarkAsReadRef.current = false;
        if (stickToBottomTimeoutRef.current) {
            clearTimeout(stickToBottomTimeoutRef.current);
            stickToBottomTimeoutRef.current = null;
        }
    };

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

    const isReportEmpty = isEmpty(visibleReportActions) && isEmpty(transactions) && !isInitialReportLoadPending;
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
