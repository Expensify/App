import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import {useIsFocused, useRoute} from '@react-navigation/native';
// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc} from 'lodash';
import React, {memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import InvertedFlatList from '@components/InvertedFlatList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/InvertedFlatList/BaseInvertedFlatList';
import {usePersonalDetails} from '@components/OnyxProvider';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isSafari} from '@libs/Browser';
import DateUtils from '@libs/DateUtils';
import {getChatFSAttributes, parseFSAttributes} from '@libs/Fullstory';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getFirstVisibleReportActionID,
    isConsecutiveActionMadeByPreviousActor,
    isConsecutiveChronosAutomaticTimerAction,
    isDeletedParentAction,
    isReportActionUnread,
    isReportPreviewAction,
    isReversedTransaction,
    isTransactionThread,
    shouldHideNewMarker,
    wasActionCreatedWhileOffline,
    wasActionTakenByCurrentUser,
} from '@libs/ReportActionsUtils';
import {
    canShowReportRecipientLocalTime,
    canUserPerformWriteAction,
    chatIncludesChronosWithID,
    getReportLastVisibleActionCreated,
    isArchivedNonExpenseReport,
    isCanceledTaskReport,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isTaskReport,
    isUnread,
} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {getCurrentUserAccountID, openReport, readNewestAction, subscribeToNewActionEvent} from '@userActions/Report';
import {PersonalDetailsContext} from '@src/components/OnyxProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import FloatingMessageCounter from './FloatingMessageCounter';
import getInitialNumToRender from './getInitialNumReportActionsToRender';
import ListBoundaryLoader from './ListBoundaryLoader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';

type LoadNewerChats = DebouncedFunc<(params: {distanceFromStart: number}) => void>;

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
};

