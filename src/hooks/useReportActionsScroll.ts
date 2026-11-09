import {isSafari} from '@libs/Browser';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import REPORT_LINK_ROUTE_PARAMS from '@libs/Navigation/reportLinkRouteParams';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {getVisibleReportActionErrors, isReportPreviewAction} from '@libs/ReportActionsUtils';
import {getReportLastVisibleActionCreated, shouldReportAlignToTop} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useActionListContext} from '@pages/inbox/ActionListContext';
import useReportActionsNewActionLiveTail from '@pages/inbox/report/useReportActionsNewActionLiveTail';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyValueObject} from '@src/types/utils/EmptyObject';
import type {ViewableItemsChanged} from '@src/types/utils/ReactNativeCompat';

import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useState} from 'react';

import useLinkedReportActionScroll from './useLinkedReportActionScroll';
import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useReportScrollManager from './useReportScrollManager';
import useScrollToEndOnNewMessageReceived from './useScrollToEndOnNewMessageReceived';

type UseReportActionsScrollParams = {
    /** Identifies the mounted list, including linked-message and hydration remounts. */
    listID: string;

    /** The ID of the report currently being looked at */
    reportID: string;

    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** Sorted actions that should be visible to the user */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Actions actually rendered by the list in chronological order (may include a synthetic draft), used for scroll positioning */
    renderedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Maps hidden canonical actions to the summary row used by the list. */
    reportActionIDToDisplayIndex?: ReadonlyMap<string, number>;

    /** Extracts the list key for an action; used to locate the initial scroll target */
    keyExtractor: (item: OnyxTypes.ReportAction) => string;

    /** Whether the user has scrolled past the "visible" threshold */
    /** Marks the newest action as read and clears any pending skipped mark-as-read */
    markNewestActionAsRead: () => void;

    /** Completes a previously skipped mark-as-read; no-op when none is pending */
    completeSkippedMarkAsRead: () => void;

    /** The report action ID the unread marker is anchored to, if any */
    unreadMarkerReportActionID: string | null;

    /** The index of the unread report action in the rendered actions list (-1 if none) */
    unreadMarkerReportActionIndex: number;

    /** Whether the report has newer actions to load */
    hasNewerActions: boolean;

    /** The index of the action badge target in the rendered actions list (-1 if none) */
    actionBadgeTargetIndex: number;

    /** Full sorted report actions for collapsing stale pagination after a live-tail jump */
    sortedAllReportActionsForPagination: OnyxTypes.ReportAction[];

    /** When true, the paginated hook ignores deep-link / unread anchors */
    treatAsNoPaginationAnchor: boolean;

    setTreatAsNoPaginationAnchor: (value: boolean) => void;
};

type UseReportActionsScrollResult = {
    /** Scroll handler that tracks vertical offset and floating counter visibility */
    trackVerticalScrolling: (event: NativeSyntheticEvent<NativeScrollEvent> | undefined) => void;

    /** Viewability handler that drives the floating counter and badge visibility */
    onViewableItemsChanged: ViewableItemsChanged;

    /** Whether the floating "new messages" counter is visible */
    isFloatingMessageCounterVisible: boolean;

    /** Whether the action badge target is above the viewport */
    isActionBadgeAboveViewport: boolean;

    /** Scrolls to the unread marker when available, otherwise to the newest action, and marks the report as read when appropriate */
    scrollToBottomAndMarkReportAsRead: () => void;

    scrollToActionBadgeTarget: () => void;

    /** Whether the list should be pinned to the visual top (transaction thread / money request) */
    shouldBeAlignedToTop: boolean;

    /** The index the list should scroll to on mount (undefined to keep default position) */
    initialScrollIndex: number | undefined;

    /** Positioning params (viewPosition/viewOffset) paired with initialScrollIndex */
    initialScrollIndexParams: {viewPosition?: number; viewOffset?: number} | undefined;

    /** Whether to show a skeleton below a linked final action while newer actions are still to load */
    shouldShowNewerActionsSkeleton: boolean;

    /** onLoad handler that enables pill tracking after initial positioning settles */
    onLoad: () => void;

    onItemSizeChanged: (info: {index: number; size: number; previous: number}) => void;

    trackLinkedMessageScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    stopLinkedMessagePositioning: () => void;
};

