/* eslint-disable rulesdir/prefer-early-return */
import {useIsFocused, useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import FlatListWithScrollKey from '@components/FlatList/FlatListWithScrollKey';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import DateUtils from '@libs/DateUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, isActionVisibleOnMoneyRequestReport} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {
    getFilteredReportActionsForReportView,
    getFirstVisibleReportActionID,
    getOneTransactionThreadReportID,
    hasNextActionMadeBySameActor,
    isCurrentActionUnread,
    isDeletedParentAction,
    isIOUActionMatchingTransactionList,
    isMoneyRequestAction,
    isReportActionVisible,
    wasMessageReceivedWhileOffline,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID, getOriginalReportID, getReportLastVisibleActionCreated, isHarvestCreatedExpenseReport, isUnread} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import Visibility from '@libs/Visibility';
import isSearchTopmostFullScreenRoute from '@navigation/helpers/isSearchTopmostFullScreenRoute';
import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';
import getInitialNumToRender from '@pages/inbox/report/getInitialNumReportActionsToRender';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';
import {getUnreadMarkerReportAction} from '@pages/inbox/report/shouldDisplayNewMarkerOnReportAction';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import variables from '@styles/variables';
import {getOlderActions, openReport, readNewestAction, subscribeToNewActionEvent} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';
import MoneyRequestViewReportFields from './MoneyRequestViewReportFields';
import ReportActionsListLoadingSkeleton from './ReportActionsListLoadingSkeleton';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';
import SelectionToolbar from './SelectionToolbar';

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

