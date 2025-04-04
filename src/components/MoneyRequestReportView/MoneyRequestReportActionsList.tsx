import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FlatList from '@components/FlatList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/InvertedFlatList/BaseInvertedFlatList';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isActionVisibleOnMoneyRequestReport} from '@libs/MoneyRequestReportUtils';
import {
    getFirstVisibleReportActionID,
    getIOUActionForTransactionID,
    getMostRecentIOURequestActionID,
    getOneTransactionThreadReportID,
    hasNextActionMadeBySameActor,
    isConsecutiveChronosAutomaticTimerAction,
    isDeletedParentAction,
    isReportActionUnread,
    isReportPreviewAction,
    shouldHideNewMarker,
    shouldReportActionBeVisible,
    wasMessageReceivedWhileOffline,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID, getReportLastVisibleActionCreated} from '@libs/ReportUtils';
import isSearchTopmostFullScreenRoute from '@navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@navigation/Navigation';
import FloatingMessageCounter from '@pages/home/report/FloatingMessageCounter';
import ReportActionsListItemRenderer from '@pages/home/report/ReportActionsListItemRenderer';
import {openReport, readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';

/**
 * In this view we are not handling the special single transaction case, we're just handling the report
 */
const EmptyParentReportActionForTransactionThread = undefined;

const INITIAL_NUM_TO_RENDER = 20;

type MoneyRequestReportListProps = {
    /** The report */
    report: OnyxTypes.Report;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** If the report has newer actions to load */
    hasNewerActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;
};

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

function selectTransactionsForReportID(transactions: OnyxCollection<OnyxTypes.Transaction>, reportID: string, reportActions: OnyxTypes.ReportAction[]) {
    return Object.values(transactions ?? {}).filter((transaction): transaction is Transaction => {
        if (!transaction) {
            return false;
        }
        const action = getIOUActionForTransactionID(reportActions, transaction.transactionID);
        return transaction.reportID === reportID && !isDeletedParentAction(action);
    });
}

/**
 * TODO make this component have the same functionalities as `ReportActionsList`
 *  - shouldDisplayNewMarker
 */
function MoneyRequestReportActionsList({report, reportActions = [], hasNewerActions, hasOlderActions}: MoneyRequestReportListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {preferredLocale} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();

    const reportID = report?.reportID;

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, report?.parentReportActionID),
    });

    const mostRecentIOUReportActionID = useMemo(() => getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const transactionThreadReportID = getOneTransactionThreadReportID(reportID, reportActions ?? [], false);
    const firstVisibleReportActionID = useMemo(() => getFirstVisibleReportActionID(reportActions, isOffline), [reportActions, isOffline]);
    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (allTransactions): OnyxTypes.Transaction[] => selectTransactionsForReportID(allTransactions, reportID, reportActions),
    });
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});

    const canPerformWriteAction = canUserPerformWriteAction(report);
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);

    const reportScrollManager = useReportScrollManager();

    // We are reversing actions because in this View we are starting at the top and don't use Inverted list
    const visibleReportActions = useMemo(() => {
        const filteredActions = reportActions.filter((reportAction) => {
            const isActionVisibleOnMoneyReport = isActionVisibleOnMoneyRequestReport(reportAction);

            return (
                isActionVisibleOnMoneyReport &&
                (isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors) &&
                shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canPerformWriteAction)
            );
        });

        return filteredActions.toReversed();
    }, [reportActions, isOffline, canPerformWriteAction]);

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
    });

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

    const reportActionSize = useRef(visibleReportActions.length);
    const lastAction = visibleReportActions.at(-1);
    const lastActionIndex = lastAction?.reportActionID;
    const previousLastIndex = useRef(lastActionIndex);

    const scrollingVerticalOffset = useRef(0);
    const readActionSkipped = useRef(false);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated;
    const hasNewestReportActionRef = useRef(hasNewestReportAction);

    useEffect(() => {
        if (
            scrollingVerticalOffset.current < AUTOSCROLL_TO_TOP_THRESHOLD &&
            previousLastIndex.current !== lastActionIndex &&
            reportActionSize.current > reportActions.length &&
            hasNewestReportAction
        ) {
            setIsFloatingMessageCounterVisible(false);
            reportScrollManager.scrollToEnd();
        }

        previousLastIndex.current = lastActionIndex;
        reportActionSize.current = visibleReportActions.length;
        hasNewestReportActionRef.current = hasNewestReportAction;
    }, [lastActionIndex, reportActions, reportScrollManager, hasNewestReportAction, visibleReportActions.length]);

    const prevUnreadMarkerReportActionID = useRef<string | null>(null);

    const visibleActionsMap = useMemo(() => {
        return visibleReportActions.reduce((actionsMap, reportAction) => {
            Object.assign(actionsMap, {[reportAction.reportActionID]: reportAction});
            return actionsMap;
        }, {} as OnyxTypes.ReportActions);
    }, [visibleReportActions]);
    const prevVisibleActionsMap = usePrevious(visibleActionsMap);

    /**
     * The timestamp for the unread marker.
     *
     * This should ONLY be updated when the user
     * - switches reports
     * - marks a message as read/unread
     * - reads a new message as it is received
     */
    const [unreadMarkerTime, setUnreadMarkerTime] = useState(report.lastReadTime);
    useEffect(() => {
        setUnreadMarkerTime(report.lastReadTime);

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.reportID]);

    /**
     * The index of the earliest message that was received while offline
     */
    const earliestReceivedOfflineMessageIndex = useMemo(() => {
        const lastIndex = reportActions.findLastIndex((action) => {
            return wasMessageReceivedWhileOffline(action, isOffline, lastOfflineAt.current, lastOnlineAt.current, preferredLocale);
        });

        // The last index in the list is the earliest message that was received while offline
        return lastIndex > -1 ? lastIndex : undefined;
    }, [isOffline, lastOfflineAt, lastOnlineAt, preferredLocale, reportActions]);

    /**
     * TODO extract as reusable logic from ReportActionsList - https://github.com/Expensify/App/issues/58891
     */
    const unreadMarkerReportActionID = useMemo(() => {
        const shouldDisplayNewMarker = (message: OnyxTypes.ReportAction, index: number): boolean => {
            const nextMessage = visibleReportActions.at(index + 1);
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
            const isFromCurrentUser = currentUserAccountID === (isReportPreviewAction(message) ? message.childLastActorAccountID : message.actorAccountID);
            const isNewMessage = !prevVisibleActionsMap[message.reportActionID];

            // The unread marker will show if the action's `created` time is later than `unreadMarkerTime`.
            // The `unreadMarkerTime` has already been updated to match the optimistic action created time,
            // but once the new action is saved on the backend, the actual created time will be later than the optimistic one.
            // Therefore, we also need to prevent the unread marker from appearing for previously optimistic actions.
            const isPreviouslyOptimistic =
                (isPendingAdd(prevVisibleActionsMap[message.reportActionID]) && !isPendingAdd(message)) ||
                (!!prevVisibleActionsMap[message.reportActionID]?.isOptimisticAction && !message.isOptimisticAction);
            const shouldIgnoreUnreadForCurrentUserMessage = !prevUnreadMarkerReportActionID.current && isFromCurrentUser && (isNewMessage || isPreviouslyOptimistic);

            if (isFromCurrentUser) {
                return !shouldIgnoreUnreadForCurrentUserMessage;
            }

            return !isNewMessage || scrollingVerticalOffset.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
        };

        // If there are message that were recevied while offline,
        // we can skip checking all messages later than the earliest recevied offline message.
        const startIndex = earliestReceivedOfflineMessageIndex ?? 0;

        // Scan through each visible report action until we find the appropriate action to show the unread marker
        for (let index = startIndex; index < visibleReportActions.length; index++) {
            const reportAction = visibleReportActions.at(index);

            // eslint-disable-next-line react-compiler/react-compiler
            if (reportAction && shouldDisplayNewMarker(reportAction, index)) {
                return reportAction.reportActionID;
            }
        }

        return null;
    }, [currentUserAccountID, earliestReceivedOfflineMessageIndex, prevVisibleActionsMap, visibleReportActions, unreadMarkerTime]);
    prevUnreadMarkerReportActionID.current = unreadMarkerReportActionID;

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
            const displayAsGroup =
                !isConsecutiveChronosAutomaticTimerAction(visibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID)) &&
                hasNextActionMadeBySameActor(visibleReportActions, index);

            return (
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    reportActions={reportActions}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={EmptyParentReportActionForTransactionThread}
                    index={index}
                    report={report}
                    transactionThreadReport={transactionThreadReport}
                    displayAsGroup={displayAsGroup}
                    mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                    shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                    shouldDisplayReplyDivider={visibleReportActions.length > 1}
                    isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                    shouldHideThreadDividerLine
                />
            );
        },
        [visibleReportActions, reportActions, parentReportAction, report, transactionThreadReport, mostRecentIOUReportActionID, unreadMarkerReportActionID, firstVisibleReportActionID],
    );

    const scrollToBottomAndMarkReportAsRead = useCallback(() => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
            openReport(report.reportID);
            reportScrollManager.scrollToEnd();
            return;
        }

        reportScrollManager.scrollToEnd();
        readActionSkipped.current = false;
        readNewestAction(report.reportID);
    }, [report.reportID, reportScrollManager, hasNewestReportAction]);

    /**
     * Todo - extract to reusable logic - https://github.com/Expensify/App/issues/58891
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    const handleUnreadFloatingButton = () => {
        if (scrollingVerticalOffset.current > CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !!unreadMarkerReportActionID) {
            setIsFloatingMessageCounterVisible(true);
        }

        if (scrollingVerticalOffset.current < CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
            if (readActionSkipped.current) {
                readActionSkipped.current = false;
                readNewestAction(report.reportID);
            }
            setIsFloatingMessageCounterVisible(false);
        }
    };

    const reportHasComments = visibleReportActions.length > 0;
    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollingVerticalOffset.current = event.nativeEvent.contentOffset.y;
        handleUnreadFloatingButton();
    };

    return (
        <View style={[styles.flex1]}>
            <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden, styles.pb4]}>
                <FloatingMessageCounter
                    isActive={isFloatingMessageCounterVisible}
                    onClick={scrollToBottomAndMarkReportAsRead}
                />
                {isEmpty(visibleReportActions) && isEmpty(transactions) ? (
                    <SearchMoneyRequestReportEmptyState />
                ) : (
                    <FlatList
                        initialNumToRender={INITIAL_NUM_TO_RENDER}
                        accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                        testID="money-request-report-actions-list"
                        style={styles.overscrollBehaviorContain}
                        data={visibleReportActions}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.reportActionID}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.75}
                        onStartReached={onStartReached}
                        onStartReachedThreshold={0.75}
                        ListHeaderComponent={
                            <MoneyRequestReportTransactionList
                                report={report}
                                transactions={transactions}
                                reportActions={reportActions}
                                hasComments={reportHasComments}
                            />
                        }
                        keyboardShouldPersistTaps="handled"
                        onScroll={trackVerticalScrolling}
                        ref={reportScrollManager.ref}
                    />
                )}
            </View>
        </View>
    );
}

MoneyRequestReportActionsList.displayName = 'MoneyRequestReportActionsList';

export default MoneyRequestReportActionsList;
