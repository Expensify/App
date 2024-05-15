import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import {useIsFocused, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {DebouncedFunc} from 'lodash';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter, InteractionManager} from 'react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import InvertedFlatList from '@components/InvertedFlatList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/InvertedFlatList/BaseInvertedFlatList';
import {usePersonalDetails} from '@components/OnyxProvider';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import FloatingMessageCounter from './FloatingMessageCounter';
import getInitialNumToRender from './getInitialNumReportActionsToRender';
import ListBoundaryLoader from './ListBoundaryLoader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';

type LoadNewerChats = DebouncedFunc<(params: {distanceFromStart: number}) => void>;

type ReportActionsListProps = WithCurrentUserPersonalDetailsProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Array of report actions for the current report */
    reportActions: OnyxTypes.ReportAction[];

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction thread report's parentReportAction */
    parentReportActionForTransactionThread: OnyxEntry<OnyxTypes.ReportAction>;

    /** Sorted actions prepared for display */
    sortedReportActions: OnyxTypes.ReportAction[];

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID?: string | null;

    /** The report metadata loading states */
    isLoadingInitialReportActions?: boolean;

    /** Are we loading more report actions? */
    isLoadingOlderReportActions?: boolean;

    /** Was there an error when loading older report actions? */
    hasLoadingOlderReportActionsError?: boolean;

    /** Are we loading newer report actions? */
    isLoadingNewerReportActions?: boolean;

    /** Was there an error when loading newer report actions? */
    hasLoadingNewerReportActionsError?: boolean;

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

    /** Callback executed on content size change */
    onContentSizeChange: (w: number, h: number) => void;

    /** Should enable auto scroll to top threshold */
    shouldEnableAutoScrollToTopThreshold?: boolean;
};

const VERTICAL_OFFSET_THRESHOLD = 200;
const MSG_VISIBLE_THRESHOLD = 250;

// In the component we are subscribing to the arrival of new actions.
// As there is the possibility that there are multiple instances of a ReportScreen
// for the same report, we only ever want one subscription to be active, as
// the subscriptions could otherwise be conflicting.
const newActionUnsubscribeMap: Record<string, () => void> = {};

// Caching the reportID and reportActionID for unread markers ensures persistent tracking
// across multiple reports, preserving the green line placement and allowing retrieval
// of the relevant reportActionID for displaying the green line.
// We need to persist it across reports because there are at least 3 ReportScreen components created so the
// internal states are resetted or recreated.
const cacheUnreadMarkers = new Map<string, string>();

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

function isMessageUnread(message: OnyxTypes.ReportAction, lastReadTime?: string): boolean {
    if (!lastReadTime) {
        return !ReportActionsUtils.isCreatedAction(message);
    }

    return !!(message && lastReadTime && message.created && lastReadTime < message.created);
}

const onScrollToIndexFailed = () => {};

