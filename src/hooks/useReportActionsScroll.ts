import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/FlatList/hooks/useFlatListScrollKey';

import {isSafari} from '@libs/Browser';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isReportPreviewAction} from '@libs/ReportActionsUtils';
import {getReportLastVisibleActionCreated, shouldReportAlignToTop} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import useReportActionsNewActionLiveTail from '@pages/inbox/report/useReportActionsNewActionLiveTail';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';

import {openReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import {useContext, useEffect, useEffectEvent, useState} from 'react';

import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useReportScrollManager from './useReportScrollManager';
import useScrollToEndOnNewMessageReceived from './useScrollToEndOnNewMessageReceived';
import useWindowDimensions from './useWindowDimensions';

type UseReportActionsScrollParams = {
    /** The ID of the report currently being looked at */
    reportID: string;

    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** Sorted actions that should be visible to the user */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Actions actually rendered by the list (may include a synthetic draft), used for mount scroll positioning */
    renderedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Extracts the list key for an action; used to locate the initial scroll target */
    keyExtractor: (item: OnyxTypes.ReportAction) => string;

    /** Whether the user has scrolled past the "visible" threshold */
    hasScrolledOverThreshold: boolean;

    /** Marks the newest action as read and clears any pending skipped mark-as-read */
    markNewestActionAsRead: () => void;

    /** Completes a previously skipped mark-as-read; no-op when none is pending */
    completeSkippedMarkAsRead: () => void;

    /** The report action ID the unread marker is anchored to, if any */
    unreadMarkerReportActionID: string | null;

    /** The index of the unread report action in the sorted visible actions list (-1 if none) */
    unreadMarkerReportActionIndex: number;

    /** Whether the report has newer actions to load */
    hasNewerActions: boolean;

    /** Stable key that changes when a streamed concierge draft becomes visible, used to trigger autoscroll */
    draftAutoScrollKey: string;

    /** The index of the action badge target in the rendered actions list (-1 if none) */
    actionBadgeTargetIndex: number;

    /** Full sorted report actions for collapsing stale pagination after a live-tail jump */
    sortedAllReportActionsForPagination: OnyxTypes.ReportAction[];

    /** When true, the paginated hook ignores deep-link / unread anchors */
    treatAsNoPaginationAnchor: boolean;

    setTreatAsNoPaginationAnchor: (value: boolean) => void;
};

type UseReportActionsScrollResult = {
    /** Ref to attach to the inverted FlashList */
    listRef: ReturnType<typeof useReportScrollManager>['ref'];

    /** Scroll handler that tracks vertical offset and floating counter visibility */
    trackVerticalScrolling: (event: NativeSyntheticEvent<NativeScrollEvent> | undefined) => void;

    /** Viewability handler that drives the floating counter and badge visibility */
    onViewableItemsChanged: (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => void;

    /** Whether the floating "new messages" counter is visible */
    isFloatingMessageCounterVisible: boolean;

    /** Whether the action badge target is above the viewport */
    isActionBadgeAboveViewport: boolean;

    /** Scrolls to the newest action and marks the report as read */
    scrollToBottomAndMarkReportAsRead: () => void;

    /** Scrolls to the action badge target */
    scrollToActionBadgeTarget: () => void;

    /** Completes a live-tail scroll-to-bottom once the list has laid out; call on every list layout */
    flushPendingScrollToBottom: () => void;

    /** Whether the list should be pinned to the visual top (transaction thread / money request) */
    shouldBeAlignedToTop: boolean;

    /** Whether the list should focus to the visual top on mount */
    shouldFocusToTopOnMount: boolean;

    /** The initial scroll target key for the list */
    initialScrollKey: string | undefined;

    /** maintainVisibleContentPosition config for the inverted list */
    maintainVisibleContentPosition:
        | {
              autoscrollToBottomThreshold?: number;
              animateAutoScrollToBottom?: boolean;
          }
        | undefined;

    /** The index the list should scroll to on mount (undefined to keep default position) */
    initialScrollIndex: number | undefined;

    /** Positioning params (viewPosition/viewOffset) paired with initialScrollIndex */
    initialScrollIndexParams: {viewPosition?: number; viewOffset?: number} | undefined;

    /** maintainVisibleContentPosition config for the inverted list */
    maintainVisibleContentPosition: {disabled: boolean; autoscrollToBottomThreshold?: number; animateAutoScrollToBottom?: boolean};

    /** onLoad handler that disables autoscroll-to-top once the initial render settles */
    onLoad: () => void;
};

function useReportActionsScroll({
    reportID,
    report,
    transactionThreadReport,
    parentReportAction,
    sortedVisibleReportActions,
    renderedVisibleReportActions,
    keyExtractor,
    hasScrolledOverThreshold,
    markNewestActionAsRead,
    completeSkippedMarkAsRead,
    unreadMarkerReportActionID,
    unreadMarkerReportActionIndex,
    hasNewerActions,
    draftAutoScrollKey,
    actionBadgeTargetIndex,
    sortedAllReportActionsForPagination,
    treatAsNoPaginationAnchor,
    setTreatAsNoPaginationAnchor,
}: UseReportActionsScrollParams): UseReportActionsScrollResult {
    const reportScrollManager = useReportScrollManager();
    const {windowHeight} = useWindowDimensions();
    const {scrollOffsetRef} = useContext(ActionListContext);
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const linkedReportActionID = route?.params?.reportActionID;
    const backTo = route?.params?.backTo;
    const {isOffline} = useNetworkWithOfflineStatus();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${getNonEmptyStringOnyxID(reportID)}`);
    const prevIsLoadingInitialReportActions = usePrevious(reportLoadingState?.isLoadingInitialReportActions);

    const [actionIdToHighlight, setActionIdToHighlight] = useState('');

    const lastAction = sortedVisibleReportActions.at(0);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated || isReportPreviewAction(lastAction);

    const sortedVisibleReportActionsObjects: OnyxTypes.ReportActions = Object.fromEntries(sortedVisibleReportActions.map((action) => [action.reportActionID, action]));
    const prevSortedVisibleReportActionsObjects = usePrevious(sortedVisibleReportActionsObjects);

    const shouldBeAlignedToTop = shouldReportAlignToTop(report, parentReportAction);

    // When the report is aligned to the top, only the linked action should drive the initial scroll position and the unread marker must be ignored.
    // Otherwise, prefer the linked action and fall back to the unread marker.
    let initialScrollKey = linkedReportActionID;
    if (!shouldBeAlignedToTop && linkedReportActionID === undefined && unreadMarkerReportActionID) {
        initialScrollKey = unreadMarkerReportActionID;
    }

    // The CREATED action is the top anchor of an aligned-to-top report; scrolling to it is handled by shouldFocusToTopOnMount instead.
    if (shouldBeAlignedToTop && initialScrollKey && sortedVisibleReportActionsObjects[initialScrollKey]?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        initialScrollKey = undefined;
    }

    const shouldFocusToTopOnMount = shouldBeAlignedToTop && !initialScrollKey;
    const [shouldAutoscrollToBottom, setShouldAutoscrollToBottom] = useState(shouldFocusToTopOnMount);
    const [shouldDisablePillTracking, setShouldDisablePillTracking] = useState(!!initialScrollKey);

    // Once the initial pin to the visual top is released, the threshold must drop to 0 instead of removing the config:
    // FlashList only clears its internal pending-autoscroll flag while `autoscrollToBottomThreshold >= 0`. Removing the
    // config leaves a flag planted during the pin phase stale forever, and the next content change (e.g. marking a
    // message as unread) would scroll the list back to the top.
    const maintainVisibleContentPosition = shouldFocusToTopOnMount
        ? {
              autoscrollToBottomThreshold: shouldAutoscrollToBottom ? CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD : 0,
              animateAutoScrollToBottom: false,
          }
        : undefined;

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, isActionBadgeAboveViewport, trackVerticalScrolling, onViewableItemsChanged, updatePillVisibility} =
        useReportUnreadMessageScrollTracking({
            reportID,
            currentVerticalScrollingOffsetRef: scrollOffsetRef,
            onUnreadActionVisible: completeSkippedMarkAsRead,
            hasNewerActions,
            unreadMarkerReportActionIndex,
            isInverted: true,
            shouldDisablePillTracking,
            onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            },
            actionBadgeTargetIndex,
            shouldBeAlignedToTop,
        });

    const {isScrollToBottomEnabled, setIsScrollToBottomEnabled, completeLiveTailPruneAfterScrollToBottom} = useReportActionsNewActionLiveTail({
        reportID,
        introSelected,
        betas,
        isOffline,
        reportScrollManager,
        setIsFloatingMessageCounterVisible,
        setActionIdToHighlight,
        unreadMarkerReportActionID,
        hasNewerActions,
        linkedReportActionID,
        hasNewestReportAction,
        sortedVisibleReportActions,
        sortedAllReportActionsForPagination,
        reportActionPages,
        setTreatAsNoPaginationAnchor,
        treatAsNoPaginationAnchor,
        prevIsLoadingInitialReportActions,
        reportLoadingState,
    });

    useScrollToEndOnNewMessageReceived({
        sizeChangeType: 'changed',
        scrollOffsetRef,
        lastActionID: lastAction?.reportActionID,
        visibleActionsLength: sortedVisibleReportActions.length,
        hasNewestReportAction,
        setIsFloatingMessageCounterVisible,
        scrollToEnd: reportScrollManager.scrollToBottom,
        // Include reportID so list-length / last-id baselines reset when the same screen instance shows another report.
        resetKey: `${reportID}:${linkedReportActionID}`,
    });

    const previousDraftAutoScrollKey = usePrevious(draftAutoScrollKey);

    useEffect(() => {
        if (!draftAutoScrollKey || previousDraftAutoScrollKey === draftAutoScrollKey) {
            return;
        }

        if (scrollOffsetRef.current >= AUTOSCROLL_TO_TOP_THRESHOLD || !hasNewestReportAction) {
            return;
        }

        setIsFloatingMessageCounterVisible(false);
        requestAnimationFrame(() => {
            reportScrollManager.scrollToBottom();
        });
    }, [draftAutoScrollKey, hasNewestReportAction, previousDraftAutoScrollKey, reportScrollManager, scrollOffsetRef, setIsFloatingMessageCounterVisible]);

    const scheduleInitialScrollToBottom = useEffectEvent(() => {
        if (initialScrollKey) {
            return undefined;
        }

        return TransitionTracker.runAfterTransitions({
            callback: () => {
                if (shouldFocusToTopOnMount) {
                    return;
                }
                setIsFloatingMessageCounterVisible(false);
                reportScrollManager.scrollToBottom();
            },
            waitForUpcomingTransition: true,
        });
    });

    // The initial scroll-to-bottom must be scheduled exactly once, on mount; re-running it as deps change would yank the user back down while they read history.
    useEffect(() => {
        const handle = scheduleInitialScrollToBottom();
        return () => handle?.cancel();
    }, []);

    // Fixes Safari-specific issue where the whisper option is not highlighted correctly on hover after adding new transaction.
    // https://github.com/Expensify/App/issues/54520
    useEffect(() => {
        if (!isSafari()) {
            return;
        }
        const prevSorted = lastAction?.reportActionID ? prevSortedVisibleReportActionsObjects[lastAction?.reportActionID] : null;
        if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER || prevSorted) {
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                reportScrollManager.scrollToBottom();
            },
        });
        return () => handle.cancel();
    }, [lastAction?.reportActionID, lastAction?.actionName, prevSortedVisibleReportActionsObjects, reportScrollManager]);

    // Clear the highlighted report action after scrolling and highlighting
    useEffect(() => {
        if (actionIdToHighlight === '') {
            return;
        }
        // Time highlight is the same as SearchPage
        const timer = setTimeout(() => {
            setActionIdToHighlight('');
        }, durationHighlightItem);
        return () => clearTimeout(timer);
    }, [actionIdToHighlight]);

    const lastIOUActionWithError = sortedVisibleReportActions.find((action) => action.errors);
    const prevLastIOUActionWithError = usePrevious(lastIOUActionWithError);

    // Scroll to the bottom when a new errored action appears, so the user sees the failed money request. Re-checked
    // only when a new action arrives (keyed on lastAction), so loading older history never yanks a user who has
    // scrolled up. The !lastIOUActionWithError guard keeps a cleared error (retry succeeded / dismissed) from scrolling.
    const scheduleScrollToNewError = useEffectEvent(() => {
        if (!lastIOUActionWithError || lastIOUActionWithError.reportActionID === prevLastIOUActionWithError?.reportActionID) {
            return undefined;
        }
        return TransitionTracker.runAfterTransitions({callback: () => reportScrollManager.scrollToBottom()});
    });
    useEffect(() => {
        const handle = scheduleScrollToNewError();
        return () => handle?.cancel();
    }, [lastAction]);

    const scrollToBottomAndMarkReportAsRead = () => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
            if (!Navigation.getReportRHPActiveRoute()) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, backTo));
            }
            openReport({reportID, introSelected, betas});
            reportScrollManager.scrollToBottom();
            return;
        }
        reportScrollManager.scrollToBottom();
        markNewestActionAsRead();
    };

    const scrollToActionBadgeTarget = () => {
        if (actionBadgeTargetIndex < 0) {
            return;
        }
        reportScrollManager.scrollToIndex(actionBadgeTargetIndex);
    };

    const flushPendingScrollToBottom = () => {
        if (!isScrollToBottomEnabled) {
            return;
        }
        reportScrollManager.scrollToBottom();
        setIsScrollToBottomEnabled(false);
        completeLiveTailPruneAfterScrollToBottom();
    };

    // Data is ready at the moment FlashList finishes its first render.
    const onLoad = () => {
        if (shouldDisablePillTracking) {
            // Wait one frame so the initial positioning can settle, then disable it.
            requestAnimationFrame(() => {
                setShouldDisablePillTracking(false);
                updatePillVisibility();
            });
        }
        if (!shouldFocusToTopOnMount) {
            return;
        }
        if (!reportLoadingState?.hasOnceLoadedReportActions && !isOffline) {
            return;
        }
        // Wait one frame so the initial autoscroll-to-top can settle, then disable it.
        requestAnimationFrame(() => setShouldAutoscrollToBottom(false));
    };
    const prevHasOnceLoadedReportActions = usePrevious(reportLoadingState?.hasOnceLoadedReportActions);

    // Data finished initial loading after the list mounted. onLoad has already fired, so we need
    // a separate trigger to turn off autoscroll-to-top.
    useEffect(() => {
        if (!shouldFocusToTopOnMount || !shouldAutoscrollToBottom) {
            return;
        }
        if (prevHasOnceLoadedReportActions || !reportLoadingState?.hasOnceLoadedReportActions) {
            return;
        }
        requestAnimationFrame(() => setShouldAutoscrollToBottom(false));
    }, [shouldFocusToTopOnMount, shouldAutoscrollToBottom, prevHasOnceLoadedReportActions, reportLoadingState?.hasOnceLoadedReportActions]);

    const shouldMaintainVisibleContentPosition = hasScrolledOverThreshold || shouldFocusToTopOnMount;

    // Decide where the list should be positioned on mount.
    // 1. If we're opening a linked message (initialScrollKey), find that action in the list and scroll it to the top
    //    of the viewport (viewPosition: 1) with a small offset so the message above is partly visible.
    // 2. Otherwise, if the report should be opened at top (ex: for transaction threads), scroll to the top message and offset by
    //    the window height so we land at top of the top message for sure.
    const targetIndex = initialScrollKey ? renderedVisibleReportActions.findIndex((item) => keyExtractor(item) === initialScrollKey) : -1;
    let initialScrollIndex: number | undefined;
    let initialScrollIndexParams: {viewPosition?: number; viewOffset?: number} | undefined;
    if (targetIndex > 0) {
        initialScrollIndex = targetIndex;
        initialScrollIndexParams = {viewPosition: 1, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET};
    } else if (shouldFocusToTopOnMount) {
        initialScrollIndex = renderedVisibleReportActions.length - 1;
        initialScrollIndexParams = {viewOffset: windowHeight};
    }

    const maintainVisibleContentPosition = {
        disabled: !shouldMaintainVisibleContentPosition,
        ...(shouldAutoscrollToBottom ? {autoscrollToBottomThreshold: CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD, animateAutoScrollToBottom: false} : {}),
    };

    return {
        listRef: reportScrollManager.ref,
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        flushPendingScrollToBottom,
        shouldBeAlignedToTop,
        shouldFocusToTopOnMount,
        initialScrollKey,
        maintainVisibleContentPosition,
        initialScrollIndex,
        initialScrollIndexParams,
        onLoad,
    };
}

export default useReportActionsScroll;
