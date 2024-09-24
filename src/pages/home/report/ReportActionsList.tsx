import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import {useIsFocused, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc} from 'lodash';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import InvertedFlatList from '@components/InvertedFlatList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/InvertedFlatList/BaseInvertedFlatList';
import {usePersonalDetails} from '@components/OnyxProvider';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import type {AuthScreensParamList} from '@navigation/types';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
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
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {isOffline} = useNetwork();
    const route = useRoute<RouteProp<AuthScreensParamList, typeof SCREENS.REPORT>>();
    const reportScrollManager = useReportScrollManager();
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);
    const [isVisible, setIsVisible] = useState(Visibility.isVisible());
    const isFocused = useIsFocused();

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID ?? -1}`);

    useEffect(() => {
        const unsubscriber = Visibility.onVisibilityChange(() => {
            setIsVisible(Visibility.isVisible());
        });

        return unsubscriber;
    }, []);

    const scrollingVerticalOffset = useRef(0);
    const readActionSkipped = useRef(false);
    const hasHeaderRendered = useRef(false);
    const hasFooterRendered = useRef(false);
    const linkedReportActionID = route?.params?.reportActionID ?? '-1';

    const sortedVisibleReportActions = useMemo(
        () =>
            sortedReportActions.filter(
                (reportAction) =>
                    (isOffline ||
                        ReportActionsUtils.isDeletedParentAction(reportAction) ||
                        reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                        reportAction.errors) &&
                    ReportActionsUtils.shouldReportActionBeVisible(reportAction),
            ),
        [sortedReportActions, isOffline],
    );

    /**
     * The timestamp for the unread marker.
     *
     * This should ONLY be updated when the user
     * - switches reports
     * - marks a message as read/unread
     * - reads a new message as it is received
     */
    const [unreadMarkerTime, setUnreadMarkerTime] = useState(report.lastReadTime ?? '');
    useEffect(() => {
        setUnreadMarkerTime(report.lastReadTime ?? '');

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.reportID]);

    /**
     * The reportActionID the unread marker should display above
     */
    const unreadMarkerReportActionID = useMemo(() => {
        const shouldDisplayNewMarker = (reportAction: OnyxTypes.ReportAction, index: number): boolean => {
            const nextMessage = sortedVisibleReportActions[index + 1];
            const isCurrentMessageUnread = isMessageUnread(reportAction, unreadMarkerTime);
            const isNextMessageRead = !nextMessage || !isMessageUnread(nextMessage, unreadMarkerTime);
            const shouldDisplay = isCurrentMessageUnread && isNextMessageRead && !ReportActionsUtils.shouldHideNewMarker(reportAction);
            const isWithinVisibleThreshold = scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD ? reportAction.created < (userActiveSince.current ?? '') : true;
            return shouldDisplay && isWithinVisibleThreshold;
        };

        // Scan through each visible report action until we find the appropriate action to show the unread marker
        for (let index = 0; index < sortedVisibleReportActions.length; index++) {
            const reportAction = sortedVisibleReportActions[index];
            if (shouldDisplayNewMarker(reportAction, index)) {
                return reportAction.reportActionID;
            }
        }

        return null;
    }, [sortedVisibleReportActions, unreadMarkerTime]);

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
    useEffect(() => {
        if (unreadMarkerReportActionID) {
            return;
        }

        const mostRecentReportActionCreated = sortedVisibleReportActions[0]?.created ?? '';
        if (mostRecentReportActionCreated === unreadMarkerTime) {
            return;
        }

        setUnreadMarkerTime(mostRecentReportActionCreated);

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [sortedVisibleReportActions]);

    const lastActionIndex = sortedVisibleReportActions[0]?.reportActionID;
    const reportActionSize = useRef(sortedVisibleReportActions.length);
    const hasNewestReportAction = sortedVisibleReportActions[0]?.created === report.lastVisibleActionCreated;
    const hasNewestReportActionRef = useRef(hasNewestReportAction);
    hasNewestReportActionRef.current = hasNewestReportAction;
    const previousLastIndex = useRef(lastActionIndex);

    const isLastPendingActionIsDelete = sortedReportActions?.[0]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);

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
        userActiveSince.current = DateUtils.getDBTime();
        prevReportID = report.reportID;
    }, [report.reportID]);

    useEffect(() => {
        if (report.reportID !== prevReportID) {
            return;
        }

        if (ReportUtils.isUnread(report)) {
            // On desktop, when the notification center is displayed, isVisible will return false.
            // Currently, there's no programmatic way to dismiss the notification center panel.
            // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
            const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
            if ((isVisible || isFromNotification) && scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD) {
                Report.readNewestAction(report.reportID);
                if (isFromNotification) {
                    Navigation.setParams({referrer: undefined});
                }
            } else {
                readActionSkipped.current = true;
            }
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.lastVisibleActionCreated, report.reportID, isVisible]);

    useEffect(() => {
        if (linkedReportActionID) {
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const scrollToBottomForCurrentUserAction = useCallback(
        (isFromCurrentUser: boolean) => {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
            // they are now in the list.
            if (!isFromCurrentUser) {
                return;
            }
            if (!hasNewestReportActionRef.current) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
                return;
            }
            InteractionManager.runAfterInteractions(() => reportScrollManager.scrollToBottom());
        },
        [reportScrollManager, report.reportID],
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
        (): boolean => ReportActionsUtils.getFirstVisibleReportActionID(sortedReportActions, isOffline) === unreadMarkerReportActionID,
        [sortedReportActions, isOffline, unreadMarkerReportActionID],
    );

    const firstVisibleReportActionID = useMemo(() => ReportActionsUtils.getFirstVisibleReportActionID(sortedReportActions, isOffline), [sortedReportActions, isOffline]);

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

        return ReportUtils.isExpenseReport(report) || ReportUtils.isIOUReport(report) || ReportUtils.isInvoiceReport(report);
    }, [parentReportAction, report, sortedVisibleReportActions]);

    useEffect(() => {
        if (report.reportID !== prevReportID) {
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

        const isArchivedReport = ReportUtils.isArchivedRoom(report);
        const hasNewMessagesInView = scrollingVerticalOffset.current < MSG_VISIBLE_THRESHOLD;
        const hasUnreadReportAction = sortedVisibleReportActions.some(
            (reportAction) =>
                newMessageTimeReference &&
                newMessageTimeReference < reportAction.created &&
                (ReportActionsUtils.isReportPreviewAction(reportAction) ? reportAction.childLastActorAccountID : reportAction.actorAccountID) !== Report.getCurrentUserAccountID(),
        );

        if (!isArchivedReport && (!hasNewMessagesInView || !hasUnreadReportAction)) {
            return;
        }

        Report.readNewestAction(report.reportID);
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
            reportActions,
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
        () => [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined, ReportUtils.isArchivedRoom(report, reportNameValuePairs)],
        [unreadMarkerReportActionID, shouldUseNarrowLayout, report, reportNameValuePairs],
    );
    const hideComposer = !ReportUtils.canUserPerformWriteAction(report);
    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(personalDetailsList, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;
    const canShowHeader = isOffline || hasHeaderRendered.current;

    const contentContainerStyle: StyleProp<ViewStyle> = useMemo(
        () => [styles.chatContentScrollView, isLoadingNewerReportActions && canShowHeader ? styles.chatContentScrollViewWithHeaderLoader : {}],
        [isLoadingNewerReportActions, styles.chatContentScrollView, styles.chatContentScrollViewWithHeaderLoader, canShowHeader],
    );

    const lastReportAction: OnyxTypes.ReportAction | undefined = useMemo(() => sortedReportActions.at(-1) ?? undefined, [sortedReportActions]);

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
                lastReportActionName={lastReportAction?.actionName}
                hasError={hasLoadingOlderReportActionsError}
                onRetry={retryLoadOlderChatsError}
            />
        );
    }, [isLoadingInitialReportActions, isLoadingOlderReportActions, lastReportAction?.actionName, isOffline, hasLoadingOlderReportActionsError, retryLoadOlderChatsError]);

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
        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadNewerChats(false)));
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
                isActive={(isFloatingMessageCounterVisible && !!unreadMarkerReportActionID) || canScrollToNewerComments}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <View style={[styles.flex1, !shouldShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}>
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
            </View>
        </>
    );
}

ReportActionsList.displayName = 'ReportActionsList';

export default withCurrentUserPersonalDetails(memo(ReportActionsList));

export type {LoadNewerChats, ReportActionsListProps};