function useReportActionsScroll({
    listID,
    reportID,
    report,
    transactionThreadReport,
    parentReportAction,
    sortedVisibleReportActions,
    renderedVisibleReportActions,
    reportActionIDToDisplayIndex,
    keyExtractor,
    markNewestActionAsRead,
    completeSkippedMarkAsRead,
    unreadMarkerReportActionID,
    unreadMarkerReportActionIndex,
    hasNewerActions,
    actionBadgeTargetIndex,
    sortedAllReportActionsForPagination,
    treatAsNoPaginationAnchor,
    setTreatAsNoPaginationAnchor,
}: UseReportActionsScrollParams): UseReportActionsScrollResult {
    const reportScrollManager = useReportScrollManager();
    const {scrollOffsetRef, getListRef} = useActionListContext();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const linkedReportActionID = route?.params?.reportActionID;
    const {isOffline} = useNetworkWithOfflineStatus();
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${getNonEmptyStringOnyxID(reportID)}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const prevIsLoadingInitialReportActions = usePrevious(reportLoadingState?.isLoadingInitialReportActions);

    const [actionIdToHighlight, setActionIdToHighlight] = useState('');

    const lastAction = sortedVisibleReportActions.at(0);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    // A report preview can be the newest loaded action of a historical page. While newer pages are missing, loading
    // the next one must not read as a new message, or each page would scroll to its end and request another.
    const hasNewestReportAction = !hasNewerActions && (lastAction?.created === lastVisibleActionCreated || isReportPreviewAction(lastAction));

    const sortedVisibleReportActionsObjects: OnyxTypes.ReportActions = Object.fromEntries(sortedVisibleReportActions.map((action) => [action.reportActionID, action]));
    const prevSortedVisibleReportActionsObjects = usePrevious(sortedVisibleReportActionsObjects);

    const shouldBeAlignedToTop = shouldReportAlignToTop(report, parentReportAction);

    // A report opened from the "X Replies" link should land on the latest message, which is the opposite of the
    // align-to-top mount that money-request and invoice reports normally get. Multi-expense reports get this from
    // MoneyRequestReportActionsList. A report holding a single expense renders this list instead, so it has to honor
    // the same route param. The value is latched on mount because clearing the param below must not flip the list
    // back to the top while the user is reading.
    const [shouldScrollToLatestOnOpen] = useState(() => route?.params?.[REPORT_LINK_ROUTE_PARAMS.SHOULD_SCROLL_TO_LATEST] === 'true');

    // When the report is aligned to the top, only the linked action should drive the initial scroll position and the unread marker must be ignored.
    // Otherwise, prefer the linked action and fall back to the unread marker.
    // Sending from a link clears the route param to an empty string, which must not suppress unread positioning.
    let initialScrollKey = linkedReportActionID;
    if (!shouldBeAlignedToTop && !linkedReportActionID && unreadMarkerReportActionID) {
        initialScrollKey = unreadMarkerReportActionID;
    }

    // The CREATED action is the top anchor of an aligned-to-top report; scrolling to it is handled by shouldFocusToTopOnMount instead.
    if (shouldBeAlignedToTop && initialScrollKey && sortedVisibleReportActionsObjects[initialScrollKey]?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        initialScrollKey = undefined;
    }

    const shouldFocusToTopOnMount = shouldBeAlignedToTop && !initialScrollKey && !shouldScrollToLatestOnOpen;
    const [readyListID, setReadyListID] = useState<string>();
    const shouldDisablePillTracking = readyListID !== listID;

    const {
        isFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        setIsActionBadgeAboveViewport,
        trackVerticalScrolling,
        onViewableItemsChanged,
        updatePillVisibility,
    } = useReportUnreadMessageScrollTracking({
        reportID,
        currentVerticalScrollingOffsetRef: scrollOffsetRef,
        onUnreadActionVisible: completeSkippedMarkAsRead,
        hasNewerActions,
        unreadMarkerReportActionIndex,
        isInverted: false,
        // The list is hidden behind the expanded composer, so scrolling it must not bring the Latest messages pill back
        shouldDisablePillTracking: shouldDisablePillTracking || isComposerFullSize,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        },
        actionBadgeTargetIndex,
        getVisibleIndexRange: () => {
            const list = getListRef()?.current;
            // getLayout is the one accessor that does not throw before FlashList has laid out
            if (!list || (list.getLayout && !list.getLayout(0))) {
                return undefined;
            }
            const range = list.computeVisibleIndices?.();
            // An empty viewport comes back as {-1, -2}, which would read as "target above", so fall back to the reported items
            return range && range.startIndex >= 0 ? range : undefined;
        },
        shouldBeAlignedToTop,
    });

    const prevIsComposerFullSize = usePrevious(isComposerFullSize);
    // Scroll events skipped pill tracking while expanded, so sync the Latest messages pill with the current offset
    const syncPillAfterComposerCollapse = useEffectEvent(() => {
        if (!prevIsComposerFullSize || isComposerFullSize || shouldDisablePillTracking) {
            return;
        }
        updatePillVisibility();
    });
    useEffect(() => {
        syncPillAfterComposerCollapse();
    }, [isComposerFullSize]);

    const {isScrollToBottomEnabled, setIsScrollToBottomEnabled, completeLiveTailPruneAfterScrollToBottom, requestLiveTailJump} = useReportActionsNewActionLiveTail({
        reportID,
        policyID: report?.policyID,
        isOffline,
        reportScrollManager,
        setIsFloatingMessageCounterVisible,
        setActionIdToHighlight,
        unreadMarkerReportActionID,
        hasNewerActions,
        linkedReportActionID,
        hasNewestReportAction,
        renderedVisibleReportActions,
        sortedAllReportActionsForPagination,
        reportActionPages,
        setTreatAsNoPaginationAnchor,
        treatAsNoPaginationAnchor,
        prevIsLoadingInitialReportActions,
        reportLoadingState,
    });

    // Consume an explicit live-tail request after the data render, not on an unrelated future
    // viewport layout (for example, opening the keyboard after the user has scrolled away).
    useEffect(() => {
        if (!isScrollToBottomEnabled) {
            return;
        }
        reportScrollManager.scrollToBottom();
        setIsScrollToBottomEnabled(false);
        completeLiveTailPruneAfterScrollToBottom();
    }, [isScrollToBottomEnabled, reportScrollManager, setIsScrollToBottomEnabled, completeLiveTailPruneAfterScrollToBottom]);

    // Clear the shouldScrollToLatest route param once the mount scroll above has consumed it, so a later remount of
    // this report doesn't pull the user down again. MoneyRequestReportActionsList clears it the same way for the
    // multi-expense view.
    useEffect(() => {
        if (!shouldScrollToLatestOnOpen) {
            return;
        }
        Navigation.setParams({[REPORT_LINK_ROUTE_PARAMS.SHOULD_SCROLL_TO_LATEST]: undefined});
    }, [shouldScrollToLatestOnOpen]);

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

    // Only errors the user can actually see should pull the list down to them.
    const lastIOUActionWithError = sortedVisibleReportActions.find((action) => !isEmptyValueObject(getVisibleReportActionErrors(action)));
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

    // Decide where the list should be positioned on mount.
    // 1. If we're opening a linked or unread message, find that action in the chronological list.
    // 2. Otherwise, aligned-to-top reports start at the first action.
    const targetIndex = initialScrollKey
        ? (reportActionIDToDisplayIndex?.get(initialScrollKey) ?? renderedVisibleReportActions.findIndex((item) => keyExtractor(item) === initialScrollKey))
        : -1;
    const isLinkedTargetLastRow = !!linkedReportActionID && initialScrollKey === linkedReportActionID && targetIndex >= 0 && targetIndex === renderedVisibleReportActions.length - 1;
    // OpenReport returns a linked action with older actions only. The list shows a skeleton below it until the newest
    // page loads, so the link can open near the top like any other instead of at the end of a historical page. Removing
    // the skeleton with an intermediate page would shrink the content before LegendList sizes the new rows.
    const [newerActionsSkeletonListID, setNewerActionsSkeletonListID] = useState<string>();
    if (isLinkedTargetLastRow && hasNewerActions && newerActionsSkeletonListID !== listID) {
        setNewerActionsSkeletonListID(listID);
    }
    const shouldShowNewerActionsSkeleton = hasNewerActions && (isLinkedTargetLastRow || newerActionsSkeletonListID === listID);
    const isLinkedLastAction = isLinkedTargetLastRow && !hasNewerActions;
    let initialScrollIndex: number | undefined;
    let initialScrollIndexParams: {viewPosition?: number; viewOffset?: number} | undefined;
    if (targetIndex >= 0) {
        initialScrollIndex = targetIndex;
        // A linked final action can be taller than the viewport, so show its highlighted end.
        // Unread actions still start at the New marker. Omit viewOffset for bottom alignment so
        // LegendList includes the footer (for example, Concierge's thinking indicator).
        initialScrollIndexParams = isLinkedLastAction ? {viewPosition: 1} : {viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET};
    } else if (shouldFocusToTopOnMount) {
        initialScrollIndex = 0;
    }

    const {
        onReady,
        onItemSizeChanged,
        onScroll: trackLinkedMessageScroll,
        stopPositioning: stopLinkedMessagePositioning,
    } = useLinkedReportActionScroll({
        listID,
        linkedReportActionID: initialScrollKey === linkedReportActionID ? linkedReportActionID : undefined,
        targetIndex,
        isLastAction: isLinkedLastAction,
    });

    useScrollToEndOnNewMessageReceived({
        scrollOffsetRef,
        lastActionID: lastAction?.reportActionID,
        visibleActionsLength: sortedVisibleReportActions.length,
        hasNewestReportAction,
        setIsFloatingMessageCounterVisible,
        scrollToEnd: () => {
            stopLinkedMessagePositioning();
            reportScrollManager.scrollToBottom();
        },
        resetKey: `${reportID}:${linkedReportActionID}`,
    });

    const scrollToBottomAndMarkReportAsRead = () => {
        stopLinkedMessagePositioning();
        setIsFloatingMessageCounterVisible(false);

        if (unreadMarkerReportActionIndex >= 0) {
            reportScrollManager.scrollToIndex(unreadMarkerReportActionIndex, {viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
            if (hasNewestReportAction) {
                markNewestActionAsRead();
            }
            return;
        }

        if (!hasNewestReportAction) {
            // The historical page's end is not the report's end. Reuse the send flow to wait for the newest page before scrolling.
            requestLiveTailJump();
            return;
        }
        reportScrollManager.scrollToBottom();
        markNewestActionAsRead();
    };

    const scrollToActionBadgeTarget = () => {
        if (actionBadgeTargetIndex < 0) {
            return;
        }
        stopLinkedMessagePositioning();
        // The expanded composer covers the list, so the target never becomes viewable to hide the pill
        if (isComposerFullSize) {
            setIsActionBadgeAboveViewport(false);
            setIsFloatingMessageCounterVisible(false);
        }
        // `animated` is explicit because native defaults to an instant jump, which would teleport the list and lose the user's place.
        reportScrollManager.scrollToIndex(actionBadgeTargetIndex, {animated: true, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
    };

    const onLoad = () => {
        onReady();
        if (!shouldDisablePillTracking) {
            return;
        }
        requestAnimationFrame(() => {
            setReadyListID(listID);
            updatePillVisibility();
        });
    };

    return {
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        shouldBeAlignedToTop,
        initialScrollIndex,
        initialScrollIndexParams,
        shouldShowNewerActionsSkeleton,
        onLoad,
        onItemSizeChanged,
        trackLinkedMessageScroll,
        stopLinkedMessagePositioning,
    };
}

export default useReportActionsScroll;