function MoneyRequestReportActionsList({onLayout}: MoneyRequestReportListProps) {
    const styles = useThemeStyles();
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();
    const reportScrollManager = useReportScrollManager();
    const lastMessageTime = useRef<string | null>(null);
    const didLayout = useRef(false);
    const [isVisible, setIsVisible] = useState(Visibility.isVisible);
    const isFocused = useIsFocused();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportIDFromRoute = route.params.reportID;

    // Self-subscribe to report, policy, metadata, actions, transactions
    // report is guaranteed to exist — callers only render this component when report is loaded
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`) as unknown as [OnyxTypes.Report];
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const reportID = report?.reportID;

    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, route?.params?.reportActionID);
    const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);

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
    const newTransactions = useNewTransactions(reportMetadata?.hasOnceLoadedReportActions, reportTransactions);
    const showReportActionsLoadingState = reportMetadata?.isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions;
    const reportTransactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

    const linkedReportActionID = route?.params?.reportActionID;

    const parentReportAction = useParentReportAction(report);

    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {
        selector: tierNameSelector,
    });
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
    });
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const personalDetails = usePersonalDetails();
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    // reportActions is passed as an array because it's sorted chronologically for FlatList rendering and pagination.
    // However, getOriginalReportID expects the Onyx object format (keyed by reportActionID) for efficient lookups.
    const reportActionsObject = useMemo(() => {
        const obj: OnyxTypes.ReportActions = {};
        for (const action of reportActions) {
            obj[action.reportActionID] = action;
        }
        return obj;
    }, [reportActions]);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], false, reportTransactionIDs);
    const firstVisibleReportActionID = useMemo(() => getFirstVisibleReportActionID(reportActions, isOffline), [reportActions, isOffline]);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`);
    const shouldShowHarvestCreatedAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);
    const [enableScrollToEnd, setEnableScrollToEnd] = useState<boolean>(false);
    const [lastActionEventId, setLastActionEventId] = useState<string>('');

    // We are reversing actions because in this View we are starting at the top and don't use Inverted list
    const visibleReportActions = useMemo(() => {
        const filteredActions = reportActions.filter((reportAction) => {
            const isActionVisibleOnMoneyReport = isActionVisibleOnMoneyRequestReport(reportAction, shouldShowHarvestCreatedAction);
            if (!isActionVisibleOnMoneyReport) {
                return false;
            }

            const passesOfflineCheck = isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors;
            if (!passesOfflineCheck) {
                return false;
            }

            const actionReportID = reportAction.reportID ?? reportID;
            if (!isReportActionVisible(reportAction, actionReportID, canPerformWriteAction, visibleReportActionsData)) {
                return false;
            }

            if (!isIOUActionMatchingTransactionList(reportAction, reportTransactionIDs)) {
                return false;
            }

            return true;
        });

        return filteredActions.toReversed();
    }, [reportActions, isOffline, canPerformWriteAction, reportTransactionIDs, shouldShowHarvestCreatedAction, visibleReportActionsData, reportID]);

    const shouldShowOpenReportLoadingSkeleton = !isOffline && !!showReportActionsLoadingState && visibleReportActions.length === 0;
    const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyRequestReportActionsList',
        isOffline,
        showReportActionsLoadingState: !!showReportActionsLoadingState,
    };
    useEffect(() => {
        if (!shouldShowOpenReportLoadingSkeleton) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowOpenReportLoadingSkeleton]);

    const lastAction = visibleReportActions.at(-1);

    const {scrollOffsetRef} = useContext(ActionListContext);
    const scrollingVerticalBottomOffset = useRef(0);
    const scrollingVerticalTopOffset = useRef(0);
    const wrapperViewRef = useRef<View>(null);
    const readActionSkipped = useRef(false);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated;
    const userActiveSince = useRef<string>(DateUtils.getDBTime());

    const reportActionIDs = useMemo(() => {
        return reportActions?.map((action) => action.reportActionID) ?? [];
    }, [reportActions]);

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs: reportActionIDs,
        transactionThreadReport,
        hasOlderActions,
        hasNewerActions,
        newestFetchedReportActionID: reportMetadata?.newestFetchedReportActionID,
    });

    const hasFinishedInitialLoad = reportMetadata?.isLoadingInitialReportActions === false;
    const prevNewestFetchedIDRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (hasFinishedInitialLoad && hasNewerActions && reportActions.length > 0 && !isOffline && !reportMetadata?.isLoadingNewerReportActions) {
            // Safety guard: if the cursor hasn't advanced since the last call, the server
            // isn't returning new data. Stop to prevent an infinite request loop.
            const currentCursor = reportMetadata?.newestFetchedReportActionID;
            if (prevNewestFetchedIDRef.current !== undefined && prevNewestFetchedIDRef.current === currentCursor) {
                return;
            }
            prevNewestFetchedIDRef.current = currentCursor;
            loadNewerChats(false);
        }
    }, [hasFinishedInitialLoad, reportActions.length, hasNewerActions, isOffline, reportMetadata?.isLoadingNewerReportActions, reportMetadata?.newestFetchedReportActionID, loadNewerChats]);

    // Backfill loop: the backend prioritizes IOU actions in OpenReport/GetNewerActions for money
    // request reports, which can leave non-IOU chat messages in a gap between the IOU-biased cursor
    // and older messages. After auto-pagination finishes, walk backwards from the IOU cursor using
    // getOlderActions. Each response advances oldestFetchedReportActionID so the next call picks up
    // where the previous one left off, until the cursor stops advancing (gap filled).
    const prevBackfillCursorRef = useRef<string | undefined>(undefined);
    const isBackfillingRef = useRef(false);
    const prevBackfillReportIDRef = useRef(reportID);
    if (prevBackfillReportIDRef.current !== reportID) {
        prevBackfillReportIDRef.current = reportID;
        prevBackfillCursorRef.current = undefined;
        isBackfillingRef.current = false;
    }
    useEffect(() => {
        if (!hasFinishedInitialLoad || isOffline || hasNewerActions || reportMetadata?.isLoadingNewerReportActions || reportMetadata?.isLoadingOlderReportActions) {
            return;
        }

        if (!isBackfillingRef.current) {
            const hasIOUActions = reportActions.some((action) => isMoneyRequestAction(action));
            if (!hasIOUActions || reportActions.length < BACKFILL_MIN_ACTIONS_THRESHOLD || !reportMetadata?.newestFetchedReportActionID) {
                return;
            }
        }

        const cursor = isBackfillingRef.current ? reportMetadata?.oldestFetchedReportActionID : reportMetadata?.newestFetchedReportActionID;
        if (!cursor) {
            return;
        }

        if (prevBackfillCursorRef.current === cursor) {
            return;
        }

        isBackfillingRef.current = true;
        prevBackfillCursorRef.current = cursor;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const handle = InteractionManager.runAfterInteractions(() => getOlderActions(reportID, cursor));

        return () => handle.cancel();
    }, [
        hasFinishedInitialLoad,
        isOffline,
        hasNewerActions,
        reportMetadata?.isLoadingNewerReportActions,
        reportMetadata?.isLoadingOlderReportActions,
        reportMetadata?.newestFetchedReportActionID,
        reportMetadata?.oldestFetchedReportActionID,
        reportActions,
        reportID,
    ]);

    const onStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadOlderChats(false);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadOlderChats(false)));
    }, [loadOlderChats]);

    const onEndReached = useCallback(() => {
        loadNewerChats(false);
    }, [loadNewerChats]);

    const prevUnreadMarkerReportActionID = useRef<string | null>(null);

    const visibleActionsMap = useMemo(() => {
        return visibleReportActions.reduce((actionsMap, reportAction) => {
            Object.assign(actionsMap, {
                [reportAction.reportActionID]: reportAction,
            });
            return actionsMap;
        }, {} as OnyxTypes.ReportActions);
    }, [visibleReportActions]);
    const prevVisibleActionsMap = usePrevious(visibleActionsMap);

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

    useEffect(() => {
        const unsubscribe = Visibility.onVisibilityChange(() => {
            setIsVisible(Visibility.isVisible());
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (isUnread(report, transactionThreadReport, isReportArchived) || (lastAction && isCurrentActionUnread(report, lastAction, visibleReportActions))) {
            // On desktop, when the notification center is displayed, isVisible will return false.
            // Currently, there's no programmatic way to dismiss the notification center panel.
            // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
            const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
            if ((isVisible || isFromNotification) && scrollingVerticalBottomOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD) {
                readNewestAction(report.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
                if (isFromNotification) {
                    Navigation.setParams({referrer: undefined});
                }
            } else {
                readActionSkipped.current = true;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, report.reportID, isVisible, reportMetadata?.hasOnceLoadedReportActions]);

    useEffect(() => {
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

        const hasNewMessagesInView = scrollingVerticalBottomOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
        const hasUnreadReportAction = reportActions.some(
            (reportAction) => newMessageTimeReference && newMessageTimeReference < reportAction.created && reportAction.actorAccountID !== currentUserAccountID,
        );

        if (!hasNewMessagesInView || !hasUnreadReportAction) {
            return;
        }

        readNewestAction(report.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
        userActiveSince.current = DateUtils.getDBTime();

        // This effect logic to `mark as read` will only run when the report focused has new messages and the App visibility
        //  is changed to visible(meaning user switched to app/web, while user was previously using different tab or application).
        // We will mark the report as read in the above case which marks the LHN report item as read while showing the new message
        // marker for the chat messages received while the user wasn't focused on the report or on another browser tab for web.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, isVisible, reportMetadata?.hasOnceLoadedReportActions]);

    /**
     * The index of the earliest message that was received while offline
     */
    const earliestReceivedOfflineMessageIndex = useMemo(() => {
        const lastIndex = reportActions.findLastIndex((action) => {
            return wasMessageReceivedWhileOffline(action, isOffline, lastOfflineAt.current, lastOnlineAt.current, getLocalDateFromDatetime);
        });

        // The last index in the list is the earliest message that was received while offline
        return lastIndex > -1 ? lastIndex : undefined;
    }, [getLocalDateFromDatetime, isOffline, lastOfflineAt, lastOnlineAt, reportActions]);

    /**
     * The reportActionID the unread marker should display above
     */
    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex] = getUnreadMarkerReportAction({
        visibleReportActions,
        earliestReceivedOfflineMessageIndex,
        currentUserAccountID,
        prevSortedVisibleReportActionsObjects: prevVisibleActionsMap,
        unreadMarkerTime,
        scrollingVerticalOffset: scrollingVerticalBottomOffset.current,
        prevUnreadMarkerReportActionID: prevUnreadMarkerReportActionID.current,
        isOffline,
        isReversed: true,
    });
    prevUnreadMarkerReportActionID.current = unreadMarkerReportActionID;

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged} = useReportUnreadMessageScrollTracking({
        reportID: report.reportID,
        currentVerticalScrollingOffsetRef: scrollingVerticalBottomOffset,
        readActionSkippedRef: readActionSkipped,
        unreadMarkerReportActionIndex,
        isInverted: false,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const {layoutMeasurement, contentSize, contentOffset} = event.nativeEvent;
            const fullContentHeight = contentSize.height;

            /**
             * Count the diff between current scroll position and the bottom of the list.
             * Diff == (height of all items in the list) - (height of the layout with the list) - (how far user scrolled)
             */
            scrollingVerticalBottomOffset.current = fullContentHeight - layoutMeasurement.height - contentOffset.y;
            scrollOffsetRef.current = scrollingVerticalBottomOffset.current;

            // We additionally track the top offset to be able to scroll to the new transaction when it's added
            scrollingVerticalTopOffset.current = contentOffset.y;
        },
        hasOnceLoadedReportActions: !!reportMetadata?.hasOnceLoadedReportActions,
    });

    useScrollToEndOnNewMessageReceived({
        sizeChangeType: 'grewFromReportActions',
        scrollOffsetRef,
        lastActionID: lastAction?.reportActionID,
        visibleActionsLength: visibleReportActions.length,
        reportActionsLength: reportActions.length,
        hasNewestReportAction,
        setIsFloatingMessageCounterVisible,
        scrollToEnd: reportScrollManager.scrollToEnd,
    });

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
    }, [lastAction?.created, unreadMarkerReportActionID, unreadMarkerTime]);

    const scrollToBottomForCurrentUserAction = useCallback(
        (isFromCurrentUser: boolean, reportAction?: OnyxTypes.ReportAction) => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                setIsFloatingMessageCounterVisible(false);
                // If a new comment is added from the current user, scroll to the bottom, otherwise leave the user position unchanged
                if (!isFromCurrentUser || reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
                    return;
                }

                // We want to scroll to the end of the list where the newest message is
                // however scrollToEnd will not work correctly with items of variable sizes without `getItemLayout` - so we need to delay the scroll until every item rendered
                const index = visibleReportActions.findIndex((item) => item.reportActionID === reportAction?.reportActionID);
                if (index !== -1) {
                    setTimeout(() => {
                        reportScrollManager.scrollToEnd();
                    }, DELAY_FOR_SCROLLING_TO_END);
                } else {
                    setEnableScrollToEnd(true);
                    setLastActionEventId(reportAction?.reportActionID);
                }
            });
        },
        [reportScrollManager, setIsFloatingMessageCounterVisible, visibleReportActions],
    );

    useEffect(() => {
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
    }, [report.reportID]);

    useEffect(() => {
        const index = visibleReportActions.findIndex((item) => item.reportActionID === lastActionEventId);
        if (enableScrollToEnd && index !== -1) {
            setTimeout(() => {
                reportScrollManager.scrollToEnd();
            }, DELAY_FOR_SCROLLING_TO_END);
            setEnableScrollToEnd(false);
        }
    }, [visibleReportActions, lastActionEventId, enableScrollToEnd, reportScrollManager]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
            const displayAsGroup =
                !isConsecutiveChronosAutomaticTimerAction(visibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                hasNextActionMadeBySameActor(visibleReportActions, index, isOffline);

            const originalReportID = getOriginalReportID(report.reportID, reportAction, reportActionsObject);

            return (
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={EmptyParentReportActionForTransactionThread}
                    index={index}
                    report={report}
                    transactionThreadReport={transactionThreadReport}
                    displayAsGroup={displayAsGroup}
                    shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                    shouldDisplayReplyDivider={visibleReportActions.length > 1}
                    isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                    shouldHideThreadDividerLine
                    linkedReportActionID={linkedReportActionID}
                    userWalletTierName={userWalletTierName}
                    isUserValidated={isUserValidated}
                    personalDetails={personalDetails}
                    userBillingFundID={userBillingFundID}
                    originalReportID={originalReportID}
                    isReportArchived={isReportArchived}
                    isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                    reportNameValuePairsOrigin={reportNameValuePairs?.origin}
                    reportNameValuePairsOriginalID={reportNameValuePairs?.originalID}
                />
            );
        },
        [
            visibleReportActions,
            reportActionsObject,
            parentReportAction,
            report,
            isOffline,
            transactionThreadReport,
            unreadMarkerReportActionID,
            firstVisibleReportActionID,
            linkedReportActionID,
            userWalletTierName,
            isUserValidated,
            personalDetails,
            userBillingFundID,
            isTryNewDotNVPDismissed,
            isReportArchived,
            reportNameValuePairs?.origin,
            reportNameValuePairs?.originalID,
        ],
    );

    const scrollToBottomAndMarkReportAsRead = useCallback(() => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
            openReport({reportID: report.reportID, introSelected, betas});
            reportScrollManager.scrollToEnd();
            return;
        }

        reportScrollManager.scrollToEnd();
        readActionSkipped.current = false;
        readNewestAction(report.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
    }, [setIsFloatingMessageCounterVisible, hasNewestReportAction, reportScrollManager, report.reportID, reportMetadata?.hasOnceLoadedReportActions, introSelected, betas]);

    const scrollToNewTransaction = useCallback(
        (pageY: number) => {
            wrapperViewRef.current?.measureInWindow((x, y, w, height) => {
                // If the new transaction is already visible, we don't need to scroll to it
                if (pageY > 0 && pageY < height) {
                    return;
                }
                reportScrollManager.scrollToOffset(scrollingVerticalTopOffset.current + pageY - variables.scrollToNewTransactionOffset);
            });
        },
        [reportScrollManager],
    );

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = useCallback(() => {
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;

        markOpenReportEnd(report, {warm: !shouldShowOpenReportLoadingSkeleton});
    }, [report, shouldShowOpenReportLoadingSkeleton]);

    // Wrapped into useCallback to stabilize children re-renders
    const keyExtractor = useCallback((item: OnyxTypes.ReportAction) => item.reportActionID, []);

    const {windowHeight} = useWindowDimensions();
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

    return (
        <View
            style={[styles.flex1]}
            ref={wrapperViewRef}
        >
            <SelectionToolbar
                reportID={reportIDFromRoute}
                transactions={transactions}
                reportActions={reportActions}
            />
            <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                <FloatingMessageCounter
                    hasNewMessages={!!unreadMarkerReportActionID}
                    isActive={isFloatingMessageCounterVisible}
                    onClick={scrollToBottomAndMarkReportAsRead}
                />
                {isEmpty(visibleReportActions) && isEmpty(transactions) && !showReportActionsLoadingState ? (
                    <ScrollView contentContainerStyle={styles.flexGrow1}>
                        <MoneyRequestViewReportFields
                            report={report}
                            policy={policy}
                        />
                        <SearchMoneyRequestReportEmptyState
                            report={report}
                            onLayout={onLayout}
                            policy={policy}
                        />
                    </ScrollView>
                ) : (
                    <FlatListWithScrollKey
                        initialNumToRender={initialNumToRender}
                        accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                        testID="money-request-report-actions-list"
                        style={styles.overscrollBehaviorContain}
                        data={visibleReportActions}
                        renderItem={renderItem}
                        onViewableItemsChanged={onViewableItemsChanged}
                        keyExtractor={keyExtractor}
                        onLayout={recordTimeToMeasureItemLayout}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.75}
                        onStartReached={onStartReached}
                        onStartReachedThreshold={0.75}
                        ListHeaderComponent={
                            <>
                                <MoneyRequestViewReportFields
                                    report={report}
                                    policy={policy}
                                />
                                <MoneyRequestReportTransactionList
                                    report={report}
                                    onLayout={onLayout}
                                    transactions={transactions}
                                    newTransactions={newTransactions}
                                    hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                                    reportActions={reportActions}
                                    scrollToNewTransaction={scrollToNewTransaction}
                                    policy={policy}
                                    hasComments={visibleReportActions.length > 0}
                                    isLoadingInitialReportActions={showReportActionsLoadingState}
                                />
                            </>
                        }
                        keyboardShouldPersistTaps="handled"
                        onScroll={trackVerticalScrolling}
                        contentContainerStyle={[shouldUseNarrowLayout ? styles.pt4 : styles.pt3]}
                        ref={reportScrollManager.ref}
                        ListEmptyComponent={!isOffline && showReportActionsLoadingState ? <ReportActionsListLoadingSkeleton reasonAttributes={skeletonReasonAttributes} /> : undefined} // This skeleton component is only used for loading state, the empty state is handled by SearchMoneyRequestReportEmptyState
                        removeClippedSubviews={false}
                        initialScrollKey={linkedReportActionID}
                    />
                )}
            </View>
        </View>
    );
}

export default MoneyRequestReportActionsList;
