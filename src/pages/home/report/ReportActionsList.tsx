import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import React, {memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlatList from '@components/InvertedFlatList';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@hooks/useFlatListScrollKey';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useLocalize from '@hooks/useLocalize';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isSafari} from '@libs/Browser';
import DateUtils from '@libs/DateUtils';
import FS from '@libs/Fullstory';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getFirstVisibleReportActionID,
    getOriginalMessage,
    isConsecutiveActionMadeByPreviousActor,
    isConsecutiveChronosAutomaticTimerAction,
    isCurrentActionUnread,
    isDeletedParentAction,
    isMoneyRequestAction,
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
import variables from '@styles/variables';
import {openReport, readNewestAction, subscribeToNewActionEvent} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import FloatingMessageCounter from './FloatingMessageCounter';
import getInitialNumToRender from './getInitialNumReportActionsToRender';
import ListBoundaryLoader from './ListBoundaryLoader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ConciergeThinkingMessage from './ConciergeThinkingMessage';
import shouldDisplayNewMarkerOnReportAction from './shouldDisplayNewMarkerOnReportAction';
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

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID?: string | null;

    /** Callback executed on list layout */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Callback executed on scroll */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Function to load more chats */
    loadOlderChats: (force?: boolean) => void;

    /** Function to load newer chats */
    loadNewerChats: (force?: boolean) => void;

    /** Whether the composer is in full size */
    isComposerFullSize?: boolean;

    /** ID of the list */
    listID: number;

    /** Should enable auto scroll to top threshold */
    shouldEnableAutoScrollToTopThreshold?: boolean;

    /** Whether the optimistic CREATED report action was added */
    hasCreatedActionAdded?: boolean;

    /** Whether Concierge is currently processing */
    isConciergeProcessing?: boolean;

    /** Reasoning history from Concierge */
    conciergeReasoningHistory?: string[];
};

// In the component we are subscribing to the arrival of new actions.
// As there is the possibility that there are multiple instances of a ReportScreen
// for the same report, we only ever want one subscription to be active, as
// the subscriptions could otherwise be conflicting.
const newActionUnsubscribeMap: Record<string, () => void> = {};

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

const onScrollToIndexFailed = () => {};

