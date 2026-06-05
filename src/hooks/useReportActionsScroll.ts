import {useContext, useEffect, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/FlatList/hooks/useFlatListScrollKey';
import {isSafari} from '@libs/Browser';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isReportPreviewAction, isSentMoneyReportAction, isTransactionThread} from '@libs/ReportActionsUtils';
import {getReportLastVisibleActionCreated, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import useReportActionsNewActionLiveTail from '@pages/inbox/report/useReportActionsNewActionLiveTail';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {openReport, readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useReportScrollManager from './useReportScrollManager';
import useScrollToEndOnNewMessageReceived from './useScrollToEndOnNewMessageReceived';

type UseReportActionsScrollParams = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** Sorted actions that should be visible to the user */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Ref tracking whether mark-as-read was skipped because the user was scrolled away from the bottom */
    readActionSkippedRef: React.RefObject<boolean>;

    /** The report action ID the unread marker is anchored to, if any */
    unreadMarkerReportActionID: string | null;

    /** The index of the unread report action in the sorted visible actions list (-1 if none) */
    unreadMarkerReportActionIndex: number;

    /** Whether the report has newer actions to load */
    hasNewerActions: boolean;

    /** Function to load older chats */
    loadOlderChats: (force?: boolean) => void;

    /** Function to load newer chats */
    loadNewerChats: (force?: boolean) => void;

    /** The deep-linked report action ID from the route, if any */
    linkedReportActionID: string | undefined;

    /** The route's backTo param, used when navigating back to the report on read */
    backTo: string | undefined;

    /** Stable key that changes when a streamed concierge draft becomes visible, used to trigger autoscroll */
    draftAutoScrollKey: string;

    /** The index of the action badge target in the rendered actions list (-1 if none) */
    actionBadgeTargetIndex: number;

    /** Full sorted report actions for collapsing stale pagination after a live-tail jump */
    sortedAllReportActionsForPagination: OnyxTypes.ReportAction[];

    /** Current report action pages from Onyx */
    reportActionPages: OnyxTypes.Pages | undefined;

    /** When true, the paginated hook ignores deep-link / unread anchors */
    treatAsNoPaginationAnchor: boolean;

    setTreatAsNoPaginationAnchor: (value: boolean) => void;

    /** RAM-only report loading state */
    reportLoadingState: OnyxEntry<OnyxTypes.ReportLoadingState>;

    /** Whether the device is offline */
    isOffline: boolean;

    /** Setter for the component-owned scrolled-over-threshold state, which bridges scroll tracking to the unread marker */
    setHasScrolledOverThreshold: (value: boolean) => void;

    /** Callback executed on scroll */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Callback executed on list layout */
    onLayout: (event: LayoutChangeEvent) => void;
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

    /** onStartReached handler that loads newer chats */
    onStartReached: () => void;

    /** onEndReached handler that loads older chats */
    onEndReached: () => void;

    /** onLayout handler that forwards the prop and flushes a pending scroll-to-bottom */
    onLayoutInner: (event: LayoutChangeEvent) => void;

    /** Retries loading newer chats after an error */
    retryLoadNewerChatsError: () => void;

    /** Whether the list should be pinned to the visual top (transaction thread / money request) */
    shouldBeAlignedToTop: boolean;

    /** Whether the list should focus to the visual top on mount */
    shouldFocusToTopOnMount: boolean;

    /** The initial scroll target key for the list */
    initialScrollKey: string | undefined;

    /** Whether FlashList should autoscroll to the bottom while mounting at top */
    shouldAutoscrollToBottom: boolean;

    /** onLoad handler that disables autoscroll-to-top once the initial render settles */
    onLoad: () => void;
};

function useReportActionsScroll({
    report,
    transactionThreadReport,
    parentReportAction,
    sortedVisibleReportActions,
    readActionSkippedRef,
    unreadMarkerReportActionID,
    unreadMarkerReportActionIndex,
    hasNewerActions,
    loadOlderChats,
    loadNewerChats,
    linkedReportActionID,
    backTo,
    draftAutoScrollKey,
    actionBadgeTargetIndex,
    sortedAllReportActionsForPagination,
    reportActionPages,
    treatAsNoPaginationAnchor,
    setTreatAsNoPaginationAnchor,
    reportLoadingState,
    isOffline,
    setHasScrolledOverThreshold,
    onScroll,
    onLayout,
}: UseReportActionsScrollParams): UseReportActionsScrollResult {
    const reportID = report.reportID;
    const reportScrollManager = useReportScrollManager();
    const {scrollOffsetRef} = useContext(ActionListContext);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const hasOnceLoadedReportActions = !!reportLoadingState?.hasOnceLoadedReportActions;
    const prevIsLoadingInitialReportActions = usePrevious(reportLoadingState?.isLoadingInitialReportActions);

    const [actionIdToHighlight, setActionIdToHighlight] = useState('');

    const lastAction = sortedVisibleReportActions.at(0);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated || isReportPreviewAction(lastAction);

    const sortedVisibleReportActionsObjects: OnyxTypes.ReportActions = sortedVisibleReportActions.reduce((actions, action) => {
        Object.assign(actions, {[action.reportActionID]: action});
        return actions;
    }, {});
    const prevSortedVisibleReportActionsObjects = usePrevious(sortedVisibleReportActionsObjects);

    const isTransactionThreadReport = isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldBeAlignedToTop = isTransactionThreadReport || isMoneyRequestOrInvoiceReport;
    const initialScrollKey = (() => {
        const actionID = linkedReportActionID ?? unreadMarkerReportActionID;
        if (!actionID) {
            return undefined;
        }

        // The correct scroll behavior in this case will be handled by shouldFocusToTopOnMount logic
        if (shouldBeAlignedToTop && sortedVisibleReportActionsObjects[actionID]?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return undefined;
        }
        return actionID;
    })();
    const shouldFocusToTopOnMount = shouldBeAlignedToTop && !initialScrollKey;
    const [shouldAutoscrollToBottom, setShouldAutoscrollToBottom] = useState(shouldFocusToTopOnMount);

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, isActionBadgeAboveViewport, trackVerticalScrolling, onViewableItemsChanged} =
        useReportUnreadMessageScrollTracking({
            reportID,
            currentVerticalScrollingOffsetRef: scrollOffsetRef,
            readActionSkippedRef,
            hasNewerActions,
            unreadMarkerReportActionIndex,
            isInverted: true,
            onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const offset = event.nativeEvent.contentOffset.y;
                scrollOffsetRef.current = offset;
                setHasScrolledOverThreshold(offset >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
                onScroll?.(event);
            },
            hasOnceLoadedReportActions,
            actionBadgeTargetIndex,
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

    useEffect(() => {
        if (initialScrollKey) {
            return;
        }

        InteractionManager.runAfterInteractions(() => {
            if (shouldFocusToTopOnMount) {
                return;
            }
            setIsFloatingMessageCounterVisible(false);
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fixes Safari-specific issue where the whisper option is not highlighted correctly on hover after adding new transaction.
    // https://github.com/Expensify/App/issues/54520
    useEffect(() => {
        if (!isSafari()) {
            return;
        }
        const prevSorted = lastAction?.reportActionID ? prevSortedVisibleReportActionsObjects[lastAction?.reportActionID] : null;
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER && !prevSorted) {
            InteractionManager.runAfterInteractions(() => {
                reportScrollManager.scrollToBottom();
            });
        }
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

    useEffect(() => {
        if (lastIOUActionWithError?.reportActionID === prevLastIOUActionWithError?.reportActionID) {
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line no-param-reassign
        readActionSkippedRef.current = false;
        readNewestAction(reportID, hasOnceLoadedReportActions);
    };

    const scrollToActionBadgeTarget = () => {
        if (actionBadgeTargetIndex < 0) {
            return;
        }
        reportScrollManager.scrollToIndex(actionBadgeTargetIndex);
    };

    const onStartReached = () => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadNewerChats(false)));
    };

    const onEndReached = () => {
        loadOlderChats(false);
    };

    const onLayoutInner = (event: LayoutChangeEvent) => {
        onLayout(event);
        if (isScrollToBottomEnabled) {
            reportScrollManager.scrollToBottom();
            setIsScrollToBottomEnabled(false);
            completeLiveTailPruneAfterScrollToBottom();
        }
    };

    const retryLoadNewerChatsError = () => {
        loadNewerChats(true);
    };

    // Data is ready at the moment FlashList finishes its first render.
    // Wait one frame so the initial autoscroll-to-top can settle, then disable it.
    const onLoad = () => {
        if (!shouldFocusToTopOnMount) {
            return;
        }
        if (!reportLoadingState?.hasOnceLoadedReportActions && !isOffline) {
            return;
        }
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

    return {
        listRef: reportScrollManager.ref,
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        onStartReached,
        onEndReached,
        onLayoutInner,
        retryLoadNewerChatsError,
        shouldBeAlignedToTop,
        shouldFocusToTopOnMount,
        initialScrollKey,
        shouldAutoscrollToBottom,
        onLoad,
    };
}

export default useReportActionsScroll;
