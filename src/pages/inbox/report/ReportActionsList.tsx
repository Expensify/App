import {useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlashList from '@components/FlashList/InvertedFlashList';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/FlatList/hooks/useFlatListScrollKey';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isSafari} from '@libs/Browser';
import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    getFirstVisibleReportActionID,
    getReportActionMessage,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isNewerReportAction,
    isReportPreviewAction,
    isReversedTransaction,
    isSentMoneyReportAction,
    isTransactionThread,
} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    getReportLastVisibleActionCreated,
    isArchivedNonExpenseReport,
    isCanceledTaskReport,
    isExpenseReport,
    isHarvestCreatedExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isMoneyRequestReport,
    isTaskReport,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {openReport, readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import FloatingMessageCounter from './FloatingMessageCounter';
import ReportActionIndexContext from './ReportActionIndexContext';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ReportActionsListPaddingView from './ReportActionsListPaddingView';
import shouldFollowActionBadgeTarget from './shouldFollowActionBadgeTarget';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';
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

    /** Stable key to remount the list when the deep-linked action or unread anchor (or report) changes */
    listID: string;

    /** Whether the chat history is hidden (concierge side panel fresh state) */
    showHiddenHistory?: boolean;

    /** Whether there are previous messages that can be revealed */
    hasPreviousMessages?: boolean;

    /** Callback to show previous messages */
    onShowPreviousMessages?: () => void;
};

/**
 * Create a unique key for each action in the FlatList.
 * We use the reportActionID that is a string representation of a random 64-bit int, which should be
 * random enough to avoid collisions
 */