const VERTICAL_OFFSET_THRESHOLD = 200;
const MSG_VISIBLE_THRESHOLD = 250;
const IS_CLOSE_TO_NEWEST_THRESHOLD = 15;

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
}: ReportActionsListProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetailsList = usePersonalDetails();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {preferredLocale} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportScrollManager = useReportScrollManager();
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);
    const [isVisible, setIsVisible] = useState(Visibility.isVisible);
    const isFocused = useIsFocused();

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});
    const participantsContext = useContext(PersonalDetailsContext);

    const [isScrollToBottomEnabled, setIsScrollToBottomEnabled] = useState(false);

    useEffect(() => {
        const unsubscriber = Visibility.onVisibilityChange(() => {
            setIsVisible(Visibility.isVisible());
        });

        return unsubscriber;
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

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.reportID]);

    const prevUnreadMarkerReportActionID = useRef<string | null>(null);
    /**
     * Whether a message is NOT from the active user and it was received while the user was offline.
     */
    const wasMessageReceivedWhileOffline = useCallback(
        (message: OnyxTypes.ReportAction) =>
            !wasActionTakenByCurrentUser(message) &&
            wasActionCreatedWhileOffline(message, isOffline, lastOfflineAt.current, lastOnlineAt.current, preferredLocale) &&
            !(message.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || message.isOptimisticAction),
        [isOffline, lastOfflineAt, lastOnlineAt, preferredLocale],
    );

    /**
     * The index of the earliest message that was received while offline
     */
    const earliestReceivedOfflineMessageIndex = useMemo(() => {
        // Create a list of (sorted) indices of message that were received while offline
        const receivedOfflineMessages = sortedReportActions.reduce<number[]>((acc, message, index) => {
            if (wasMessageReceivedWhileOffline(message)) {
                acc[index] = index;
            }

            return acc;
        }, []);

        // The last index in the list is the earliest message that was received while offline
        return receivedOfflineMessages.at(-1);
    }, [sortedReportActions, wasMessageReceivedWhileOffline]);

    /**
     * The reportActionID the unread marker should display above
     */
    const unreadMarkerReportActionID = useMemo(() => {
        const shouldDisplayNewMarker = (message: OnyxTypes.ReportAction, index: number): boolean => {
            const nextMessage = sortedVisibleReportActions.at(index + 1);
            const isNextMessageUnread = !!nextMessage && isReportActionUnread(nextMessage, unreadMarkerTime);

            // If the current message is the earliest message received while offline, we want to display the unread marker above this message.
            const isEarliestReceivedOfflineMessage = index === earliestReceivedOfflineMessageIndex;
            if (isEarliestReceivedOfflineMessage && !isNextMessageUnread) {
                return true;
            }

            // If the unread marker should be hidden or is not within the visible area, don't show the unread marker.
            if (shouldHideNewMarker(message)) {
                return false;
            }

            const isCurrentMessageUnread = isReportActionUnread(message, unreadMarkerTime);

            // If the current message is read or the next message is unread, don't show the unread marker.
            if (!isCurrentMessageUnread || isNextMessageUnread) {
                return false;
            }

            const isPendingAdd = (action: OnyxTypes.ReportAction) => {
                return action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
            };

            // If no unread marker exists, don't set an unread marker for newly added messages from the current user.
            const isFromCurrentUser = accountID === (isReportPreviewAction(message) ? message.childLastActorAccountID : message.actorAccountID);
            const isNewMessage = !prevSortedVisibleReportActionsObjects[message.reportActionID];

            // The unread marker will show if the action's `created` time is later than `unreadMarkerTime`.
            // The `unreadMarkerTime` has already been updated to match the optimistic action created time,
            // but once the new action is saved on the backend, the actual created time will be later than the optimistic one.
            // Therefore, we also need to prevent the unread marker from appearing for previously optimistic actions.
            const isPreviouslyOptimistic =
                (isPendingAdd(prevSortedVisibleReportActionsObjects[message.reportActionID]) && !isPendingAdd(message)) ||
                (!!prevSortedVisibleReportActionsObjects[message.reportActionID]?.isOptimisticAction && !message.isOptimisticAction);
            const shouldIgnoreUnreadForCurrentUserMessage = !prevUnreadMarkerReportActionID.current && isFromCurrentUser && (isNewMessage || isPreviouslyOptimistic);

            if (isFromCurrentUser) {
                return !shouldIgnoreUnreadForCurrentUserMessage;
            }

            return !isNewMessage || scrollingVerticalOffset.current >= MSG_VISIBLE_THRESHOLD;
        };

        // If there are message that were recevied while offline,
        // we can skip checking all messages later than the earliest recevied offline message.
        const startIndex = earliestReceivedOfflineMessageIndex ?? 0;

        // Scan through each visible report action until we find the appropriate action to show the unread marker
        for (let index = startIndex; index < sortedVisibleReportActions.length; index++) {
            const reportAction = sortedVisibleReportActions.at(index);

            // eslint-disable-next-line react-compiler/react-compiler
            if (reportAction && shouldDisplayNewMarker(reportAction, index)) {
                return reportAction.reportActionID;
            }
        }

        return null;
    }, [accountID, earliestReceivedOfflineMessageIndex, prevSortedVisibleReportActionsObjects, sortedVisibleReportActions, unreadMarkerTime]);
    prevUnreadMarkerReportActionID.current = unreadMarkerReportActionID;

    /**
     * Subscribe to read/unread events and update our unreadMarkerTime
     */
    useEffect(() => {
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
    }, [report.reportID]);

    /**
     * When the user reads a new message as it is received, we'll push the unreadMarkerTime down to the timestamp of
     * the latest report action. When new report actions are received and the user is not viewing them (they're above
     * the MSG_VISIBLE_THRESHOLD), the unread marker will display over those new messages rather than the initial
     * lastReadTime.
     */
    useLayoutEffect(() => {
        if (unreadMarkerReportActionID) {
            return;
        }

        const mostRecentReportActionCreated = lastAction?.created ?? '';
        if (mostRecentReportActionCreated <= unreadMarkerTime) {
            return;
        }

        setUnreadMarkerTime(mostRecentReportActionCreated);

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [lastAction?.created]);

    const lastActionIndex = lastAction?.reportActionID;
    const reportActionSize = useRef(sortedVisibleReportActions.length);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated;
    const hasNewestReportActionRef = useRef(hasNewestReportAction);
    // eslint-disable-next-line react-compiler/react-compiler
    hasNewestReportActionRef.current = hasNewestReportAction;
    const previousLastIndex = useRef(lastActionIndex);

    // Display the new message indicator when comment linking and not close to the newest message.
    const reportActionID = route?.params?.reportActionID;
    const indexOfLinkedAction = reportActionID ? sortedVisibleReportActions.findIndex((action) => action.reportActionID === reportActionID) : -1;
    const isLinkedActionCloseToNewest = indexOfLinkedAction < IS_CLOSE_TO_NEWEST_THRESHOLD;
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(!isLinkedActionCloseToNewest);

    useEffect(() => {
        if (isLinkedActionCloseToNewest) {
            return;
        }
        setIsFloatingMessageCounterVisible(true);
    }, [isLinkedActionCloseToNewest, route]);

    useEffect(() => {
        if (
            scrollingVerticalOffset.current < AUTOSCROLL_TO_TOP_THRESHOLD &&
            previousLastIndex.current !== lastActionIndex &&
            reportActionSize.current > sortedVisibleReportActions.length &&
            hasNewestReportAction
        ) {
            setIsFloatingMessageCounterVisible(false);
            reportScrollManager.scrollToBottom();
        }
        previousLastIndex.current = lastActionIndex;
        reportActionSize.current = sortedVisibleReportActions.length;
    }, [lastActionIndex, sortedVisibleReportActions, reportScrollManager, hasNewestReportAction, linkedReportActionID]);

    useEffect(() => {
        userActiveSince.current = DateUtils.getDBTime();
        prevReportID = report.reportID;
    }, [report.reportID]);

    useEffect(() => {
        if (report.reportID !== prevReportID) {
            return;
        }

        if (isUnread(report, transactionThreadReport)) {
            // On desktop, when the notification center is displayed, isVisible will return false.
            // Currently, there's no programmatic way to dismiss the notification center panel.
            // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
            const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
            if ((isVisible || isFromNotification) && scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD) {
                readNewestAction(report.reportID);
                if (isFromNotification) {
                    Navigation.setParams({referrer: undefined});
                }
            } else {
                readActionSkipped.current = true;
            }
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, report.reportID, isVisible]);

    useEffect(() => {
        if (linkedReportActionID) {
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            setIsFloatingMessageCounterVisible(false);
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
    }, [lastAction, prevSortedVisibleReportActionsObjects, reportScrollManager]);

    const scrollToBottomForCurrentUserAction = useCallback(
        (isFromCurrentUser: boolean) => {
            InteractionManager.runAfterInteractions(() => {
                setIsFloatingMessageCounterVisible(false);
                // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
                // they are now in the list.
                if (!isFromCurrentUser || (!isReportTopmostSplitNavigator() && !Navigation.getReportRHPActiveRoute())) {
                    return;
                }
                if (!hasNewestReportActionRef.current) {
                    if (Navigation.getReportRHPActiveRoute()) {
                        return;
                    }
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
                    return;
                }

                reportScrollManager.scrollToBottom();
                setIsScrollToBottomEnabled(true);
            });
        },
        [report.reportID, reportScrollManager],
    );
    useEffect(() => {
        // Why are we doing this, when in the cleanup of the useEffect we are already calling the unsubscribe function?
        // Answer: On web, when navigating to another report screen, the previous report screen doesn't get unmounted,
        //         meaning that the cleanup might not get called. When we then open a report we had open already previosuly, a new
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

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.reportID]);

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    const handleUnreadFloatingButton = () => {
        if (scrollingVerticalOffset.current > VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !!unreadMarkerReportActionID) {
            setIsFloatingMessageCounterVisible(true);
        }

        if (scrollingVerticalOffset.current < VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
            if (readActionSkipped.current) {
                readActionSkipped.current = false;
                readNewestAction(report.reportID);
            }
            setIsFloatingMessageCounterVisible(false);
        }
    };

    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollingVerticalOffset.current = event.nativeEvent.contentOffset.y;
        handleUnreadFloatingButton();
        onScroll?.(event);
    };

    const scrollToBottomAndMarkReportAsRead = useCallback(() => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
            openReport(report.reportID);
            reportScrollManager.scrollToBottom();
            return;
        }
        reportScrollManager.scrollToBottom();
        readActionSkipped.current = false;
        readNewestAction(report.reportID);
    }, [report.reportID, reportScrollManager, hasNewestReportAction]);

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

    useEffect(() => {
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

        const isArchivedReport = isArchivedNonExpenseReport(report, reportNameValuePairs);
        const hasNewMessagesInView = scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD;
        const hasUnreadReportAction = sortedVisibleReportActions.some(
            (reportAction) =>
                newMessageTimeReference &&
                newMessageTimeReference < reportAction.created &&
                (isReportPreviewAction(reportAction) ? reportAction.childLastActorAccountID : reportAction.actorAccountID) !== getCurrentUserAccountID(),
        );

        if (!isArchivedReport && (!hasNewMessagesInView || !hasUnreadReportAction)) {
            return;
        }

        readNewestAction(report.reportID);
        userActiveSince.current = DateUtils.getDBTime();

        // This effect logic to `mark as read` will only run when the report focused has new messages and the App visibility
        //  is changed to visible(meaning user switched to app/web, while user was previously using different tab or application).
        // We will mark the report as read in the above case which marks the LHN report item as read while showing the new message
        // marker for the chat messages received while the user wasn't focused on the report or on another browser tab for web.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isFocused, isVisible]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => (
            <ReportActionsListItemRenderer
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
            />
        ),
        [
            report,
            linkedReportActionID,
            sortedVisibleReportActions,
            mostRecentIOUReportActionID,
            shouldHideThreadDividerLine,
            parentReportAction,
            sortedReportActions,
            transactionThreadReport,
            parentReportActionForTransactionThread,
            shouldUseThreadDividerLine,
            firstVisibleReportActionID,
            unreadMarkerReportActionID,
        ],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = useMemo(
        () => [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined, isArchivedNonExpenseReport(report, reportNameValuePairs)],
        [unreadMarkerReportActionID, shouldUseNarrowLayout, report, reportNameValuePairs],
    );
    const hideComposer = !canUserPerformWriteAction(report);
    const shouldShowReportRecipientLocalTime = canShowReportRecipientLocalTime(personalDetailsList, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;
    const canShowHeader = isOffline || hasHeaderRendered.current;

    const onLayoutInner = useCallback(
        (event: LayoutChangeEvent) => {
            onLayout(event);
            if (isScrollToBottomEnabled) {
                reportScrollManager.scrollToBottom();
                setIsScrollToBottomEnabled(false);
            }
        },
        [isScrollToBottomEnabled, onLayout, reportScrollManager],
    );

    const retryLoadNewerChatsError = useCallback(() => {
        loadNewerChats(true);
    }, [loadNewerChats]);

    const listHeaderComponent = useMemo(() => {
        // In case of an error we want to display the header no matter what.
        if (!canShowHeader) {
            // eslint-disable-next-line react-compiler/react-compiler
            hasHeaderRendered.current = true;
            return null;
        }

        return (
            <ListBoundaryLoader
                type={CONST.LIST_COMPONENTS.HEADER}
                onRetry={retryLoadNewerChatsError}
            />
        );
    }, [canShowHeader, retryLoadNewerChatsError]);

    const shouldShowSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = useMemo(() => {
        if (!shouldShowSkeleton) {
            return;
        }

        return (
            <ReportActionsSkeletonView
                shouldAnimate={false}
                possibleVisibleContentItems={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 10}
            />
        );
    }, [shouldShowSkeleton]);

    const onStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadNewerChats(false)));
    }, [loadNewerChats]);

    const onEndReached = useCallback(() => {
        loadOlderChats(false);
    }, [loadOlderChats]);

    // Parse Fullstory attributes on initial render
    useLayoutEffect(parseFSAttributes, []);

    const [reportActionsListTestID, reportActionsListFSClass] = getChatFSAttributes(participantsContext, 'ReportActionsList', report);

    return (
        <>
            <FloatingMessageCounter
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <View
                style={[styles.flex1, !shouldShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}
                testID={reportActionsListTestID}
                nativeID={reportActionsListTestID}
                fsClass={reportActionsListFSClass}
            >
                <InvertedFlatList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={reportScrollManager.ref}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={sortedVisibleReportActions}
                    renderItem={renderItem}
                    contentContainerStyle={styles.chatContentScrollView}
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
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    extraData={extraData}
                    key={listID}
                    shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScrollToTopThreshold}
                    initialScrollKey={reportActionID}
                />
            </View>
        </>
    );
}

ReportActionsList.displayName = 'ReportActionsList';

export default memo(ReportActionsList);

export type {LoadNewerChats, ReportActionsListProps};