function ReportActionsList({
    report,
    transactionThreadReport,
    parentReportAction,
    sortedReportActions,
    sortedVisibleReportActions,
    onScroll,
    mostRecentIOUReportActionID = '',
    loadNewerChats,
    loadOlderChats,
    onLayout,
    isComposerFullSize,
    listID,
    shouldEnableAutoScrollToTopThreshold,
    parentReportActionForTransactionThread,
    hasCreatedActionAdded,
    isConciergeProcessing = false,
    conciergeReasoningHistory = [],
}: ReportActionsListProps) {
    const prevHasCreatedActionAdded = usePrevious(hasCreatedActionAdded);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const personalDetailsList = usePersonalDetails();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {getLocalDateFromDatetime} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportScrollManager = useReportScrollManager();
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);
    const [isVisible, setIsVisible] = useState(Visibility.isVisible);
    const isFocused = useIsFocused();

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector, canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [draftMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}`, {canBeMissing: true});
    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}`, {canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: false});
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const [isScrollToBottomEnabled, setIsScrollToBottomEnabled] = useState(false);
    const [actionIdToHighlight, setActionIdToHighlight] = useState('');
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {canBeMissing: true});

    const backTo = route?.params?.backTo as string;
    // Display the new message indicator when comment linking and not close to the newest message.
    const reportActionID = route?.params?.reportActionID;

    const isTransactionThreadReport = useMemo(() => isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction), [parentReportAction]);
    const isMoneyRequestOrInvoiceReport = useMemo(() => isMoneyRequestReport(report) || isInvoiceReport(report), [report]);
    const shouldFocusToTopOnMount = useMemo(() => isTransactionThreadReport || isMoneyRequestOrInvoiceReport, [isMoneyRequestOrInvoiceReport, isTransactionThreadReport]);
    const topReportAction = sortedVisibleReportActions.at(-1);
    const [shouldScrollToEndAfterLayout, setShouldScrollToEndAfterLayout] = useState(shouldFocusToTopOnMount && !reportActionID);
    const isAnonymousUser = useIsAnonymousUser();

    useEffect(() => {
        const unsubscribe = Visibility.onVisibilityChange(() => {
            setIsVisible(Visibility.isVisible());
        });

        return unsubscribe;
    }, []);

    const scrollingVerticalOffset = useRef(0);
    const readActionSkipped = useRef(false);
    const hasHeaderRendered = useRef(false);
    const linkedReportActionID = route?.params?.reportActionID;

    const lastAction = sortedVisibleReportActions.at(0);
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
     * The timestamp for the unread marker.
     *
     * This should ONLY be updated when the user
     * - switches reports
     * - marks a message as read/unread
     * - reads a new message as it is received
     */
    const [unreadMarkerTime, setUnreadMarkerTime] = useState(reportLastReadTime);
    useEffect(() => {
        setUnreadMarkerTime(reportLastReadTime);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.reportID]);

    const prevUnreadMarkerReportActionID = useRef<string | null>(null);

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

    /**
     * The reportActionID the unread marker should display above
     */
    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex] = useMemo(() => {
        if (isAnonymousUser) {
            return [null, -1];
        }

        // If there are message that were received while offline,
        // we can skip checking all messages later than the earliest received offline message.
        const startIndex = earliestReceivedOfflineMessageIndex ?? 0;

        // Scan through each visible report action until we find the appropriate action to show the unread marker
        for (let index = startIndex; index < sortedVisibleReportActions.length; index++) {
            const reportAction = sortedVisibleReportActions.at(index);
            const nextAction = sortedVisibleReportActions.at(index + 1);
            const isEarliestReceivedOfflineMessage = index === earliestReceivedOfflineMessageIndex;

            const shouldDisplayNewMarker =
                reportAction &&
                shouldDisplayNewMarkerOnReportAction({
                    message: reportAction,
                    nextMessage: nextAction,
                    isEarliestReceivedOfflineMessage,
                    currentUserAccountID,
                    prevSortedVisibleReportActionsObjects,
                    unreadMarkerTime,
                    scrollingVerticalOffset: scrollingVerticalOffset.current,
                    prevUnreadMarkerReportActionID: prevUnreadMarkerReportActionID.current,
                });
            if (shouldDisplayNewMarker) {
                return [reportAction.reportActionID, index];
            }
        }

        return [null, -1];
    }, [currentUserAccountID, isAnonymousUser, earliestReceivedOfflineMessageIndex, prevSortedVisibleReportActionsObjects, sortedVisibleReportActions, unreadMarkerTime]);
    prevUnreadMarkerReportActionID.current = unreadMarkerReportActionID;

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

    const lastActionIndex = lastAction?.reportActionID;
    const reportActionSize = useRef(sortedVisibleReportActions.length);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated || isReportPreviewAction(lastAction);
    const hasNewestReportActionRef = useRef(hasNewestReportAction);
    hasNewestReportActionRef.current = hasNewestReportAction;
    const previousLastIndex = useRef(lastActionIndex);
    const sortedVisibleReportActionsRef = useRef(sortedVisibleReportActions);

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged} = useReportUnreadMessageScrollTracking({
        reportID: report.reportID,
        currentVerticalScrollingOffsetRef: scrollingVerticalOffset,
        readActionSkippedRef: readActionSkipped,
        unreadMarkerReportActionIndex,
        isInverted: true,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollingVerticalOffset.current = event.nativeEvent.contentOffset.y;
            onScroll?.(event);
            if (shouldScrollToEndAfterLayout && (!hasCreatedActionAdded || isOffline)) {
                setShouldScrollToEndAfterLayout(false);
            }
        },
    });

    useEffect(() => {
        if (
            scrollingVerticalOffset.current < AUTOSCROLL_TO_TOP_THRESHOLD &&
            previousLastIndex.current !== lastActionIndex &&
            reportActionSize.current !== sortedVisibleReportActions.length &&
            hasNewestReportAction
        ) {
            setIsFloatingMessageCounterVisible(false);
            reportScrollManager.scrollToBottom();
        }
        previousLastIndex.current = lastActionIndex;
        reportActionSize.current = sortedVisibleReportActions.length;
    }, [lastActionIndex, sortedVisibleReportActions.length, reportScrollManager, hasNewestReportAction, linkedReportActionID, setIsFloatingMessageCounterVisible]);

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

    const handleReportChangeMarkAsRead = useCallback(() => {
        if (report.reportID !== prevReportID) {
            return;
        }

        // Do not try to mark the report as read if the report has not been loaded and shared with the user
        if (!reportMetadata?.hasOnceLoadedReportActions) {
            return;
        }

        if (isUnread(report, transactionThreadReport, isReportArchived) || (lastAction && isCurrentActionUnread(report, lastAction, sortedVisibleReportActions))) {
            // On desktop, when the notification center is displayed, isVisible will return false.
            // Currently, there's no programmatic way to dismiss the notification center panel.
            // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
            const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
            if ((isVisible || isFromNotification) && scrollingVerticalOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD) {
                readNewestAction(report.reportID);
                if (isFromNotification) {
                    Navigation.setParams({referrer: undefined});
                }
                return true;
            }

            readActionSkipped.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, report.reportID, isVisible, reportMetadata?.hasOnceLoadedReportActions]);

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
        const hasNewMessagesInView = scrollingVerticalOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
        const hasUnreadReportAction = sortedVisibleReportActions.some(
            (reportAction) =>
                newMessageTimeReference &&
                newMessageTimeReference < reportAction.created &&
                (isReportPreviewAction(reportAction) ? reportAction.childLastActorAccountID : reportAction.actorAccountID) !== currentUserAccountID,
        );

        if (!isArchivedReport && (!hasNewMessagesInView || !hasUnreadReportAction)) {
            return;
        }

        readNewestAction(report.reportID);
        userActiveSince.current = DateUtils.getDBTime();
        return true;

        // This effect logic to `mark as read` will only run when the report focused has new messages and the App visibility
        //  is changed to visible(meaning user switched to app/web, while user was previously using different tab or application).
        // We will mark the report as read in the above case which marks the LHN report item as read while showing the new message
        // marker for the chat messages received while the user wasn't focused on the report or on another browser tab for web.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, isVisible]);

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
        if (linkedReportActionID) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                reportScrollManager.scrollToBottom();
            });
        }
    }, [lastAction?.reportActionID, lastAction?.actionName, prevSortedVisibleReportActionsObjects, reportScrollManager]);

    useEffect(() => {
        sortedVisibleReportActionsRef.current = sortedVisibleReportActions;
    }, [sortedVisibleReportActions]);

    const scrollToBottomForCurrentUserAction = useCallback(
        (isFromCurrentUser: boolean, action?: OnyxTypes.ReportAction) => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
                // they are now in the list.
                if (!isFromCurrentUser || (!isReportTopmostSplitNavigator() && !Navigation.getReportRHPActiveRoute())) {
                    return;
                }
                if (!hasNewestReportActionRef.current && !isFromCurrentUser) {
                    if (Navigation.getReportRHPActiveRoute()) {
                        return;
                    }
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
                    });
                    return;
                }
                const index = sortedVisibleReportActionsRef.current.findIndex((item) => keyExtractor(item) === action?.reportActionID);
                if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                    if (index > 0) {
                        setTimeout(() => {
                            reportScrollManager.scrollToIndex(index);
                        }, 100);
                    } else {
                        setIsFloatingMessageCounterVisible(false);
                        reportScrollManager.scrollToBottom();
                    }
                    if (action?.reportActionID) {
                        setActionIdToHighlight(action.reportActionID);
                    }
                } else {
                    setIsFloatingMessageCounterVisible(false);
                    reportScrollManager.scrollToBottom();
                }

                setIsScrollToBottomEnabled(true);
            });
        },
        [report.reportID, reportScrollManager, setIsFloatingMessageCounterVisible],
    );

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

    useEffect(() => {
        // Why are we doing this, when in the cleanup of the useEffect we are already calling the unsubscribe function?
        // Answer: On web, when navigating to another report screen, the previous report screen doesn't get unmounted,
        //         meaning that the cleanup might not get called. When we then open a report we had open already previously, a new
        //         ReportScreen will get created. Thus, we have to cancel the earlier subscription of the previous screen,
        //         because the two subscriptions could conflict!
        //         In case we return to the previous screen (e.g. by web back navigation) the useEffect for that screen would
        //         fire again, as the focus has changed and will set up the subscription correctly again.
        const previousSubUnsubscribe = newActionUnsubscribeMap[report.reportID];
        if (previousSubUnsubscribe) {
            previousSubUnsubscribe();
        }

        // This callback is triggered when a new action arrives via Pusher and the event is emitted from Report.js. This allows us to maintain
        // a single source of truth for the "new action" event instead of trying to derive that a new action has appeared from looking at props.
        const unsubscribe = subscribeToNewActionEvent(report.reportID, scrollToBottomForCurrentUserAction);

        const cleanup = () => {
            if (!unsubscribe) {
                return;
            }
            unsubscribe();
        };

        newActionUnsubscribeMap[report.reportID] = cleanup;

        return cleanup;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.reportID]);

    const reportActionsListFSClass = FS.getChatFSClass(report);
    const lastIOUActionWithError = sortedVisibleReportActions.find((action) => action.errors);
    const prevLastIOUActionWithError = usePrevious(lastIOUActionWithError);

    useEffect(() => {
        if (lastIOUActionWithError?.reportActionID === prevLastIOUActionWithError?.reportActionID) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            openReport(report.reportID);
            reportScrollManager.scrollToBottom();
            return;
        }
        reportScrollManager.scrollToBottom();
        readActionSkipped.current = false;
        readNewestAction(report.reportID);
    }, [setIsFloatingMessageCounterVisible, hasNewestReportAction, reportScrollManager, report.reportID, backTo]);

    /**
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     */
    const initialNumToRender = useMemo((): number | undefined => {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom + variables.fontSizeNormalHeight;
        const availableHeight = windowHeight - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
        const numToRender = Math.ceil(availableHeight / minimumReportActionHeight);
        if (linkedReportActionID) {
            return getInitialNumToRender(numToRender);
        }
        return numToRender || undefined;
    }, [styles.chatItem.paddingBottom, styles.chatItem.paddingTop, windowHeight, linkedReportActionID]);

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
        const topReport = sortedVisibleReportActions.length > 0 ? sortedVisibleReportActions.at(sortedVisibleReportActions.length - 1) : null;

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
    }, [parentReportAction, report, sortedVisibleReportActions]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
            const originalReportID = getOriginalReportID(report.reportID, reportAction);
            const reportDraftMessages = draftMessage?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`];
            const matchingDraftMessage = reportDraftMessages?.[reportAction.reportActionID];
            const matchingDraftMessageString = matchingDraftMessage?.message;

            const actionEmojiReactions = emojiReactions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportAction.reportActionID}`];
            const transactionID = isMoneyRequestAction(reportAction) && getOriginalMessage(reportAction)?.IOUTransactionID;
            const transaction = transactionID ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] : undefined;
            const actionLinkedTransactionRouteError = transaction?.errorFields?.route ?? undefined;

            return (
                <ReportActionsListItemRenderer
                    allReports={allReports}
                    policies={policies}
                    reportAction={reportAction}
                    reportActions={sortedReportActions}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                    index={index}
                    report={report}
                    transactionThreadReport={transactionThreadReport}
                    linkedReportActionID={linkedReportActionID}
                    displayAsGroup={
                        !isConsecutiveChronosAutomaticTimerAction(sortedVisibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID)) &&
                        isConsecutiveActionMadeByPreviousActor(sortedVisibleReportActions, index)
                    }
                    mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                    shouldDisplayReplyDivider={sortedVisibleReportActions.length > 1}
                    isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                    shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                    transactions={Object.values(transactions ?? {})}
                    userWalletTierName={userWalletTierName}
                    isUserValidated={isUserValidated}
                    personalDetails={personalDetailsList}
                    draftMessage={matchingDraftMessageString}
                    emojiReactions={actionEmojiReactions}
                    allDraftMessages={draftMessage}
                    allEmojiReactions={emojiReactions}
                    isReportArchived={isReportArchived}
                    linkedTransactionRouteError={actionLinkedTransactionRouteError}
                    userBillingFundID={userBillingFundID}
                    isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                    reportNameValuePairsOrigin={reportNameValuePairs?.origin}
                    reportNameValuePairsOriginalID={reportNameValuePairs?.originalID}
                />
            );
        },
        [
            draftMessage,
            emojiReactions,
            allReports,
            policies,
            sortedReportActions,
            parentReportAction,
            parentReportActionForTransactionThread,
            report,
            transactionThreadReport,
            linkedReportActionID,
            sortedVisibleReportActions,
            mostRecentIOUReportActionID,
            shouldHideThreadDividerLine,
            unreadMarkerReportActionID,
            firstVisibleReportActionID,
            shouldUseThreadDividerLine,
            transactions,
            userWalletTierName,
            isUserValidated,
            personalDetailsList,
            userBillingFundID,
            isTryNewDotNVPDismissed,
            isReportArchived,
            reportNameValuePairs?.origin,
            reportNameValuePairs?.originalID,
        ],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = useMemo(
        () => [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined, isArchivedNonExpenseReport(report, isReportArchived)],
        [unreadMarkerReportActionID, shouldUseNarrowLayout, report, isReportArchived],
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
            }
            if (shouldScrollToEndAfterLayout && (!hasCreatedActionAdded || isOffline)) {
                requestAnimationFrame(() => {
                    reportScrollManager.scrollToEnd();
                });
            }
        },
        [isOffline, isScrollToBottomEnabled, onLayout, reportScrollManager, hasCreatedActionAdded, shouldScrollToEndAfterLayout],
    );

    const retryLoadNewerChatsError = useCallback(() => {
        loadNewerChats(true);
    }, [loadNewerChats]);

    const listHeaderComponent = useMemo(() => {
        // In case of an error we want to display the header no matter what.
        if (!canShowHeader && !isConciergeProcessing) {
            hasHeaderRendered.current = true;
            return null;
        }

        return (
            <View>
                {isConciergeProcessing && <ConciergeThinkingMessage reasoningHistory={conciergeReasoningHistory} />}
                {canShowHeader && (
                    <ListBoundaryLoader
                        type={CONST.LIST_COMPONENTS.HEADER}
                        onRetry={retryLoadNewerChatsError}
                    />
                )}
            </View>
        );
    }, [canShowHeader, retryLoadNewerChatsError, isConciergeProcessing, conciergeReasoningHistory]);

    const shouldShowSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = useMemo(() => {
        if (!shouldShowSkeleton) {
            return;
        }

        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }, [shouldShowSkeleton]);

    const renderTopReportActions = useCallback(() => {
        const previewItems = sortedVisibleReportActions.slice(initialNumToRender ? -initialNumToRender : 0).reverse();
        return (
            <>
                {!shouldShowReportRecipientLocalTime && !hideComposer ? <View style={[styles.stickToBottom, styles.appBG, styles.zIndex10, styles.height4]} /> : undefined}
                <View style={[styles.overflowScroll, styles.overflowXHidden, styles.pt4]}>
                    {previewItems.map((action) => (
                        <View key={action.reportActionID}>{renderItem({item: action, index: sortedVisibleReportActions.indexOf(action)} as ListRenderItemInfo<OnyxTypes.ReportAction>)}</View>
                    ))}
                </View>
            </>
        );
    }, [hideComposer, initialNumToRender, renderItem, shouldShowReportRecipientLocalTime, sortedVisibleReportActions, styles]);

    const onStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                <InvertedFlatList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={reportScrollManager.ref}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={sortedVisibleReportActions}
                    renderItem={renderItem}
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={[styles.chatContentScrollView, shouldFocusToTopOnMount ? styles.justifyContentEnd : undefined]}
                    shouldHideContent={shouldScrollToEndAfterLayout}
                    shouldDisableVisibleContentPosition={shouldScrollToEndAfterLayout}
                    showsVerticalScrollIndicator={!shouldScrollToEndAfterLayout}
                    keyExtractor={keyExtractor}
                    initialNumToRender={initialNumToRender}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={onStartReached}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={listHeaderComponent}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    onLayout={onLayoutInner}
                    onScroll={trackVerticalScrolling}
                    onViewableItemsChanged={onViewableItemsChanged}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    extraData={extraData}
                    key={listID}
                    shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScrollToTopThreshold}
                    initialScrollKey={reportActionID}
                    onContentSizeChange={() => {
                        trackVerticalScrolling(undefined);
                    }}
                />
            </View>
        </>
    );
}

export default memo(ReportActionsList);

export type {ReportActionsListProps};
