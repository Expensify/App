/* eslint-disable rulesdir/prefer-early-return */
import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {accountIDSelector} from '@selectors/Session';
import {tierNameSelector} from '@selectors/UserWallet';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {renderScrollComponentWithTopSpacing} from '@components/ActionSheetAwareScrollView';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import Checkbox from '@components/Checkbox';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import InvertedFlatList from '@components/InvertedFlatList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/InvertedFlatList/BaseInvertedFlatList';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useThemeStyles from '@hooks/useThemeStyles';
import {queueExportSearchWithTemplate} from '@libs/actions/Search';
import DateUtils from '@libs/DateUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isActionVisibleOnMoneyRequestReport} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {
    getFirstVisibleReportActionID,
    getMostRecentIOURequestActionID,
    getOneTransactionThreadReportID,
    isConsecutiveActionMadeByPreviousActor,
    isConsecutiveChronosAutomaticTimerAction,
    isCurrentActionUnread,
    isDeletedParentAction,
    isIOUActionMatchingTransactionList,
    shouldReportActionBeVisible,
    wasMessageReceivedWhileOffline,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID, getOriginalReportID, getReportLastVisibleActionCreated, isUnread} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/Telemetry/markOpenReportEnd';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';
import Visibility from '@libs/Visibility';
import isSearchTopmostFullScreenRoute from '@navigation/helpers/isSearchTopmostFullScreenRoute';
import FloatingMessageCounter from '@pages/home/report/FloatingMessageCounter';
import ReportActionsListItemRenderer from '@pages/home/report/ReportActionsListItemRenderer';
import shouldDisplayNewMarkerOnReportAction from '@pages/home/report/shouldDisplayNewMarkerOnReportAction';
import useReportUnreadMessageScrollTracking from '@pages/home/report/useReportUnreadMessageScrollTracking';
import variables from '@styles/variables';
import {getCurrentUserAccountID, openReport, readNewestAction, subscribeToNewActionEvent} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';
import MoneyRequestViewReportFields from './MoneyRequestViewReportFields';
import ReportActionsListLoadingSkeleton from './ReportActionsListLoadingSkeleton';

/**
 * In this view we are not handling the special single transaction case, we're just handling the report
 */
const EmptyParentReportActionForTransactionThread = undefined;

const INITIAL_NUM_TO_RENDER = 20;
// Amount of time to wait until all list items should be rendered and scrollToOffset 0will behave well
const DELAY_FOR_SCROLLING_TO_END = 100;

type MoneyRequestReportListProps = {
    /** The report */
    report: OnyxTypes.Report;

    /** Policy that the report belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** List of transactions belonging to this report */
    transactions?: OnyxTypes.Transaction[];

    /** Whether there is a pending delete transaction */
    hasPendingDeletionTransaction?: boolean;

    /** List of transactions that arrived when the report was open */
    newTransactions: OnyxTypes.Transaction[];

    /** Violations indexed by transaction ID */
    violations?: Record<string, OnyxTypes.TransactionViolation[]>;

    /** If the report has newer actions to load */
    hasNewerActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;

    /** Whether report actions are still loading and we load the report for the first time, since the last sign in */
    showReportActionsLoadingState?: boolean;
};

const keyExtractor = (item: OnyxTypes.ReportAction) => item.reportActionID;

