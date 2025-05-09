import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import {useRoute} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import Checkbox from '@components/Checkbox';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import FlatList from '@components/FlatList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/InvertedFlatList/BaseInvertedFlatList';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {parseFSAttributes} from '@libs/Fullstory';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isActionVisibleOnMoneyRequestReport} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {
    getFirstVisibleReportActionID,
    getMostRecentIOURequestActionID,
    getOneTransactionThreadReportID,
    hasNextActionMadeBySameActor,
    isConsecutiveChronosAutomaticTimerAction,
    isDeletedParentAction,
    shouldReportActionBeVisible,
    wasMessageReceivedWhileOffline,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID, getReportLastVisibleActionCreated} from '@libs/ReportUtils';
import isSearchTopmostFullScreenRoute from '@navigation/helpers/isSearchTopmostFullScreenRoute';
import FloatingMessageCounter from '@pages/home/report/FloatingMessageCounter';
import ReportActionsListItemRenderer from '@pages/home/report/ReportActionsListItemRenderer';
import shouldDisplayNewMarkerOnReportAction from '@pages/home/report/shouldDisplayNewMarkerOnReportAction';
import {openReport, readNewestAction, subscribeToNewActionEvent} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {useMoneyRequestReportContext} from './MoneyRequestReportContext';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';
import MoneyRequestViewReportFields from './MoneyRequestViewReportFields';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';

/**
 * In this view we are not handling the special single transaction case, we're just handling the report
 */
const EmptyParentReportActionForTransactionThread = undefined;

const INITIAL_NUM_TO_RENDER = 20;
// Amount of time to wait until all list items should be rendered and scrollToEnd will behave well
const DELAY_FOR_SCROLLING_TO_END = 100;