function ReportActionsList({
    report,
    transactionThreadReport,
    reportActions = [],
    parentReportAction,
    isLoadingInitialReportActions = false,
    isLoadingOlderReportActions = false,
    hasLoadingOlderReportActionsError = false,
    isLoadingNewerReportActions = false,
    hasLoadingNewerReportActionsError = false,
    sortedReportActions,
    onScroll,
    mostRecentIOUReportActionID = '',
    currentUserPersonalDetails,
    loadNewerChats,
    loadOlderChats,
    onLayout,
    isComposerFullSize,
    listID,
    onContentSizeChange,
    shouldEnableAutoScrollToTopThreshold,
    parentReportActionForTransactionThread,
}: ReportActionsListProps) {
    const personalDetailsList = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const route = useRoute<RouteProp<CentralPaneNavigatorParamList, typeof SCREENS.REPORT>>();
    const opacity = useSharedValue(0);
    const reportScrollManager = useReportScrollManager();
    const userActiveSince = useRef<string | null>(null);
    const lastMessageTime = useRef<string | null>(null);

    const [isVisible, setIsVisible] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        const unsubscriber = Visibility.onVisibilityChange(() => {
            setIsVisible(Visibility.isVisible());
        });

        return unsubscriber;
    }, []);

    const markerInit = () => {
        if (!cacheUnreadMarkers.has(report.reportID)) {
            return null;
        }
        return cacheUnreadMarkers.get(report.reportID);
    };
    const [currentUnreadMarker, setCurrentUnreadMarker] = useState(markerInit);
    const scrollingVerticalOffset = useRef(0);
    const readActionSkipped = useRef(false);
    const hasHeaderRendered = useRef(false);
    const hasFooterRendered = useRef(false);
    const lastVisibleActionCreatedRef = useRef(report.lastVisibleActionCreated);
    const lastReadTimeRef = useRef(report.lastReadTime);

    const sortedVisibleReportActions = useMemo(
        () =>
            sortedReportActions.filter(
                (reportAction) =>
                    (isOffline ||
                        ReportActionsUtils.isDeletedParentAction(reportAction) ||
                        reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                        reportAction.errors) &&
                    ReportActionsUtils.shouldReportActionBeVisible(reportAction, reportAction.reportActionID),
            ),
        [sortedReportActions, isOffline],
    );
    const lastActionIndex = sortedVisibleReportActions[0]?.reportActionID;
    const reportActionSize = useRef(sortedVisibleReportActions.length);
    const hasNewestReportAction = sortedVisibleReportActions?.[0]?.created === report.lastVisibleActionCreated;
    const hasNewestReportActionRef = useRef(hasNewestReportAction);
    hasNewestReportActionRef.current = hasNewestReportAction;
    const previousLastIndex = useRef(lastActionIndex);

    const isLastPendingActionIsDelete = sortedReportActions?.[0]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const linkedReportActionID = route.params?.reportActionID ?? '';

    // This state is used to force a re-render when the user manually marks a message as unread
    // by using a timestamp you can force re-renders without having to worry about if another message was marked as unread before
    const [messageManuallyMarkedUnread, setMessageManuallyMarkedUnread] = useState(0);
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);
    const animatedStyles = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    useEffect(() => {
        opacity.value = withTiming(1, {duration: 100});
    }, [opacity]);

    useEffect(() => {
        if (
            scrollingVerticalOffset.current < AUTOSCROLL_TO_TOP_THRESHOLD &&
            previousLastIndex.current !== lastActionIndex &&
            reportActionSize.current > sortedVisibleReportActions.length &&
            hasNewestReportAction
        ) {
            reportScrollManager.scrollToBottom();
        }
        previousLastIndex.current = lastActionIndex;
        reportActionSize.current = sortedVisibleReportActions.length;
    }, [lastActionIndex, sortedVisibleReportActions, reportScrollManager, hasNewestReportAction, linkedReportActionID]);

    useEffect(() => {
        // If the reportID changes, we reset the userActiveSince to null, we need to do it because
        // the parent component is sending the previous reportID even when the user isn't active
        // on the report
        if (userActiveSince.current && prevReportID && prevReportID !== report.reportID) {
            userActiveSince.current = null;
        } else {
            userActiveSince.current = DateUtils.getDBTime();
        }
        prevReportID = report.reportID;
    }, [report.reportID]);

    useEffect(() => {
        if (!userActiveSince.current || report.reportID !== prevReportID) {
            return;
        }
        if (ReportUtils.isUnread(report)) {
            // On desktop, when the notification center is displayed, Visibility.isVisible() will return false.
            // Currently, there's no programmatic way to dismiss the notification center panel.
            // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
            const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
            if ((Visibility.isVisible() || isFromNotification) && scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD) {
                Report.readNewestAction(report.reportID);
                Navigation.setParams({referrer: undefined});
            } else {
                readActionSkipped.current = true;
            }
        }

        if (!!currentUnreadMarker || lastVisibleActionCreatedRef.current === report.lastVisibleActionCreated) {
            return;
        }

        cacheUnreadMarkers.delete(report.reportID);
        lastVisibleActionCreatedRef.current = report.lastVisibleActionCreated;
        setCurrentUnreadMarker(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastVisibleActionCreated, report.reportID]);

    useEffect(() => {
        if (!userActiveSince.current || report.reportID !== prevReportID) {
            return;
        }
        if (!messageManuallyMarkedUnread && (lastReadTimeRef.current ?? '') < (report.lastReadTime ?? '')) {
            cacheUnreadMarkers.delete(report.reportID);
        }
        lastReadTimeRef.current = report.lastReadTime;
        setMessageManuallyMarkedUnread(0);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastReadTime, report.reportID]);

    useEffect(() => {
        const resetUnreadMarker = (newLastReadTime: string) => {
            cacheUnreadMarkers.delete(report.reportID);
            lastReadTimeRef.current = newLastReadTime;
            setCurrentUnreadMarker(null);
        };

        const unreadActionSubscription = DeviceEventEmitter.addListener(`unreadAction_${report.reportID}`, (newLastReadTime) => {
            resetUnreadMarker(newLastReadTime);
            setMessageManuallyMarkedUnread(new Date().getTime());
        });

        const readNewestActionSubscription = DeviceEventEmitter.addListener(`readNewestAction_${report.reportID}`, (newLastReadTime) => {
            resetUnreadMarker(newLastReadTime);
            setMessageManuallyMarkedUnread(0);
        });

        const deletedReportActionSubscription = DeviceEventEmitter.addListener(`deletedReportAction_${report.reportID}`, (reportActionID) => {
            if (cacheUnreadMarkers.get(report.reportID) !== reportActionID) {
                return;
            }

            setMessageManuallyMarkedUnread(new Date().getTime());
        });

        return () => {
            unreadActionSubscription.remove();
            readNewestActionSubscription.remove();
            deletedReportActionSubscription.remove();
        };
    }, [report.reportID]);

    useEffect(() => {
        if (linkedReportActionID) {
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scrollToBottomForCurrentUserAction = useCallback(
        (isFromCurrentUser: boolean) => {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
            // they are now in the list.
            if (!isFromCurrentUser || !hasNewestReportActionRef.current) {
                return;
            }
            InteractionManager.runAfterInteractions(() => reportScrollManager.scrollToBottom());
        },
        [reportScrollManager],
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
        const unsubscribe = Report.subscribeToNewActionEvent(report.reportID, scrollToBottomForCurrentUserAction);

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

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    const handleUnreadFloatingButton = () => {
        if (scrollingVerticalOffset.current > VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !!currentUnreadMarker) {
            setIsFloatingMessageCounterVisible(true);
        }

        if (scrollingVerticalOffset.current < VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
            if (readActionSkipped.current) {
                readActionSkipped.current = false;
                Report.readNewestAction(report.reportID);
            }
            setIsFloatingMessageCounterVisible(false);
        }
    };

    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollingVerticalOffset.current = event.nativeEvent.contentOffset.y;
        handleUnreadFloatingButton();
        onScroll?.(event);
    };

    const scrollToBottomAndMarkReportAsRead = () => {
        if (!hasNewestReportAction) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
            Report.openReport(report.reportID);
            return;
        }
        reportScrollManager.scrollToBottom();
        readActionSkipped.current = false;
        Report.readNewestAction(report.reportID);
    };

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
        (): boolean => ReportActionsUtils.getFirstVisibleReportActionID(sortedReportActions, isOffline) === currentUnreadMarker,
        [sortedReportActions, isOffline, currentUnreadMarker],
    );

    const firstVisibleReportActionID = useMemo(() => ReportActionsUtils.getFirstVisibleReportActionID(sortedReportActions, isOffline), [sortedReportActions, isOffline]);

    /**
     * Evaluate new unread marker visibility for each of the report actions.
     */
    const shouldDisplayNewMarker = useCallback(
        (reportAction: OnyxTypes.ReportAction, index: number): boolean => {
            let shouldDisplay = false;
            if (!currentUnreadMarker) {
                const nextMessage = sortedVisibleReportActions[index + 1];
                const isCurrentMessageUnread = isMessageUnread(reportAction, lastReadTimeRef.current);
                shouldDisplay = isCurrentMessageUnread && (!nextMessage || !isMessageUnread(nextMessage, lastReadTimeRef.current)) && !ReportActionsUtils.shouldHideNewMarker(reportAction);
                if (shouldDisplay && !messageManuallyMarkedUnread) {
                    const isWithinVisibleThreshold = scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD ? reportAction.created < (userActiveSince.current ?? '') : true;
                    // Prevent displaying a new marker line when report action is of type "REPORT_PREVIEW" and last actor is the current user
                    shouldDisplay =
                        (ReportActionsUtils.isReportPreviewAction(reportAction) ? !reportAction.childLastActorAccountID : reportAction.actorAccountID) !== Report.getCurrentUserAccountID() &&
                        isWithinVisibleThreshold;
                }
                if (shouldDisplay) {
                    cacheUnreadMarkers.set(report.reportID, reportAction.reportActionID);
                }
            } else {
                shouldDisplay = reportAction.reportActionID === currentUnreadMarker;
            }

            return shouldDisplay;
        },
        [currentUnreadMarker, sortedVisibleReportActions, report.reportID, messageManuallyMarkedUnread],
    );

    const shouldUseThreadDividerLine = useMemo(() => {
        const topReport = sortedVisibleReportActions.length > 0 ? sortedVisibleReportActions[sortedVisibleReportActions.length - 1] : null;

        if (topReport && topReport.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return false;
        }

        if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
            return !ReportActionsUtils.isDeletedParentAction(parentReportAction) && !ReportActionsUtils.isReversedTransaction(parentReportAction);
        }

        if (ReportUtils.isTaskReport(report)) {
            return !ReportUtils.isCanceledTaskReport(report, parentReportAction);
        }

        return ReportUtils.isExpenseReport(report) || ReportUtils.isIOUReport(report);
    }, [parentReportAction, report, sortedVisibleReportActions]);

    const calculateUnreadMarker = useCallback(() => {
        // Iterate through the report actions and set appropriate unread marker.
        // This is to avoid a warning of:
        // Cannot update a component (ReportActionsList) while rendering a different component (CellRenderer).
        let markerFound = false;
        sortedVisibleReportActions.forEach((reportAction, index) => {
            if (!shouldDisplayNewMarker(reportAction, index)) {
                return;
            }
            markerFound = true;
            if (!currentUnreadMarker && currentUnreadMarker !== reportAction.reportActionID) {
                cacheUnreadMarkers.set(report.reportID, reportAction.reportActionID);
                setCurrentUnreadMarker(reportAction.reportActionID);
            }
        });
        if (!markerFound && !linkedReportActionID) {
            setCurrentUnreadMarker(null);
        }
    }, [sortedVisibleReportActions, report.reportID, shouldDisplayNewMarker, currentUnreadMarker, linkedReportActionID]);

    useEffect(() => {
        calculateUnreadMarker();
    }, [calculateUnreadMarker, report.lastReadTime, messageManuallyMarkedUnread]);

    useEffect(() => {
        if (!userActiveSince.current || report.reportID !== prevReportID) {
            return;
        }

        if (!isVisible || !isFocused) {
            if (!lastMessageTime.current) {
                lastMessageTime.current = sortedVisibleReportActions[0]?.created ?? '';
            }
            return;
        }

        // In case the user read new messages (after being inactive) with other device we should
        // show marker based on report.lastReadTime
        const newMessageTimeReference = lastMessageTime.current && report.lastReadTime && lastMessageTime.current > report.lastReadTime ? userActiveSince.current : report.lastReadTime;
        lastMessageTime.current = null;
        if (
            scrollingVerticalOffset.current >= MSG_VISIBLE_THRESHOLD ||
            !(
                sortedVisibleReportActions &&
                sortedVisibleReportActions.some(
                    (reportAction) =>
                        newMessageTimeReference &&
                        newMessageTimeReference < reportAction.created &&
                        (ReportActionsUtils.isReportPreviewAction(reportAction) ? reportAction.childLastActorAccountID : reportAction.actorAccountID) !== Report.getCurrentUserAccountID(),
                )
            )
        ) {
            return;
        }

        Report.readNewestAction(report.reportID);
        userActiveSince.current = DateUtils.getDBTime();
        lastReadTimeRef.current = newMessageTimeReference;
        setCurrentUnreadMarker(null);
        cacheUnreadMarkers.delete(report.reportID);
        calculateUnreadMarker();

        // This effect logic to `mark as read` will only run when the report focused has new messages and the App visibility
        //  is changed to visible(meaning user switched to app/web, while user was previously using different tab or application).
        // We will mark the report as read in the above case which marks the LHN report item as read while showing the new message
        // marker for the chat messages received while the user wasn't focused on the report or on another browser tab for web.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, isVisible]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => (
            <ReportActionsListItemRenderer
                reportAction={reportAction}
                reportActions={reportActions}
                parentReportAction={parentReportAction}
                parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                index={index}
                report={report}
                transactionThreadReport={transactionThreadReport}
                linkedReportActionID={linkedReportActionID}
                displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(sortedVisibleReportActions, index)}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                shouldDisplayNewMarker={shouldDisplayNewMarker(reportAction, index)}
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
            shouldDisplayNewMarker,
            parentReportAction,
            reportActions,
            transactionThreadReport,
            parentReportActionForTransactionThread,
            shouldUseThreadDividerLine,
            firstVisibleReportActionID,
        ],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = useMemo(() => [isSmallScreenWidth ? currentUnreadMarker : undefined, ReportUtils.isArchivedRoom(report)], [currentUnreadMarker, isSmallScreenWidth, report]);
    const hideComposer = !ReportUtils.canUserPerformWriteAction(report);
    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(personalDetailsList, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;
    const canShowHeader = !isOffline && !hasHeaderRendered.current && scrollingVerticalOffset.current > VERTICAL_OFFSET_THRESHOLD;

    const contentContainerStyle: StyleProp<ViewStyle> = useMemo(
        () => [styles.chatContentScrollView, isLoadingNewerReportActions && canShowHeader ? styles.chatContentScrollViewWithHeaderLoader : {}],
        [isLoadingNewerReportActions, styles.chatContentScrollView, styles.chatContentScrollViewWithHeaderLoader, canShowHeader],
    );

    const lastReportAction: OnyxTypes.ReportAction | EmptyObject = useMemo(() => sortedReportActions.at(-1) ?? {}, [sortedReportActions]);

    const retryLoadOlderChatsError = useCallback(() => {
        loadOlderChats(true);
    }, [loadOlderChats]);

    const listFooterComponent = useMemo(() => {
        // Skip this hook on the first render (when online), as we are not sure if more actions are going to be loaded,
        // Therefore showing the skeleton on footer might be misleading.
        // When offline, there should be no second render, so we should show the skeleton if the corresponding loading prop is present.
        // In case of an error we want to display the footer no matter what.
        if (!isOffline && !hasFooterRendered.current && !hasLoadingOlderReportActionsError) {
            hasFooterRendered.current = true;
            return null;
        }

        return (
            <ListBoundaryLoader
                type={CONST.LIST_COMPONENTS.FOOTER}
                isLoadingOlderReportActions={isLoadingOlderReportActions}
                isLoadingInitialReportActions={isLoadingInitialReportActions}
                lastReportActionName={lastReportAction.actionName}
                hasError={hasLoadingOlderReportActionsError}
                onRetry={retryLoadOlderChatsError}
            />
        );
    }, [isLoadingInitialReportActions, isLoadingOlderReportActions, lastReportAction.actionName, isOffline, hasLoadingOlderReportActionsError, retryLoadOlderChatsError]);

    const onLayoutInner = useCallback(
        (event: LayoutChangeEvent) => {
            onLayout(event);
        },
        [onLayout],
    );
    const onContentSizeChangeInner = useCallback(
        (w: number, h: number) => {
            onContentSizeChange(w, h);
        },
        [onContentSizeChange],
    );

    const retryLoadNewerChatsError = useCallback(() => {
        loadNewerChats(true);
    }, [loadNewerChats]);

    const listHeaderComponent = useMemo(() => {
        // In case of an error we want to display the header no matter what.
        if (!canShowHeader && !hasLoadingNewerReportActionsError) {
            hasHeaderRendered.current = true;
            return null;
        }

        return (
            <ListBoundaryLoader
                type={CONST.LIST_COMPONENTS.HEADER}
                isLoadingNewerReportActions={isLoadingNewerReportActions}
                hasError={hasLoadingNewerReportActionsError}
                onRetry={retryLoadNewerChatsError}
            />
        );
    }, [isLoadingNewerReportActions, canShowHeader, hasLoadingNewerReportActionsError, retryLoadNewerChatsError]);

    const onStartReached = useCallback(() => {
        loadNewerChats(false);
    }, [loadNewerChats]);

    const onEndReached = useCallback(() => {
        loadOlderChats(false);
    }, [loadOlderChats]);

    // When performing comment linking, initially 25 items are added to the list. Subsequent fetches add 15 items from the cache or 50 items from the server.
    // This is to ensure that the user is able to see the 'scroll to newer comments' button when they do comment linking and have not reached the end of the list yet.
    const canScrollToNewerComments = !isLoadingInitialReportActions && !hasNewestReportAction && sortedReportActions.length > 25 && !isLastPendingActionIsDelete;
    return (
        <>
            <FloatingMessageCounter
                isActive={(isFloatingMessageCounterVisible && !!currentUnreadMarker) || canScrollToNewerComments}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <Animated.View style={[animatedStyles, styles.flex1, !shouldShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}>
                <InvertedFlatList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={reportScrollManager.ref}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={sortedVisibleReportActions}
                    renderItem={renderItem}
                    contentContainerStyle={contentContainerStyle}
                    keyExtractor={keyExtractor}
                    initialNumToRender={initialNumToRender}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={onStartReached}
                    onStartReachedThreshold={0.75}
                    ListFooterComponent={listFooterComponent}
                    ListHeaderComponent={listHeaderComponent}
                    keyboardShouldPersistTaps="handled"
                    onLayout={onLayoutInner}
                    onContentSizeChange={onContentSizeChangeInner}
                    onScroll={trackVerticalScrolling}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    extraData={extraData}
                    key={listID}
                    shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScrollToTopThreshold}
                />
            </Animated.View>
        </>
    );
}

ReportActionsList.displayName = 'ReportActionsList';

export default withCurrentUserPersonalDetails(memo(ReportActionsList));

export type {LoadNewerChats, ReportActionsListProps};
