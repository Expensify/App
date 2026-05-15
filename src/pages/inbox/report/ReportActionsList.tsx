import {useIsFocused, useRoute} from '@react-navigation/native';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlashList from '@components/FlashList/InvertedFlashList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/FlatList/hooks/useFlatListScrollKey';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useLocalize from '@hooks/useLocalize';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {openReport, readNewestAction} from '@libs/actions/Report';
import {isSafari} from '@libs/Browser';
import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import DateUtils from '@libs/DateUtils';
import FS from '@libs/Fullstory';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getFirstVisibleReportActionID,
    getReportActionMessage,
    isConsecutiveActionMadeByPreviousActor,
    isCurrentActionUnread,
    isDeletedParentAction,
    isNewerReportAction,
    isReportPreviewAction,
    isReversedTransaction,
    isSentMoneyReportAction,
    isTransactionThread,
    wasMessageReceivedWhileOffline,
} from '@libs/ReportActionsUtils';
import {
    canShowReportRecipientLocalTime,
    canUserPerformWriteAction,
    chatIncludesChronosWithID,
    getOriginalReportID,
    getReportLastVisibleActionCreated,
    isArchivedNonExpenseReport,
    isCanceledTaskReport,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isMoneyRequestReport,
    isTaskReport,
    isUnread,
} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import FloatingMessageCounter from './FloatingMessageCounter';
import getInitialNumToRender from './getInitialNumReportActionsToRender';
import getReportActionsListInitialNumToRender from './getReportActionsListInitialNumToRender';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import {getUnreadMarkerReportAction} from './shouldDisplayNewMarkerOnReportAction';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';
import StaticReportActionsPreview from './StaticReportActionsPreview';
import useReportActionsNewActionLiveTail from './useReportActionsNewActionLiveTail';
import useReportUnreadMessageScrollTracking from './useReportUnreadMessageScrollTracking';

type ReportActionsListProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction thread report's parentReportAction */
    parentReportActionForTransactionThread: OnyxEntry<OnyxTypes.ReportAction>;

    /** Sorted actions prepared for display */
    sortedReportActions: OnyxTypes.ReportAction[];

    /** Sorted actions that should be visible to the user */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Callback executed on list layout */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Callback executed on scroll */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Function to load more chats */
    loadOlderChats: (force?: boolean) => void;

    /** Function to load newer chats */
    loadNewerChats: (force?: boolean) => void;

    /** Whether the report has newer actions to load */
    hasNewerActions: boolean;

    /** The oldest unread report action */
    oldestUnreadReportAction?: OnyxEntry<OnyxTypes.ReportAction> | undefined;

    /** Full sorted report actions for collapsing stale pagination after a live-tail jump */
    sortedAllReportActionsForPagination: OnyxTypes.ReportAction[];

    /** Current report action pages from Onyx */
    reportActionPages: OnyxTypes.Pages | undefined;

    /** When true, the paginated hook ignores deep-link / unread anchors */
    treatAsNoPaginationAnchor: boolean;

    setTreatAsNoPaginationAnchor: (value: boolean) => void;

    /** Whether the composer is in full size */
    isComposerFullSize?: boolean;

    /** Stable key to remount the list when the deep-linked action or unread anchor (or report) changes */
    listID: string;

    /** Whether the optimistic CREATED report action was added */
    hasCreatedActionAdded?: boolean;

    /** Whether the chat history is hidden (concierge side panel fresh state) */
    showHiddenHistory?: boolean;

    /** Whether there are previous messages that can be revealed */
    hasPreviousMessages?: boolean;

    /** Callback to show previous messages */
    onShowPreviousMessages?: () => void;
};

// Seems that there is an architecture issue that prevents us from using the reportID with useRef
// the useRef value gets reset when the reportID changes, so we use a global variable to keep track
let prevReportID: string | null = null;

/**
 * Create a unique key for each action in the FlatList.
 * We use the reportActionID that is a string representation of a random 64-bit int, which should be
 * random enough to avoid collisions
 */