function keyExtractor(item: OnyxTypes.ReportAction): string {
    // A report has exactly one CREATED action. Using a stable key lets FlashList recycle the same cell
    // when the optimistic CREATED is swapped for the server one, avoiding a remount-induced scroll jump.
    if (item.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return CONST.REPORT.ACTIONS.TYPE.CREATED;
    }
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
    listID,
    parentReportActionForTransactionThread,
    showHiddenHistory,
    hasPreviousMessages,
    onShowPreviousMessages,
}: ReportActionsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isProduction} = useEnvironment();

    const {isOffline} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportScrollManager = useReportScrollManager();
    const {scrollOffsetRef} = useContext(ActionListContext);
    const {draftReportAction, hasActiveDraft, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft} = useConciergeDraftActions();
    const {sessionStartTime: conciergeSessionStartTime} = useConciergeSessionState();

    const isReportArchived = useReportIsArchived(report?.reportID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [actionIdToHighlight, setActionIdToHighlight] = useState('');
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report.reportID}`);
    const prevIsLoadingInitialReportActions = usePrevious(reportLoadingState?.isLoadingInitialReportActions);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);

    const reportAttributesSelector = useCallback(
        (value: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => {
            const attrs = value?.reports?.[report.reportID];
            if (!attrs) {
                return undefined;
            }
            return {
                actionBadge: attrs.actionBadge,
                actionTargetReportActionID: attrs.actionTargetReportActionID,
                brickRoadStatus: attrs.brickRoadStatus,
            };
        },
        [report.reportID],
    );
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesSelector,
    });
    const isHarvestCreatedExpenseReportAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

    const stableReportSelector = useCallback((reportEntry: OnyxEntry<OnyxTypes.Report>) => getStableReportSelector(reportEntry), []);
    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {selector: stableReportSelector});
    const [chatReportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportStable?.chatReportID)}`, {selector: stableReportSelector});

    const backTo = route?.params?.backTo as string;
    const linkedReportActionID = route?.params?.reportActionID;

    const hasHeaderRendered = useRef(false);

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

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(() => scrollOffsetRef.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);

    const {unreadMarkerReportActionID, unreadMarkerReportActionIndex} = useUnreadMarker({
        reportID: report.reportID,
        sortedVisibleReportActions,
        sortedReportActions,
        oldestUnreadReportActionID: oldestUnreadReportAction?.reportActionID,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!reportLoadingState?.hasOnceLoadedReportActions,
    });

    const {readActionSkippedRef} = useMarkAsRead({
        reportID: report.reportID,
        report,
        transactionThreadReport,
        sortedVisibleReportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
    });

    const isTransactionThreadReport = useMemo(() => isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction), [parentReportAction]);
    const isMoneyRequestOrInvoiceReport = useMemo(() => isMoneyRequestReport(report) || isInvoiceReport(report), [report]);
    const shouldBeAlignedToTop = useMemo(() => isTransactionThreadReport || isMoneyRequestOrInvoiceReport, [isMoneyRequestOrInvoiceReport, isTransactionThreadReport]);
    const initialScrollKey = useMemo(() => {
        const actionID = linkedReportActionID ?? unreadMarkerReportActionID;
        if (!actionID) {
            return;
        }

        // The correct scroll behavior in this case will be handled by shouldFocusToTopOnMount logic
        if (shouldBeAlignedToTop && sortedVisibleReportActionsObjects[actionID]?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return;
        }
        return actionID;
    }, [linkedReportActionID, unreadMarkerReportActionID, shouldBeAlignedToTop, sortedVisibleReportActionsObjects]);
    const shouldFocusToTopOnMount = shouldBeAlignedToTop && !initialScrollKey;
    const [shouldAutoscrollToBottom, setShouldAutoscrollToBottom] = useState(shouldFocusToTopOnMount);
    const renderedVisibleReportActions = useMemo(() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && conciergeSessionStartTime && draftReportAction.created < conciergeSessionStartTime) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic draft into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === draftReportAction.reportActionID) {
                if (!isDraftPendingCompletion) {
                    return sortedVisibleReportActions;
                }

                const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
                visibleReportActionsWithDraft[index] = draftReportAction;
                return visibleReportActionsWithDraft;
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
    }, [conciergeSessionStartTime, draftReportAction, isDraftPendingCompletion, showHiddenHistory, sortedVisibleReportActions]);

    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const draftReportActionID = draftReportAction?.reportActionID;
    const isSyntheticDraftVisible = !!draftReportAction && renderedVisibleReportActions !== sortedVisibleReportActions;
    const draftAutoScrollKey = isSyntheticDraftVisible ? `${draftReportAction.reportActionID}:${draftMessageHTML ?? ''}` : '';
    const previousDraftAutoScrollKey = usePrevious(draftAutoScrollKey);

    const shouldMaintainVisibleContentPosition = hasScrolledOverThreshold || shouldFocusToTopOnMount;

    useEffect(() => {
        if (!draftReportAction || isSyntheticDraftVisible) {
            return;
        }

        clearDraft();
    }, [clearDraft, draftReportAction, isSyntheticDraftVisible]);

    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, transactionThreadReport);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated || isReportPreviewAction(lastAction);

    // Find the index of the action badge target in the rendered actions list (which is what the FlatList uses as data)
    const actionBadgeTargetIndex = useMemo(() => {
        const targetID = reportAttributes?.actionTargetReportActionID;
        if (!targetID) {
            return -1;
        }
        return renderedVisibleReportActions.findIndex((action) => action.reportActionID === targetID);
    }, [reportAttributes?.actionTargetReportActionID, renderedVisibleReportActions]);

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, isActionBadgeAboveViewport, trackVerticalScrolling, onViewableItemsChanged} =
        useReportUnreadMessageScrollTracking({
            reportID: report.reportID,
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
            hasOnceLoadedReportActions: !!reportLoadingState?.hasOnceLoadedReportActions,
            actionBadgeTargetIndex,
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

    // Same-screen report switches reuse this instance; per-report one-shot flags must not leak across reports.
    useEffect(() => {
        hasHeaderRendered.current = false;
    }, [report.reportID]);

    useEffect(() => {
        if (initialScrollKey) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                if (shouldFocusToTopOnMount) {
                    return;
                }
                setIsFloatingMessageCounterVisible(false);
                reportScrollManager.scrollToBottom();
            },
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fixes Safari-specific issue where the whisper option is not highlighted correctly on hover after adding new transaction.
    // https://github.com/Expensify/App/issues/54520
    useEffect(() => {
        if (!isSafari()) {
            return;
        }
        const prevSorted = lastAction?.reportActionID ? prevSortedVisibleReportActionsObjects[lastAction?.reportActionID] : null;
        if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER || prevSorted) {
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                reportScrollManager.scrollToBottom();
            },
        });
        return () => handle.cancel();
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
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                reportScrollManager.scrollToBottom();
            },
        });
        return () => handle.cancel();
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
        readActionSkippedRef.current = false;
        readNewestAction(report.reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
    }, [
        setIsFloatingMessageCounterVisible,
        hasNewestReportAction,
        reportScrollManager,
        report.reportID,
        backTo,
        introSelected,
        reportLoadingState?.hasOnceLoadedReportActions,
        betas,
        readActionSkippedRef,
    ]);

    const scrollToActionBadgeTarget = useCallback(() => {
        if (actionBadgeTargetIndex < 0) {
            return;
        }
        reportScrollManager.scrollToIndex(actionBadgeTargetIndex);
    }, [actionBadgeTargetIndex, reportScrollManager]);

    // Once the current action-badge target is resolved (e.g. the user approves/pays an older report preview),
    // the badge target advances to the next report preview that requires action. Follow it by scrolling down to it.
    const actionTargetReportActionID = reportAttributes?.actionTargetReportActionID;
    const prevActionTargetReportActionID = usePrevious(actionTargetReportActionID);
    const prevActionBadge = usePrevious(reportAttributes?.actionBadge);
    useEffect(() => {
        const prevActionBadgeTargetIndex = renderedVisibleReportActions.findIndex((action) => action.reportActionID === prevActionTargetReportActionID);
        if (!shouldFollowActionBadgeTarget({isProduction, actionTargetReportActionID, prevActionTargetReportActionID, actionBadgeTargetIndex, prevActionBadgeTargetIndex})) {
            return;
        }
        // Only the submit/approve/pay buttons play a success animation (hide delay -> button exit -> height collapse) on the
        // resolved preview, so wait for it to finish before scrolling there so the list doesn't move mid-animation. Other badges
        // (e.g. task) don't animate, so scroll on the next frame instead of forcing an unnecessary delay.
        const isAnimatedBadge =
            prevActionBadge === CONST.REPORT.ACTION_BADGE.SUBMIT || prevActionBadge === CONST.REPORT.ACTION_BADGE.APPROVE || prevActionBadge === CONST.REPORT.ACTION_BADGE.PAY;
        if (!isAnimatedBadge) {
            const animationFrameID = requestAnimationFrame(scrollToActionBadgeTarget);
            return () => cancelAnimationFrame(animationFrameID);
        }
        const scrollTimeoutID = setTimeout(scrollToActionBadgeTarget, CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY + CONST.ANIMATION_THUMBS_UP_DURATION * 2);
        return () => clearTimeout(scrollTimeoutID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionTargetReportActionID]);

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
            // Use the action's actual index in sortedVisibleReportActions rather than the FlashList-provided index,
            // because useFlashListScrollKey may slice the data for deep-link scroll positioning, making the
            // FlashList index offset from the full array and causing wrong displayAsGroup computation.
            const safeIndex = actionIndexMap.get(reportAction.reportActionID) ?? index;
            const shouldDisableContextMenuForConciergeDraft = draftReportActionID === reportAction.reportActionID;

            return (
                <ReportActionIndexContext.Provider value={index}>
                    <ReportActionsListItemRenderer
                        reportAction={reportAction}
                        parentReportAction={parentReportAction}
                        parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                        report={reportStable}
                        transactionThreadReport={transactionThreadReport}
                        chatReport={chatReportStable}
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
                        isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReportAction}
                        shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
                    />
                    {!!reportStable?.reportID && (
                        <ShowPreviousMessagesButton
                            reportID={reportStable.reportID}
                            actionType={reportAction.actionName}
                            hasPreviousMessages={!!hasPreviousMessages}
                            showFullHistory={!showHiddenHistory}
                            onPress={onShowPreviousMessages}
                        />
                    )}
                </ReportActionIndexContext.Provider>
            );
        },
        [
            actionIndexMap,
            draftReportActionID,
            firstVisibleReportActionID,
            hasPreviousMessages,
            isOffline,
            linkedReportActionID,
            onShowPreviousMessages,
            parentReportAction,
            parentReportActionForTransactionThread,
            isHarvestCreatedExpenseReportAction,
            renderedVisibleReportActions,
            reportStable,
            chatReportStable,
            shouldHideThreadDividerLine,
            shouldUseThreadDividerLine,
            showHiddenHistory,
            transactionThreadReport,
            unreadMarkerReportActionID,
        ],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = useMemo(
        () => [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined, isArchivedNonExpenseReport(report, isReportArchived), draftReportActionID, draftMessageHTML],
        [draftMessageHTML, draftReportActionID, unreadMarkerReportActionID, shouldUseNarrowLayout, report, isReportArchived],
    );
    const canShowHeader = isOffline || hasHeaderRendered.current;

    const onLayoutInner = useCallback(
        (event: LayoutChangeEvent) => {
            onLayout(event);
            if (isScrollToBottomEnabled) {
                reportScrollManager.scrollToBottom();
                setIsScrollToBottomEnabled(false);
                completeLiveTailPruneAfterScrollToBottom();
            }
        },
        [isScrollToBottomEnabled, onLayout, reportScrollManager, completeLiveTailPruneAfterScrollToBottom, setIsScrollToBottomEnabled],
    );

    const retryLoadNewerChatsError = useCallback(() => {
        loadNewerChats(true);
    }, [loadNewerChats]);

    const listHeaderComponent = useMemo(() => {
        // In case of an error we want to display the header no matter what.
        if (!canShowHeader) {
            hasHeaderRendered.current = true;

            // Empty spacer so FlashList wraps a header and ListHeaderComponentStyle (flex: 1) applies —
            // the wrapper sits at the visual bottom of the inverted list and pins items to the visual top.
            return shouldBeAlignedToTop ? <View /> : null;
        }

        return (
            <ReportActionsListHeader
                reportID={report.reportID}
                onRetry={retryLoadNewerChatsError}
                hasActiveDraft={hasActiveDraft}
            />
        );
    }, [canShowHeader, hasActiveDraft, report.reportID, retryLoadNewerChatsError, shouldBeAlignedToTop]);

    const shouldShowSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = useMemo(() => {
        if (!shouldShowSkeleton) {
            return;
        }

        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }, [shouldShowSkeleton]);

    const handleStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        TransitionTracker.runAfterTransitions({
            callback: () => {
                requestAnimationFrame(() => loadNewerChats(false));
            },
        });
    }, [loadNewerChats]);

    const onEndReached = useCallback(() => {
        loadOlderChats(false);
    }, [loadOlderChats]);

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

    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
    });

    return (
        <>
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
                actionBadge={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.actionBadge : undefined}
                actionBadgeBrickRoadStatus={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.brickRoadStatus : undefined}
                onActionBadgePress={scrollToActionBadgeTarget}
                isMarkAsDone={shouldUseMarkAsDoneCopy}
            />
            <ReportActionsListPaddingView
                report={report}
                isReportArchived={isReportArchived}
            >
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
                    contentContainerStyle={styles.chatContentScrollView}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={handleStartReached}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={listHeaderComponent}
                    ListHeaderComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    onLayout={onLayoutInner}
                    onScroll={trackVerticalScrolling}
                    onViewableItemsChanged={onViewableItemsChanged}
                    extraData={extraData}
                    key={listID}
                    overrideProps={{
                        isInvertedVirtualizedList: true,
                        contentOffset: shouldFocusToTopOnMount ? {x: 0, y: windowHeight} : undefined,
                    }}
                    getItemType={(item) => item.actionName}
                    shouldMaintainVisibleContentPosition={shouldMaintainVisibleContentPosition}
                    initialScrollIndex={shouldFocusToTopOnMount ? renderedVisibleReportActions.length - 1 : undefined}
                    initialScrollIndexParams={shouldFocusToTopOnMount ? {viewOffset: windowHeight} : undefined}
                    maintainVisibleContentPosition={
                        shouldAutoscrollToBottom ? {autoscrollToBottomThreshold: CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD, animateAutoScrollToBottom: false} : undefined
                    }
                    onLoad={onLoad}
                    initialScrollKey={initialScrollKey}
                    onContentSizeChange={() => {
                        trackVerticalScrolling(undefined);
                    }}
                />
            </ReportActionsListPaddingView>
        </>
    );
}

export default memo(ReportActionsList);
