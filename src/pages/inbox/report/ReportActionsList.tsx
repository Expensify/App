import {useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlashList from '@components/FlashList/InvertedFlashList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useEnvironment from '@hooks/useEnvironment';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsPagination from '@hooks/useReportActionsPagination';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useReportActionsVisibility from '@hooks/useReportActionsVisibility';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    getFirstVisibleReportActionID,
    getReportActionMessage,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isNewerReportAction,
    isReversedTransaction,
    isTransactionThread,
} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction,
    chatIncludesChronosWithID,
    isArchivedNonExpenseReport,
    isCanceledTaskReport,
    isExpenseReport,
    isHarvestCreatedExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isReportTransactionThread as isReportTransactionThreadUtil,
    isTaskReport,
    isUnread,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useConciergeSessionActions, useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import FloatingMessageCounter from './FloatingMessageCounter';
import ReportActionIndexContext from './ReportActionIndexContext';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ReportActionsListPaddingView from './ReportActionsListPaddingView';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';

type ReportActionsListProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    /** Callback executed on list layout */
    onLayout?: (event: LayoutChangeEvent) => void;
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

function ReportActionsList({reportID, onLayout}: ReportActionsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isProduction} = useEnvironment();

    const {isOffline} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;

    // Side effects that must run whenever the chat list is shown.
    useCopySelectionHelper();
    usePendingConciergeResponse(reportID);

    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const {
        reportActions,
        allReportActions,
        allReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReportID,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
        reportPreviewAction,
    } = useReportActionsPagination(reportID, reportActionIDFromRoute);

    const parentReportAction = useParentReportAction(report);

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const isLoadingInitialReportActions = reportLoadingState?.isLoadingInitialReportActions;
    const hasOnceLoadedReportActions = reportLoadingState?.hasOnceLoadedReportActions;

    const {currentReportID} = useCurrentReportIDState();
    const {sessionStartTime, showFullHistory: conciergeShowFullHistory, hadMessagesAtSessionStart: conciergeHadMessagesAtSessionStart} = useConciergeSessionState();
    const {startSession, setShowFullHistory: setConciergeShowFullHistory, setHadMessagesAtSessionStart: setConciergeHadMessagesAtSessionStart} = useConciergeSessionActions();
    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = !!canUserPerformWriteAction(report, isReportArchived);

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const [reportPaginationState] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${reportID}`);

    const didLayout = useRef(false);

    useEffect(() => {
        didLayout.current = false;
    }, [reportID]);

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionIDFromRoute || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, reportActionIDFromRoute]);

    // Remount the list when the deep-linked message or unread anchor changes (scroll positioning), or when the report changes.
    const listID = [reportID, reportActionIDFromRoute, hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID].join(':');

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        newestFetchedReportActionID: reportPaginationState?.newestFetchedReportActionID,
    });

    const {
        sortedReportActions,
        sortedVisibleReportActions,
        isConciergeMainDM,
        isConciergeHiddenHistory,
        showConciergeSidePanelWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    } = useReportActionsVisibility({
        reportID,
        reportActions,
        allReportActions,
        canPerformWriteAction,
        hasOlderActions,
        loadOlderChats,
        mainDMSessionStartTime: sessionStartTime,
        conciergeShowFullHistory: conciergeShowFullHistory || !!reportActionIDFromRoute || !!report?.hasOutstandingChildTask,
        setConciergeShowFullHistory,
        conciergeHadMessagesAtSessionStart,
        setConciergeHadMessagesAtSessionStart,
    });

    // hasOnceLoadedReportActions is RAM-only and resets to falsy on a page
    // refresh, but cached report actions persist in Onyx. Gating the session
    // start on it alone would leave sessionStartTime null until openReport
    // returns, during which filterActions collapses the cached history down to
    // just the synthetic CREATED action (an almost-empty chat flash). Start the
    // session as soon as cached actions exist so messages render immediately on
    // refresh, matching the skeleton-suppression gate below.
    const canStartConciergeSession = !!hasOnceLoadedReportActions || allReportActions.length > 0;

    useLayoutEffect(() => {
        if (!isConciergeMainDM || !canStartConciergeSession) {
            return;
        }
        startSession(oldestUnreadReportAction ? report?.lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- startSession is stable; captured values at mount only
    }, [isConciergeMainDM, startSession, canStartConciergeSession]);

    // On native the component stays mounted in the navigation stack, so the
    // effect above never re-fires (its isConciergeMainDM dep is always true).
    // Re-trigger startSession when the globally-focused report matches this
    // report so the session age check runs after navigating away and back.
    useLayoutEffect(() => {
        if (!isConciergeMainDM || !canStartConciergeSession || currentReportID !== reportID) {
            return;
        }
        startSession(oldestUnreadReportAction ? report?.lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to currentReportID returning to this report
    }, [currentReportID, reportID, isConciergeMainDM, canStartConciergeSession, startSession]);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);

    const reportAttributesSelector = useCallback(
        (value: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => {
            const attrs = value?.reports?.[reportID];
            if (!attrs) {
                return undefined;
            }
            return {
                actionBadge: attrs.actionBadge,
                actionTargetReportActionID: attrs.actionTargetReportActionID,
                brickRoadStatus: attrs.brickRoadStatus,
            };
        },
        [reportID],
    );
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesSelector,
    });
    const isHarvestCreatedExpenseReportAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

    const stableReportSelector = useCallback((reportEntry: OnyxEntry<OnyxTypes.Report>) => getStableReportSelector(reportEntry), []);
    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: stableReportSelector});
    const [chatReportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportStable?.chatReportID)}`, {selector: stableReportSelector});

    const linkedReportActionID = reportActionIDFromRoute;

    const hasHeaderRendered = useRef(false);

    const {scrollOffsetRef} = useContext(ActionListContext);
    const {draftReportAction, hasActiveDraft, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft} = useConciergeDraftActions();

    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;
    const onShowPreviousMessages = handleShowPreviousMessages;

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(() => scrollOffsetRef.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);

    const {unreadMarkerReportActionID, unreadMarkerReportActionIndex} = useUnreadMarker({
        reportID,
        sortedVisibleReportActions,
        sortedReportActions,
        oldestUnreadReportActionID: oldestUnreadReportAction?.reportActionID,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!hasOnceLoadedReportActions,
    });

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID,
        report,
        transactionThreadReport,
        sortedVisibleReportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
    });

    const renderedVisibleReportActions = useMemo(() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && sessionStartTime && draftReportAction.created < sessionStartTime) {
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
    }, [sessionStartTime, draftReportAction, isDraftPendingCompletion, showHiddenHistory, sortedVisibleReportActions]);

    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const draftReportActionID = draftReportAction?.reportActionID;
    const isSyntheticDraftVisible = !!draftReportAction && renderedVisibleReportActions !== sortedVisibleReportActions;
    const draftAutoScrollKey = isSyntheticDraftVisible ? `${draftReportAction.reportActionID}:${draftMessageHTML ?? ''}` : '';

    useEffect(() => {
        if (!draftReportAction || isSyntheticDraftVisible) {
            return;
        }

        clearDraft();
    }, [clearDraft, draftReportAction, isSyntheticDraftVisible]);

    // Find the index of the action badge target in the rendered actions list (which is what the FlatList uses as data)
    const actionBadgeTargetIndex = useMemo(() => {
        const targetID = reportAttributes?.actionTargetReportActionID;
        if (!targetID) {
            return -1;
        }
        return renderedVisibleReportActions.findIndex((action) => action.reportActionID === targetID);
    }, [reportAttributes?.actionTargetReportActionID, renderedVisibleReportActions]);

    const {
        listRef,
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        flushPendingScrollToBottom,
        shouldBeAlignedToTop,
        shouldFocusToTopOnMount,
        initialScrollKey,
        shouldAutoscrollToBottom,
        onLoad,
    } = useReportActionsScroll({
        reportID,
        report,
        transactionThreadReport,
        parentReportAction,
        sortedVisibleReportActions,
        markNewestActionAsRead,
        completeSkippedMarkAsRead,
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex,
        hasNewerActions,
        draftAutoScrollKey,
        actionBadgeTargetIndex,
        sortedAllReportActionsForPagination: sortedAllReportActions ?? [],
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
    });

    const trackScrollPositionAndThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        trackVerticalScrolling(event);
        setHasScrolledOverThreshold(event.nativeEvent.contentOffset.y >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
    };

    const loadNewerChatsAfterTransitions = () => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        TransitionTracker.runAfterTransitions({
            callback: () => {
                requestAnimationFrame(() => loadNewerChats(false));
            },
        });
    };

    const shouldMaintainVisibleContentPosition = hasScrolledOverThreshold || shouldFocusToTopOnMount;

    // Same-screen report switches reuse this instance; per-report one-shot flags must not leak across reports.
    useEffect(() => {
        hasHeaderRendered.current = false;
    }, [reportID]);

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
                reportID={reportID}
                onRetry={() => loadNewerChats(true)}
                hasActiveDraft={hasActiveDraft}
            />
        );
    }, [canShowHeader, hasActiveDraft, reportID, loadNewerChats, shouldBeAlignedToTop]);

    const shouldShowOfflineSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = useMemo(() => {
        if (!shouldShowOfflineSkeleton) {
            return;
        }

        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }, [shouldShowOfflineSkeleton]);

    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
    });

    const isSingleExpenseReport = reportPreviewAction?.childMoneyRequestCount === 1;
    const isMissingTransactionThreadReportID = !transactionThreadReport?.reportID;
    const isReportDataIncomplete = isSingleExpenseReport && isMissingTransactionThreadReportID;
    const isMissingReportActions = sortedVisibleReportActions.length === 0;

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = (event: LayoutChangeEvent) => {
        onLayout?.(event);
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;

        if (report) {
            markOpenReportEnd(report, {warm: true});
        }
    };

    const shouldShowSkeletonForInitialLoad = !!isLoadingInitialReportActions && (isReportDataIncomplete || isMissingReportActions) && !isOffline;

    const shouldShowSkeletonForAppLoad = isLoadingApp && !isOffline;

    // Show skeleton for the Concierge chat (side panel or main DM) until report
    // data has been loaded at least once. Before the first openReport response,
    // hasOlderActions is unreliable, so we can't determine whether to show the
    // greeting or onboarding messages. The skeleton avoids flashing wrong content.
    // hasOnceLoadedReportActions is RAM-only and resets on a page refresh, but
    // cached report actions persist in Onyx. For the main DM, render those cached
    // actions immediately (matching production) instead of flashing a skeleton on
    // every refresh; the side panel always opens fresh so it keeps gating on
    // hasOnceLoadedReportActions only. allReportActions excludes the synthetic
    // CREATED action that is always injected for Concierge, so it is empty only on
    // a genuinely cold load with no cached history.
    const shouldShowSkeletonForConciergePanel = isConciergeHiddenHistory && !hasOnceLoadedReportActions && !(isConciergeMainDM && allReportActions.length > 0) && !isOffline;

    const shouldShowInitialSkeleton = shouldShowSkeletonForConciergePanel || shouldShowSkeletonForInitialLoad || shouldShowSkeletonForAppLoad;

    useEffect(() => {
        if (!shouldShowInitialSkeleton || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowInitialSkeleton]);

    const isReportUnread = isUnread(report, transactionThreadReport, isReportArchived);

    // When opening an unread report, it is very likely that the message we will open to is not the latest,
    // which is the only one we will have in cache.
    const isInitiallyLoadingReport = isReportUnread && !!reportLoadingState?.isLoadingInitialReportActions && reportActions.length <= 1;

    // Same for unread messages, we need to wait for the results from the OpenReport API call
    // if the oldest unread report action is not available yet. Only applies during the *first* load
    // for this report: after `hasOnceLoadedReportActions` is set, a later "mark as unread" must not
    // bring back this loading gate (we are not re-opening the report from a cold cache).
    const isUnreadMessagePageLoadingInitially = !reportActionIDFromRoute && isReportUnread && !oldestUnreadReportAction && !hasOnceLoadedReportActions;

    // Once all the above conditions are met, we can consider the report ready.
    const isReportLoading = isInitiallyLoadingReport || isUnreadMessagePageLoadingInitially;
    const isReportReady = isOffline || !isReportLoading;

    if (isLoadingOnyxValue(reportResult) || !report || !isReportReady || shouldShowInitialSkeleton) {
        return <ReportActionsSkeletonView />;
    }

    const hasDerivedValueTimingIssue = reportActions.length > 0 && isMissingReportActions;
    if ((hasDerivedValueTimingIssue || (!isReportTransactionThread && isMissingReportActions)) && !showConciergeSidePanelWelcome) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

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
                    ref={listRef}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={renderedVisibleReportActions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    drawDistance={1500}
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={styles.chatContentScrollView}
                    onEndReached={() => loadOlderChats(false)}
                    onEndReachedThreshold={0.75}
                    onStartReached={loadNewerChatsAfterTransitions}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={listHeaderComponent}
                    ListHeaderComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    onLayout={(event) => {
                        recordTimeToMeasureItemLayout(event);
                        flushPendingScrollToBottom();
                    }}
                    onScroll={trackScrollPositionAndThreshold}
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