function keyExtractor(item: OnyxTypes.ReportAction): string {
    return item.reportActionID;
}

function ReportActionsList({
    report,
    transactionThreadReport,
    parentReportAction,
    sortedReportActions,
    sortedVisibleReportActions,
    onScroll,
    loadNewerChats,
    loadOlderChats,
    hasNewerActions,
    oldestUnreadReportAction,
    sortedAllReportActionsForPagination,
    reportActionPages,
    treatAsNoPaginationAnchor,
    setTreatAsNoPaginationAnchor,
    onLayout,
    isComposerFullSize,
    listID,
    parentReportActionForTransactionThread,
    hasCreatedActionAdded,
    showHiddenHistory,
    hasPreviousMessages,
    onShowPreviousMessages,
}: ReportActionsListProps) {
    const prevHasCreatedActionAdded = usePrevious(hasCreatedActionAdded);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const personalDetailsList = usePersonalDetails();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {getLocalDateFromDatetime} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportScrollManager = useReportScrollManager();
    const {scrollOffsetRef} = useContext(ActionListContext);
    const {draftReportAction, hasActiveDraft} = useConciergeDraft();
    const {clearDraft} = useConciergeDraftActions();
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);
    const [isVisible, setIsVisible] = useState(Visibility.isVisible);
    const isFocused = useIsFocused();

    const isAnonymousUser = useIsAnonymousUser();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [reportActionsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [actionIdToHighlight, setActionIdToHighlight] = useState('');
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report.reportID}`);
    const prevIsLoadingInitialReportActions = usePrevious(reportLoadingState?.isLoadingInitialReportActions);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`);

    const backTo = route?.params?.backTo as string;
    const linkedReportActionID = route?.params?.reportActionID;

    useEffect(() => {
        const unsubscribe = Visibility.onVisibilityChange(() => {
            setIsVisible(Visibility.isVisible());
        });

        return unsubscribe;
    }, []);

    const readActionSkipped = useRef(false);
    const hasHeaderRendered = useRef(false);

    const lastAction = sortedVisibleReportActions.at(0);
    const [shouldMaintainVisibleContentPosition, setShouldMaintainVisibleContentPosition] = useState(() => scrollOffsetRef.current > CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
    const sortedVisibleReportActionsObjects: OnyxTypes.ReportActions = useMemo(
        () =>
            sortedVisibleReportActions.reduce((actions, action) => {
                Object.assign(actions, {[action.reportActionID]: action});
                return actions;
            }, {}),
        [sortedVisibleReportActions],
    );
    const prevSortedVisibleReportActionsObjects = usePrevious(sortedVisibleReportActionsObjects);

    const reportLastReadTime = report.lastReadTime ?? '';

    /**
     * The index of the earliest message that was received while offline
     */
    const earliestReceivedOfflineMessageIndex = useMemo(() => {
        // Create a list of (sorted) indices of message that were received while offline
        const receivedOfflineMessages = sortedReportActions.reduce<number[]>((acc, message, index) => {
            if (wasMessageReceivedWhileOffline(message, isOffline, lastOfflineAt.current, lastOnlineAt.current, getLocalDateFromDatetime)) {
                acc[index] = index;
            }

            return acc;
        }, []);

        // The last index in the list is the earliest message that was received while offline
        return receivedOfflineMessages.at(-1);
    }, [getLocalDateFromDatetime, isOffline, lastOfflineAt, lastOnlineAt, sortedReportActions]);

    // Index must be in the same domain as FlatList `data` (sortedVisibleReportActions), not the paginated full chain.
    const oldestUnreadReportActionMarker = useMemo<[string, number] | undefined>(() => {
        if (!oldestUnreadReportAction || reportLoadingState?.hasOnceLoadedReportActions) {
            return undefined;
        }
        const visibleIndex = sortedVisibleReportActions.findIndex((action) => action.reportActionID === oldestUnreadReportAction.reportActionID);
        if (visibleIndex < 0) {
            return undefined;
        }
        return [oldestUnreadReportAction.reportActionID, visibleIndex];
    }, [oldestUnreadReportAction, reportLoadingState?.hasOnceLoadedReportActions, sortedVisibleReportActions]);

    /**
     * The reportActionID the unread marker should display above
     */
    const prevUnreadMarkerReportActionID = useRef<string | null>(null);
    const [unreadMarkerTime, setUnreadMarkerTime] = useState(reportLastReadTime);
    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex] = useMemo(() => {
        // eslint-disable-next-line react-hooks/refs
        const scanned = getUnreadMarkerReportAction({
            visibleReportActions: sortedVisibleReportActions,
            earliestReceivedOfflineMessageIndex,
            currentUserAccountID,
            prevSortedVisibleReportActionsObjects,
            unreadMarkerTime,
            scrollingVerticalOffset: scrollOffsetRef.current,
            prevUnreadMarkerReportActionID: prevUnreadMarkerReportActionID.current,
            isOffline,
            isReversed: false,
            isAnonymousUser,
        });
        if (oldestUnreadReportActionMarker) {
            const [oldestAnchorActionID] = oldestUnreadReportActionMarker;
            // Pagination is anchored to the oldest unread on first open; that anchor does not change when the user
            // marks read or unread, or when messages are deleted. Prefer the scan when it does not match that stale id.
            if (scanned[0] !== null && scanned[0] !== oldestAnchorActionID) {
                return scanned;
            }
        }
        return oldestUnreadReportActionMarker ?? scanned;
    }, [
        currentUserAccountID,
        earliestReceivedOfflineMessageIndex,
        isAnonymousUser,
        isOffline,
        oldestUnreadReportActionMarker,
        prevSortedVisibleReportActionsObjects,
        scrollOffsetRef,
        sortedVisibleReportActions,
        unreadMarkerTime,
    ]);
    prevUnreadMarkerReportActionID.current = unreadMarkerReportActionID;

    const initialScrollKey = useMemo(() => {
        return linkedReportActionID ?? unreadMarkerReportActionID ?? undefined;
    }, [linkedReportActionID, unreadMarkerReportActionID]);

    const isTransactionThreadReport = useMemo(() => isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction), [parentReportAction]);
    const isMoneyRequestOrInvoiceReport = useMemo(() => isMoneyRequestReport(report) || isInvoiceReport(report), [report]);
    const shouldFocusToTopOnMount = useMemo(() => isTransactionThreadReport || isMoneyRequestOrInvoiceReport, [isMoneyRequestOrInvoiceReport, isTransactionThreadReport]);
    const renderedVisibleReportActions = useMemo(() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic draft into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === draftReportAction.reportActionID) {
                return sortedVisibleReportActions;
            }
            if (isNewerReportAction(draftReportAction, action)) {
                const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
                visibleReportActionsWithDraft.splice(index, 0, draftReportAction);
                return visibleReportActionsWithDraft;
            }
        }

        const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
        visibleReportActionsWithDraft.push(draftReportAction);
        return visibleReportActionsWithDraft;
    }, [draftReportAction, sortedVisibleReportActions]);
    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const isSyntheticDraftVisible = !!draftReportAction && renderedVisibleReportActions !== sortedVisibleReportActions;
    const draftAutoScrollKey = isSyntheticDraftVisible ? `${draftReportAction.reportActionID}:${draftMessageHTML ?? ''}` : '';
    const previousDraftAutoScrollKey = usePrevious(draftAutoScrollKey);
    const topReportAction = renderedVisibleReportActions.at(-1);
    const [shouldScrollToEndAfterLayout, setShouldScrollToEndAfterLayout] = useState(shouldFocusToTopOnMount && !initialScrollKey);
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    /**
     * The timestamp for the unread marker.
     *
     * This should ONLY be updated when the user
     * - switches reports
     * - marks a message as read/unread
     * - reads a new message as it is received
     */
    useEffect(() => {
        setUnreadMarkerTime(reportLastReadTime);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.reportID]);

    // When lastReadTime transitions from empty to a real value (e.g., data hasn't
    // loaded yet after sign-in), update the marker so it uses the fresh value
    // instead of the empty string from initial mount.
    useEffect(() => {
        if (reportLastReadTime === '' || unreadMarkerTime !== '') {
            return;
        }
        setUnreadMarkerTime(reportLastReadTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportLastReadTime]);

    useEffect(() => {
        if (!draftReportAction || isSyntheticDraftVisible) {
            return;
        }

        clearDraft();
    }, [clearDraft, draftReportAction, isSyntheticDraftVisible]);

    /**
     * Subscribe to read/unread events and update our unreadMarkerTime
     */
    useEffect(() => {
        if (isAnonymousUser) {
            return;
        }

        const unreadActionSubscription = DeviceEventEmitter.addListener(`unreadAction_${report.reportID}`, (newLastReadTime: string) => {
            setUnreadMarkerTime(newLastReadTime);
            userActiveSince.current = DateUtils.getDBTime();
        });
        const readNewestActionSubscription = DeviceEventEmitter.addListener(`readNewestAction_${report.reportID}`, (newLastReadTime: string) => {
            setUnreadMarkerTime(newLastReadTime);
        });

        return () => {
            unreadActionSubscription.remove();
            readNewestActionSubscription.remove();
        };
    }, [report.reportID, isAnonymousUser]);

    /**
     * When the user reads a new message as it is received, we'll push the unreadMarkerTime down to the timestamp of
     * the latest report action. When new report actions are received and the user is not viewing them (they're above
     * the MSG_VISIBLE_THRESHOLD), the unread marker will display over those new messages rather than the initial
     * lastReadTime.
     */
    useLayoutEffect(() => {
        if (isAnonymousUser || unreadMarkerReportActionID) {
            return;
        }

        const mostRecentReportActionCreated = lastAction?.created ?? '';
        if (mostRecentReportActionCreated <= unreadMarkerTime) {
            return;
        }

        setUnreadMarkerTime(mostRecentReportActionCreated);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastAction?.created]);

    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated || isReportPreviewAction(lastAction);

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged} = useReportUnreadMessageScrollTracking({
        reportID: report.reportID,
        currentVerticalScrollingOffsetRef: scrollOffsetRef,
        readActionSkippedRef: readActionSkipped,
        hasNewerActions,
        unreadMarkerReportActionIndex,
        isInverted: true,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offset = event.nativeEvent.contentOffset.y;
            scrollOffsetRef.current = offset;
            setShouldMaintainVisibleContentPosition(offset > CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
            onScroll?.(event);
            // We use a timeout to wait for the scroll to finish before resetting the flag.
            // onMomentumScrollEnd would be ideal but it doesn't work on web.
            if (shouldScrollToEndAfterLayout && (!hasCreatedActionAdded || isOffline) && !scrollEndTimerRef.current) {
                scrollEndTimerRef.current = setTimeout(() => {
                    setShouldScrollToEndAfterLayout(false);
                    scrollEndTimerRef.current = undefined;
                }, CONST.TIMING.LIST_SCROLLING_DEBOUNCE_TIME);
            }
        },
        hasOnceLoadedReportActions: !!reportLoadingState?.hasOnceLoadedReportActions,
    });

    const {isScrollToBottomEnabled, setIsScrollToBottomEnabled, completeLiveTailPruneAfterScrollToBottom} = useReportActionsNewActionLiveTail({
        reportID: report.reportID,
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

    useEffect(() => () => clearTimeout(scrollEndTimerRef.current), []);

    useScrollToEndOnNewMessageReceived({
        sizeChangeType: 'changed',
        scrollOffsetRef,
        lastActionID: lastAction?.reportActionID,
        visibleActionsLength: sortedVisibleReportActions.length,
        hasNewestReportAction,
        setIsFloatingMessageCounterVisible,
        scrollToEnd: reportScrollManager.scrollToBottom,
        // Include reportID so list-length / last-id baselines reset when the same screen instance shows another report.
        resetKey: `${report.reportID}:${linkedReportActionID}`,
    });

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
        const shouldTriggerScroll = shouldFocusToTopOnMount && prevHasCreatedActionAdded && !hasCreatedActionAdded;
        if (!shouldTriggerScroll) {
            return;
        }
        requestAnimationFrame(() => reportScrollManager.scrollToEnd());
    }, [hasCreatedActionAdded, prevHasCreatedActionAdded, shouldFocusToTopOnMount, shouldScrollToEndAfterLayout, reportScrollManager]);

    useEffect(() => {
        userActiveSince.current = DateUtils.getDBTime();
        prevReportID = report.reportID;
    }, [report.reportID]);

    // Same-screen report switches reuse this instance; per-report one-shot flags must not leak across reports.
    useEffect(() => {
        hasHeaderRendered.current = false;
    }, [report.reportID]);

    const isReportUnread = useMemo(
        () => isUnread(report, transactionThreadReport, isReportArchived) || (lastAction && isCurrentActionUnread(report, lastAction)),
        [report, transactionThreadReport, isReportArchived, lastAction],
    );

    // Mark the report as read when the user initially opens the report and there are unread messages
    const didMarkReportAsReadInitially = useRef(false);

    useEffect(() => {
        didMarkReportAsReadInitially.current = false;
    }, [report.reportID]);

    useEffect(() => {
        if (!isReportUnread || didMarkReportAsReadInitially.current) {
            didMarkReportAsReadInitially.current = true;
            return;
        }

        didMarkReportAsReadInitially.current = true;
        readNewestAction(report.reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
    }, [isReportUnread, report.reportID, reportLoadingState?.hasOnceLoadedReportActions]);

    const handleReportChangeMarkAsRead = useCallback(() => {
        if (report.reportID !== prevReportID) {
            return;
        }

        const isLastActionUnread = lastAction && isCurrentActionUnread(report, lastAction, sortedVisibleReportActions);
        if (!isUnread(report, transactionThreadReport, isReportArchived) && !isLastActionUnread) {
            return;
        }
        // On desktop, when the notification center is displayed, isVisible will return false.
        // Currently, there's no programmatic way to dismiss the notification center panel.
        // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
        const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
        const isScrolledToEnd = scrollOffsetRef.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;

        if ((isVisible || isFromNotification) && !hasNewerActions && isScrolledToEnd) {
            readNewestAction(report.reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
            if (isFromNotification) {
                Navigation.setParams({referrer: undefined});
            }
            return true;
        }

        readActionSkipped.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, report.reportID, isVisible, reportLoadingState?.hasOnceLoadedReportActions]);

    const handleAppVisibilityMarkAsRead = useCallback(() => {
        if (report.reportID !== prevReportID) {
            return;
        }

        if (!isVisible || !isFocused) {
            if (!lastMessageTime.current) {
                lastMessageTime.current = lastAction?.created ?? '';
            }
            return;
        }

        // In case the user read new messages (after being inactive) with other device we should
        // show marker based on report.lastReadTime
        const newMessageTimeReference = lastMessageTime.current && report.lastReadTime && lastMessageTime.current > report.lastReadTime ? userActiveSince.current : report.lastReadTime;
        lastMessageTime.current = null;

        const isArchivedReport = isArchivedNonExpenseReport(report, isReportArchived);
        const hasNewMessagesInView = scrollOffsetRef.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
        const hasUnreadReportAction = sortedVisibleReportActions.some(
            (reportAction) =>
                newMessageTimeReference &&
                newMessageTimeReference < reportAction.created &&
                (isReportPreviewAction(reportAction) ? reportAction.childLastActorAccountID : reportAction.actorAccountID) !== currentUserAccountID,
        );

        if (!isArchivedReport && (!hasNewMessagesInView || !hasUnreadReportAction)) {
            return;
        }

        readNewestAction(report.reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
        userActiveSince.current = DateUtils.getDBTime();
        return true;

        // This effect logic to `mark as read` will only run when the report focused has new messages and the App visibility
        //  is changed to visible(meaning user switched to app/web, while user was previously using different tab or application).
        // We will mark the report as read in the above case which marks the LHN report item as read while showing the new message
        // marker for the chat messages received while the user wasn't focused on the report or on another browser tab for web.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, isVisible, reportLoadingState?.hasOnceLoadedReportActions]);

    const prevHandleReportChangeMarkAsRead = useRef<() => void>(null);
    const prevHandleAppVisibilityMarkAsRead = useRef<() => void>(null);

    useEffect(() => {
        let isMarkedAsRead = false;
        if (handleReportChangeMarkAsRead !== prevHandleReportChangeMarkAsRead.current) {
            isMarkedAsRead = !!handleReportChangeMarkAsRead();
        }

        if (!isMarkedAsRead && handleAppVisibilityMarkAsRead !== prevHandleAppVisibilityMarkAsRead.current) {
            handleAppVisibilityMarkAsRead();
        }

        prevHandleReportChangeMarkAsRead.current = handleReportChangeMarkAsRead;
        prevHandleAppVisibilityMarkAsRead.current = handleAppVisibilityMarkAsRead;
    }, [handleReportChangeMarkAsRead, handleAppVisibilityMarkAsRead]);

    useEffect(() => {
        if (initialScrollKey) {
            return;
        }

        InteractionManager.runAfterInteractions(() => {
            if (shouldScrollToEndAfterLayout) {
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

    const reportActionsListFSClass = FS.getChatFSClass(report);
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

    const scrollToBottomAndMarkReportAsRead = useCallback(() => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
            if (!Navigation.getReportRHPActiveRoute()) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID, undefined, undefined, backTo));
            }
            openReport({reportID: report.reportID, introSelected, betas});
            reportScrollManager.scrollToBottom();
            return;
        }
        reportScrollManager.scrollToBottom();
        readActionSkipped.current = false;
        readNewestAction(report.reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
    }, [setIsFloatingMessageCounterVisible, hasNewestReportAction, reportScrollManager, report.reportID, backTo, introSelected, reportLoadingState?.hasOnceLoadedReportActions, betas]);

    /**
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     */
    const initialNumToRender = useMemo((): number => {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom + variables.fontSizeNormalHeight;
        const availableHeight = windowHeight - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
        const numToRender = Math.ceil(availableHeight / minimumReportActionHeight);
        return getReportActionsListInitialNumToRender({
            numToRender,
            initialScrollKey,
            shouldScrollToEndAfterLayout,
            hasCreatedActionAdded,
            sortedVisibleReportActionsLength: renderedVisibleReportActions.length,
            isOffline,
            getInitialNumToRender,
        });
    }, [
        styles.chatItem.paddingBottom,
        styles.chatItem.paddingTop,
        windowHeight,
        initialScrollKey,
        shouldScrollToEndAfterLayout,
        hasCreatedActionAdded,
        renderedVisibleReportActions.length,
        isOffline,
    ]);

    /**
     * Thread's divider line should hide when the first chat in the thread is marked as unread.
     * This is so that it will not be conflicting with header's separator line.
     */
    const shouldHideThreadDividerLine = useMemo(
        (): boolean => getFirstVisibleReportActionID(sortedReportActions, isOffline) === unreadMarkerReportActionID,
        [sortedReportActions, isOffline, unreadMarkerReportActionID],
    );

    const firstVisibleReportActionID = useMemo(() => getFirstVisibleReportActionID(sortedReportActions, isOffline), [sortedReportActions, isOffline]);

    const shouldUseThreadDividerLine = useMemo(() => {
        const topReport = renderedVisibleReportActions.length > 0 ? renderedVisibleReportActions.at(renderedVisibleReportActions.length - 1) : null;

        if (topReport && topReport.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return false;
        }

        if (isTransactionThread(parentReportAction)) {
            return !isDeletedParentAction(parentReportAction) && !isReversedTransaction(parentReportAction);
        }

        if (isTaskReport(report)) {
            return !isCanceledTaskReport(report, parentReportAction);
        }

        return isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    }, [parentReportAction, renderedVisibleReportActions, report]);

    // Precompute a reportActionID -> index map so renderItem can resolve the real index in O(1)
    // instead of scanning renderedVisibleReportActions with indexOf on every render.
    const actionIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const [i, action] of renderedVisibleReportActions.entries()) {
            map.set(action.reportActionID, i);
        }
        return map;
    }, [renderedVisibleReportActions]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
            const originalReportID = getOriginalReportID(report.reportID, reportAction, reportActionsFromOnyx);

            // Use the action's actual index in sortedVisibleReportActions rather than the FlashList-provided index,
            // because useFlashListScrollKey may slice the data for deep-link scroll positioning, making the
            // FlashList index offset from the full array and causing wrong displayAsGroup computation.
            const safeIndex = actionIndexMap.get(reportAction.reportActionID) ?? index;

            return (
                <>
                    <ReportActionsListItemRenderer
                        reportAction={reportAction}
                        parentReportAction={parentReportAction}
                        parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                        index={index}
                        report={report}
                        transactionThreadReport={transactionThreadReport}
                        linkedReportActionID={linkedReportActionID}
                        displayAsGroup={
                            !isConsecutiveChronosAutomaticTimerAction(renderedVisibleReportActions, safeIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                            isConsecutiveActionMadeByPreviousActor(renderedVisibleReportActions, safeIndex, isOffline)
                        }
                        shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                        shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                        shouldDisplayReplyDivider={renderedVisibleReportActions.length > 1}
                        isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                        shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                        personalDetails={personalDetailsList}
                        originalReportID={originalReportID}
                        isReportArchived={isReportArchived}
                        userBillingFundID={userBillingFundID}
                        isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                        reportNameValuePairsOrigin={reportNameValuePairs?.origin}
                        reportNameValuePairsOriginalID={reportNameValuePairs?.originalID}
                    />
                    <ShowPreviousMessagesButton
                        reportID={report.reportID}
                        actionType={reportAction.actionName}
                        hasPreviousMessages={!!hasPreviousMessages}
                        showFullHistory={!showHiddenHistory}
                        onPress={onShowPreviousMessages}
                    />
                </>
            );
        },
        [
            parentReportAction,
            parentReportActionForTransactionThread,
            report,
            isOffline,
            transactionThreadReport,
            linkedReportActionID,
            actionIndexMap,
            renderedVisibleReportActions,
            shouldHideThreadDividerLine,
            unreadMarkerReportActionID,
            firstVisibleReportActionID,
            shouldUseThreadDividerLine,
            personalDetailsList,
            userBillingFundID,
            isTryNewDotNVPDismissed,
            isReportArchived,
            reportNameValuePairs?.origin,
            reportNameValuePairs?.originalID,
            reportActionsFromOnyx,
            showHiddenHistory,
            hasPreviousMessages,
            onShowPreviousMessages,
        ],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = useMemo(
        () => [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined, isArchivedNonExpenseReport(report, isReportArchived), draftReportAction?.reportActionID, draftMessageHTML],
        [draftMessageHTML, draftReportAction?.reportActionID, unreadMarkerReportActionID, shouldUseNarrowLayout, report, isReportArchived],
    );
    const hideComposer = !canUserPerformWriteAction(report, isReportArchived);
    const shouldShowReportRecipientLocalTime = canShowReportRecipientLocalTime(personalDetailsList, report, currentUserAccountID) && !isComposerFullSize;
    const canShowHeader = isOffline || hasHeaderRendered.current;

    const onLayoutInner = useCallback(
        (event: LayoutChangeEvent) => {
            onLayout(event);
            if (isScrollToBottomEnabled) {
                reportScrollManager.scrollToBottom();
                setIsScrollToBottomEnabled(false);
                completeLiveTailPruneAfterScrollToBottom();
            }
            if (shouldScrollToEndAfterLayout && (!hasCreatedActionAdded || isOffline)) {
                requestAnimationFrame(() => {
                    reportScrollManager.scrollToEnd();
                });
            }
        },
        [
            isOffline,
            isScrollToBottomEnabled,
            onLayout,
            reportScrollManager,
            hasCreatedActionAdded,
            shouldScrollToEndAfterLayout,
            completeLiveTailPruneAfterScrollToBottom,
            setIsScrollToBottomEnabled,
        ],
    );

    const retryLoadNewerChatsError = useCallback(() => {
        loadNewerChats(true);
    }, [loadNewerChats]);

    const listHeaderComponent = useMemo(() => {
        // In case of an error we want to display the header no matter what.
        if (!canShowHeader) {
            hasHeaderRendered.current = true;
            return null;
        }

        return (
            <ReportActionsListHeader
                reportID={report.reportID}
                onRetry={retryLoadNewerChatsError}
                hasActiveDraft={hasActiveDraft}
            />
        );
    }, [canShowHeader, hasActiveDraft, report.reportID, retryLoadNewerChatsError]);

    const shouldShowSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = useMemo(() => {
        if (!shouldShowSkeleton) {
            return;
        }

        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }, [shouldShowSkeleton]);

    const renderTopReportActions = useCallback(() => {
        const previewItems = renderedVisibleReportActions.slice(initialNumToRender ? -initialNumToRender : 0).reverse();

        return (
            <>
                {!shouldShowReportRecipientLocalTime && !hideComposer && <View style={[styles.stickToBottom, styles.appBG, styles.zIndex10, styles.height4]} />}
                <StaticReportActionsPreview>
                    {previewItems.map((action) => (
                        <View key={action.reportActionID}>
                            {renderItem({
                                item: action,
                                index: actionIndexMap.get(action.reportActionID) ?? 0,
                            } as ListRenderItemInfo<OnyxTypes.ReportAction>)}
                        </View>
                    ))}
                </StaticReportActionsPreview>
            </>
        );
    }, [actionIndexMap, hideComposer, initialNumToRender, renderItem, shouldShowReportRecipientLocalTime, renderedVisibleReportActions, styles]);

    const handleStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadNewerChats(false)));
    }, [loadNewerChats]);

    const onEndReached = useCallback(() => {
        loadOlderChats(false);
    }, [loadOlderChats]);

    return (
        <>
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <View
                style={[styles.flex1, !shouldShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}
                fsClass={reportActionsListFSClass}
            >
                {shouldScrollToEndAfterLayout && topReportAction ? renderTopReportActions() : undefined}
                <InvertedFlashList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={reportScrollManager.ref}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={renderedVisibleReportActions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    drawDistance={1500}
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={[
                        styles.chatContentScrollView,
                        shouldFocusToTopOnMount && styles.justifyContentEnd,
                        shouldScrollToEndAfterLayout && StyleUtils.getHiddenChatContentStyle(),
                    ]}
                    showsVerticalScrollIndicator={!shouldScrollToEndAfterLayout}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={handleStartReached}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={listHeaderComponent}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    onLayout={onLayoutInner}
                    onScroll={trackVerticalScrolling}
                    onViewableItemsChanged={onViewableItemsChanged}
                    extraData={extraData}
                    key={listID}
                    overrideProps={{isInvertedVirtualizedList: true}}
                    getItemType={(item) => item.actionName}
                    shouldMaintainVisibleContentPosition={shouldMaintainVisibleContentPosition}
                    initialScrollKey={initialScrollKey}
                    onContentSizeChange={() => {
                        trackVerticalScrolling(undefined);
                    }}
                />
            </View>
        </>
    );
}

export default memo(ReportActionsList);