type MoneyRequestReportListProps = {
    /** The report */
    report: OnyxTypes.Report;

    /** Policy that the report belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** List of transactions belonging to this report */
    transactions: OnyxTypes.Transaction[];

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

function MoneyRequestReportActionsList({report, policy, reportActions = [], transactions = [], hasNewerActions, hasOlderActions}: MoneyRequestReportListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {preferredLocale} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();
    const reportScrollManager = useReportScrollManager();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();

    const reportID = report?.reportID;
    const linkedReportActionID = route?.params?.reportActionID;

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {
        canEvict: false,
        canBeMissing: true,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, report?.parentReportActionID),
    });

    const mostRecentIOUReportActionID = useMemo(() => getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const transactionThreadReportID = getOneTransactionThreadReportID(reportID, reportActions ?? [], false);
    const firstVisibleReportActionID = useMemo(() => getFirstVisibleReportActionID(reportActions, isOffline), [reportActions, isOffline]);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: (session) => session?.accountID});

    const canPerformWriteAction = canUserPerformWriteAction(report);
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);

    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext();

    const {selectionMode} = useMobileSelectionMode();
    const {
        options: selectedTransactionsOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        hideDeleteModal,
    } = useSelectedTransactionsActions({report, reportActions, allTransactionsLength: transactions.length, session, onExportFailed: () => setIsDownloadErrorModalVisible(true)});

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

    const reportActionSize = useRef(visibleReportActions.length);
    const lastAction = visibleReportActions.at(-1);
    const lastActionIndex = lastAction?.reportActionID;
    const previousLastIndex = useRef(lastActionIndex);

    const scrollingVerticalBottomOffset = useRef(0);
    const readActionSkipped = useRef(false);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated;
    const hasNewestReportActionRef = useRef(hasNewestReportAction);
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
    });

    const onStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadOlderChats(false);
            return;
        }

        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadOlderChats(false)));
    }, [loadOlderChats]);

    const onEndReached = useCallback(() => {
        loadNewerChats(false);
    }, [loadNewerChats]);

    useEffect(() => {
        if (
            scrollingVerticalBottomOffset.current < AUTOSCROLL_TO_TOP_THRESHOLD &&
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
     * The reportActionID the unread marker should display above
     */
    const unreadMarkerReportActionID = useMemo(() => {
        // If there are message that were received while offline,
        // we can skip checking all messages later than the earliest received offline message.
        const startIndex = visibleReportActions.length - 1;
        const endIndex = earliestReceivedOfflineMessageIndex ?? 0;

        // Scan through each visible report action until we find the appropriate action to show the unread marker
        for (let index = startIndex; index >= endIndex; index--) {
            const reportAction = visibleReportActions.at(index);
            const nextAction = visibleReportActions.at(index - 1);
            const isEarliestReceivedOfflineMessage = index === earliestReceivedOfflineMessageIndex;

            const shouldDisplayNewMarker =
                reportAction &&
                shouldDisplayNewMarkerOnReportAction({
                    message: reportAction,
                    nextMessage: nextAction,
                    isEarliestReceivedOfflineMessage,
                    accountID: currentUserAccountID,
                    prevSortedVisibleReportActionsObjects: prevVisibleActionsMap,
                    unreadMarkerTime,
                    scrollingVerticalOffset: scrollingVerticalBottomOffset.current,
                    prevUnreadMarkerReportActionID: prevUnreadMarkerReportActionID.current,
                });

            // eslint-disable-next-line react-compiler/react-compiler
            if (shouldDisplayNewMarker) {
                return reportAction.reportActionID;
            }
        }

        return null;
    }, [currentUserAccountID, earliestReceivedOfflineMessageIndex, prevVisibleActionsMap, visibleReportActions, unreadMarkerTime]);
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
    }, [lastAction?.created, unreadMarkerReportActionID, unreadMarkerTime]);

    const scrollToBottomForCurrentUserAction = useCallback(
        (isFromCurrentUser: boolean) => {
            InteractionManager.runAfterInteractions(() => {
                setIsFloatingMessageCounterVisible(false);
                // If a new comment is added from the current user, scroll to the bottom, otherwise leave the user position unchanged
                if (!isFromCurrentUser) {
                    return;
                }

                // We want to scroll to the end of the list where the newest message is
                // however scrollToEnd will not work correctly with items of variable sizes without `getItemLayout` - so we need to delay the scroll until every item rendered
                setTimeout(() => {
                    reportScrollManager.scrollToEnd();
                }, DELAY_FOR_SCROLLING_TO_END);
            });
        },
        [reportScrollManager],
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.reportID]);

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
                    linkedReportActionID={linkedReportActionID}
                />
            );
        },
        [
            visibleReportActions,
            reportActions,
            parentReportAction,
            report,
            transactionThreadReport,
            mostRecentIOUReportActionID,
            unreadMarkerReportActionID,
            firstVisibleReportActionID,
            linkedReportActionID,
        ],
    );

    const scrollToBottomAndMarkReportAsRead = useCallback(() => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
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
        if (scrollingVerticalBottomOffset.current > CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !!unreadMarkerReportActionID) {
            setIsFloatingMessageCounterVisible(true);
        }

        if (scrollingVerticalBottomOffset.current < CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
            if (readActionSkipped.current) {
                readActionSkipped.current = false;
                readNewestAction(report.reportID);
            }
            setIsFloatingMessageCounterVisible(false);
        }
    };

    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const {layoutMeasurement, contentSize, contentOffset} = event.nativeEvent;
        const fullContentHeight = contentSize.height;

        /**
         * Count the diff between current scroll position and the bottom of the list.
         * Diff == (height of all items in the list) - (height of the layout with the list) - (how far user scrolled)
         */
        scrollingVerticalBottomOffset.current = fullContentHeight - layoutMeasurement.height - contentOffset.y;
        handleUnreadFloatingButton();
    };

    const reportHasComments = visibleReportActions.length > 0;

    // Parse Fullstory attributes on initial render
    useLayoutEffect(parseFSAttributes, []);

    return (
        <View style={[styles.flex1, styles.pv4]}>
            {shouldUseNarrowLayout && !!selectionMode?.isEnabled && (
                <>
                    <ButtonWithDropdownMenu
                        onPress={() => null}
                        options={selectedTransactionsOptions}
                        customText={translate('workspace.common.selected', {count: selectedTransactionsID.length})}
                        isSplitButton={false}
                        shouldAlwaysShowDropdownMenu
                        wrapperStyle={[styles.w100, styles.ph5]}
                    />
                    <View style={[styles.searchListHeaderContainerStyle, styles.pt6, styles.ph8, styles.pb3]}>
                        <Checkbox
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={selectedTransactionsID.length === transactions.length}
                            isIndeterminate={selectedTransactionsID.length > 0 && selectedTransactionsID.length !== transactions.length}
                            onPress={() => {
                                if (selectedTransactionsID.length !== 0) {
                                    setSelectedTransactionsID([]);
                                } else {
                                    setSelectedTransactionsID(transactions.map((t) => t.transactionID));
                                }
                            }}
                        />
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={() => {
                                if (selectedTransactionsID.length === transactions.length) {
                                    setSelectedTransactionsID([]);
                                } else {
                                    setSelectedTransactionsID(transactions.map((t) => t.transactionID));
                                }
                            }}
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            role="button"
                            accessibilityState={{checked: selectedTransactionsID.length === transactions.length}}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                        </PressableWithFeedback>
                    </View>
                    <ConfirmModal
                        title={translate('iou.deleteExpense', {count: selectedTransactionsID.length})}
                        isVisible={isDeleteModalVisible}
                        onConfirm={handleDeleteTransactions}
                        onCancel={hideDeleteModal}
                        prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsID.length})}
                        confirmText={translate('common.delete')}
                        cancelText={translate('common.cancel')}
                        danger
                        shouldEnableNewFocusManagement
                    />
                </>
            )}
            <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden, styles.pb4]}>
                <FloatingMessageCounter
                    isActive={isFloatingMessageCounterVisible}
                    onClick={scrollToBottomAndMarkReportAsRead}
                />
                {isEmpty(visibleReportActions) && isEmpty(transactions) ? (
                    <>
                        <MoneyRequestViewReportFields
                            report={report}
                            policy={policy}
                        />
                        <SearchMoneyRequestReportEmptyState />
                    </>
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
                            <>
                                <MoneyRequestViewReportFields
                                    report={report}
                                    policy={policy}
                                />
                                <MoneyRequestReportTransactionList
                                    report={report}
                                    transactions={transactions}
                                    reportActions={reportActions}
                                    hasComments={reportHasComments}
                                />
                            </>
                        }
                        keyboardShouldPersistTaps="handled"
                        onScroll={trackVerticalScrolling}
                        ref={reportScrollManager.ref}
                    />
                )}
            </View>
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={shouldUseNarrowLayout}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
        </View>
    );
}

MoneyRequestReportActionsList.displayName = 'MoneyRequestReportActionsList';

export default MoneyRequestReportActionsList;