function MoneyRequestReportActionsList({
    report,
    policy,
    reportActions = [],
    transactions = [],
    newTransactions,
    violations,
    hasNewerActions,
    hasOlderActions,
    hasPendingDeletionTransaction,
    showReportActionsLoadingState,
}: MoneyRequestReportListProps) {
    const styles = useThemeStyles();
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();
    const reportScrollManager = useReportScrollManager();
    const lastMessageTime = useRef<string | null>(null);
    const didLayout = useRef(false);
    const [isVisible, setIsVisible] = useState(Visibility.isVisible);
    const isFocused = useIsFocused();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    // wrapped in useMemo to avoid unnecessary re-renders and improve performance
    const reportTransactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {canBeMissing: true});

    const reportID = report?.reportID;
    const linkedReportActionID = route?.params?.reportActionID;

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const parentReportAction = useParentReportAction(report);

    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector, canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}`, {canBeMissing: true});
    const [draftMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}`, {canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: false});
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;

    const transactionsWithoutPendingDelete = useMemo(() => transactions.filter((t) => !isTransactionPendingDelete(t)), [transactions]);
    const mostRecentIOUReportActionID = useMemo(() => getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], false, reportTransactionIDs);
    const firstVisibleReportActionID = useMemo(() => getFirstVisibleReportActionID(reportActions, isOffline), [reportActions, isOffline]);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: accountIDSelector});

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [enableScrollToEnd, setEnableScrollToEnd] = useState<boolean>(false);
    const [lastActionEventId, setLastActionEventId] = useState<string>('');

    const {selectedTransactionIDs, setSelectedTransactions, clearSelectedTransactions} = useSearchContext();

    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [isExportWithTemplateModalVisible, setIsExportWithTemplateModalVisible] = useState(false);
    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, transactionIDList: string[]) => {
            if (!report) {
                return;
            }

            setIsExportWithTemplateModalVisible(true);
            queueExportSearchWithTemplate({
                templateName,
                templateType,
                jsonQuery: '{}',
                reportIDList: [report.reportID],
                transactionIDList,
                policyID: policy?.id,
            });
        },
        [report, policy],
    );

    const {
        options: selectedTransactionsOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        hideDeleteModal,
    } = useSelectedTransactionsActions({
        report,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
        onExportOffline: () => setOfflineModalVisible(true),
        policy,
        beginExportWithTemplate: (templateName, templateType, transactionIDList) => beginExportWithTemplate(templateName, templateType, transactionIDList),
    });

    const visibleReportActions = useMemo(() => {
        const filteredActions = reportActions.filter((reportAction) => {
            const isActionVisibleOnMoneyReport = isActionVisibleOnMoneyRequestReport(reportAction);

            return (
                isActionVisibleOnMoneyReport &&
                (isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors) &&
                shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canPerformWriteAction) &&
                isIOUActionMatchingTransactionList(reportAction, reportTransactionIDs)
            );
        });

        return filteredActions;
    }, [reportActions, isOffline, canPerformWriteAction, reportTransactionIDs]);

    const reportActionSize = useRef(visibleReportActions.length);
    const lastAction = visibleReportActions.at(0);
    const lastActionIndex = lastAction?.reportActionID;
    const previousLastIndex = useRef(lastActionIndex);

    const scrollingVerticalBottomOffset = useRef(0);
    const scrollingVerticalTopOffset = useRef(0);
    const wrapperViewRef = useRef<View>(null);
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

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadOlderChats(false)));
    }, [loadOlderChats]);

    const onEndReached = useCallback(() => {
        loadNewerChats(false);
    }, [loadNewerChats]);

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
            (reportAction) => newMessageTimeReference && newMessageTimeReference < reportAction.created && reportAction.actorAccountID !== getCurrentUserAccountID(),
        );

        if (!hasNewMessagesInView || !hasUnreadReportAction) {
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
    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex] = useMemo(() => {
        // If there are message that were received while offline,
        // we can skip checking all messages later than the earliest received offline message.
        // Scan through each visible report action until we find the appropriate action to show the unread marker
        for (let index = 0; index < visibleReportActions.length; index++) {
            const reportAction = visibleReportActions.at(index);
            const nextAction = index > 0 ? visibleReportActions.at(index + 1) : undefined;
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
                return [reportAction.reportActionID, index];
            }
        }

        return [null, -1];
    }, [currentUserAccountID, earliestReceivedOfflineMessageIndex, prevVisibleActionsMap, visibleReportActions, unreadMarkerTime]);
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

            // We additionally track the top offset to be able to scroll to the new transaction when it's added
            scrollingVerticalTopOffset.current = contentOffset.y;
        },
    });

    useEffect(() => {
        if (
            scrollingVerticalBottomOffset.current < AUTOSCROLL_TO_TOP_THRESHOLD &&
            previousLastIndex.current !== lastActionIndex &&
            reportActionSize.current > reportActions.length &&
            hasNewestReportAction
        ) {
            setIsFloatingMessageCounterVisible(false);
            reportScrollManager.scrollToOffset(0);
        }

        previousLastIndex.current = lastActionIndex;
        reportActionSize.current = visibleReportActions.length;
        hasNewestReportActionRef.current = hasNewestReportAction;
    }, [lastActionIndex, reportActions, reportScrollManager, hasNewestReportAction, visibleReportActions.length, setIsFloatingMessageCounterVisible]);

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
                        reportScrollManager.scrollToOffset(0);
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report.reportID]);

    useEffect(() => {
        const index = visibleReportActions.findIndex((item) => item.reportActionID === lastActionEventId);
        if (enableScrollToEnd && index !== -1) {
            setTimeout(() => {
                reportScrollManager.scrollToOffset(index);
            }, DELAY_FOR_SCROLLING_TO_END);
            setEnableScrollToEnd(false);
        }
    }, [visibleReportActions, lastActionEventId, enableScrollToEnd, reportScrollManager]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
            const displayAsGroup =
                !isConsecutiveChronosAutomaticTimerAction(visibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID)) &&
                isConsecutiveActionMadeByPreviousActor(visibleReportActions, index);

            const actionEmojiReactions = emojiReactions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportAction.reportActionID}`];
            const originalReportID = getOriginalReportID(report.reportID, reportAction);
            const reportDraftMessages = draftMessage?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`];
            const matchingDraftMessage = reportDraftMessages?.[reportAction.reportActionID];
            const matchingDraftMessageString = typeof matchingDraftMessage === 'string' ? matchingDraftMessage : matchingDraftMessage?.message;

            return (
                <ReportActionsListItemRenderer
                    allReports={allReports}
                    policies={policies}
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
                    userWalletTierName={userWalletTierName}
                    isUserValidated={isUserValidated}
                    personalDetails={personalDetails}
                    userBillingFundID={userBillingFundID}
                    emojiReactions={actionEmojiReactions}
                    isReportArchived={isReportArchived}
                    draftMessage={matchingDraftMessageString}
                    isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
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
            allReports,
            policies,
            userWalletTierName,
            isUserValidated,
            personalDetails,
            userBillingFundID,
            emojiReactions,
            draftMessage,
            isTryNewDotNVPDismissed,
            isReportArchived,
        ],
    );

    const scrollToBottomAndMarkReportAsRead = useCallback(() => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
            openReport(report.reportID);
            reportScrollManager.scrollToOffset(0);
            return;
        }

        reportScrollManager.scrollToEnd();
        readActionSkipped.current = false;
        readNewestAction(report.reportID);
    }, [setIsFloatingMessageCounterVisible, hasNewestReportAction, reportScrollManager, report.reportID]);

    const reportHasComments = visibleReportActions.length > 0;

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

        markOpenReportEnd();
    }, []);

    const isSelectAllChecked = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactionsWithoutPendingDelete.length;

    const listFooterComponent = useMemo(
        () => (
            <>
                <MoneyRequestViewReportFields
                    report={report}
                    policy={policy}
                />
                <MoneyRequestReportTransactionList
                    report={report}
                    transactions={transactions}
                    newTransactions={newTransactions}
                    hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                    reportActions={reportActions}
                    violations={violations}
                    hasComments={reportHasComments}
                    isLoadingInitialReportActions={showReportActionsLoadingState}
                    scrollToNewTransaction={scrollToNewTransaction}
                />
            </>
        ),
        [report, policy, transactions, newTransactions, reportActions, violations, reportHasComments, showReportActionsLoadingState, scrollToNewTransaction, hasPendingDeletionTransaction],
    );

    // This skeleton component is only used for loading state, the empty state is handled by SearchMoneyRequestReportEmptyState
    const listEmptyComponent = useMemo(() => (!isOffline && showReportActionsLoadingState ? <ReportActionsListLoadingSkeleton /> : undefined), [isOffline, showReportActionsLoadingState]);

    // Track previous visibleReportActions.length to detect 0 -> 1 transition for scroll
    const prevCountRef = useRef(visibleReportActions.length);
    useEffect(() => {
        if (prevCountRef.current === 0 && visibleReportActions.length === 1) {
            InteractionManager.runAfterInteractions(() => {
                requestAnimationFrame(() => {
                    reportScrollManager.scrollToOffset(0);
                });
            });
        }
        prevCountRef.current = visibleReportActions.length;
    }, [visibleReportActions.length, reportScrollManager]);

    return (
        <View
            style={styles.flex1}
            ref={wrapperViewRef}
        >
            {shouldUseNarrowLayout && isMobileSelectionModeEnabled && (
                <>
                    <ButtonWithDropdownMenu
                        onPress={() => null}
                        options={selectedTransactionsOptions}
                        customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                        isSplitButton={false}
                        shouldAlwaysShowDropdownMenu
                        wrapperStyle={[styles.w100, styles.ph5]}
                    />
                    <View style={[styles.alignItemsCenter, styles.userSelectNone, styles.flexRow, styles.pt6, styles.ph8, styles.pb3]}>
                        <Checkbox
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length !== transactionsWithoutPendingDelete.length}
                            onPress={() => {
                                if (selectedTransactionIDs.length !== 0) {
                                    clearSelectedTransactions(true);
                                } else {
                                    setSelectedTransactions(transactionsWithoutPendingDelete.map((t) => t.transactionID));
                                }
                            }}
                        />
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={() => {
                                if (isSelectAllChecked) {
                                    clearSelectedTransactions(true);
                                } else {
                                    setSelectedTransactions(transactionsWithoutPendingDelete.map((t) => t.transactionID));
                                }
                            }}
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            role="button"
                            accessibilityState={{checked: isSelectAllChecked}}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                        </PressableWithFeedback>
                    </View>
                    <ConfirmModal
                        title={translate('iou.deleteExpense', {count: selectedTransactionIDs.length})}
                        isVisible={isDeleteModalVisible}
                        onConfirm={() => {
                            const shouldNavigateBack =
                                transactions.filter((trans) => trans.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length === selectedTransactionIDs.length;
                            handleDeleteTransactions();
                            if (shouldNavigateBack) {
                                Navigation.goBack(route.params?.backTo);
                            }
                        }}
                        onCancel={hideDeleteModal}
                        prompt={translate('iou.deleteConfirmation', {count: selectedTransactionIDs.length})}
                        confirmText={translate('common.delete')}
                        cancelText={translate('common.cancel')}
                        danger
                        shouldEnableNewFocusManagement
                    />
                </>
            )}
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <View style={styles.flex1}>
                <InvertedFlatList
                    initialNumToRender={INITIAL_NUM_TO_RENDER}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    removeClippedSubviews={false}
                    updateCellsBatchingPeriod={50}
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    testID="money-request-report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={visibleReportActions}
                    renderItem={renderItem}
                    renderScrollComponent={renderScrollComponentWithTopSpacing}
                    keyExtractor={keyExtractor}
                    onLayout={recordTimeToMeasureItemLayout}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={onStartReached}
                    onStartReachedThreshold={0.75}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    onScroll={trackVerticalScrolling}
                    contentContainerStyle={styles.chatContentScrollView}
                    ref={reportScrollManager.ref}
                    ListEmptyComponent={listEmptyComponent}
                    shouldEnableAutoScrollToTopThreshold={hasOlderActions}
                    initialScrollKey={linkedReportActionID}
                    onViewableItemsChanged={onViewableItemsChanged}
                />
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
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={shouldUseNarrowLayout}
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            <ConfirmModal
                onConfirm={() => {
                    setIsExportWithTemplateModalVisible(false);
                    clearSelectedTransactions(undefined, true);
                }}
                onCancel={() => setIsExportWithTemplateModalVisible(false)}
                isVisible={isExportWithTemplateModalVisible}
                title={translate('export.exportInProgress')}
                prompt={translate('export.conciergeWillSend')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </View>
    );
}

MoneyRequestReportActionsList.displayName = 'MoneyRequestReportActionsList';

export default MoneyRequestReportActionsList;
