import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import allowLegendListItemOverflow from '@components/LegendList/allowLegendListItemOverflow';
import MerchantRuleSuggestionBanner from '@components/MerchantRuleSuggestionBanner';
import {ReportActionsAnimatedSkeletonCover} from '@components/ReportActionsSkeletonCover';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import useEnvironment from '@hooks/useEnvironment';
import useInitial from '@hooks/useInitial';
import useLinkedMessageOfflineLoading from '@hooks/useLinkedMessageOfflineLoading';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useReportsParentHierarchy from '@hooks/useReportsParentHierarchy';
import useRetireMerchantRuleSuggestionOnLeave from '@hooks/useRetireMerchantRuleSuggestionOnLeave';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    getFirstVisibleReportActionID,
    getFeedbackPromptActionIDs,
    getReportActionMessage,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isNewerReportAction,
    isReversedTransaction,
    isTransactionThread,
    shouldHidePayAction,
} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isCanceledTaskReport,
    isExpenseReport,
    isHarvestCreatedExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isResolvedSupportTicket,
    isTaskReport,
    isSupportTicket,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useActionListContext, useActionListRef} from '@pages/inbox/ActionListContext';
import type {ActionListRef} from '@pages/inbox/ActionListTypes';
import {useConciergeChatHistoryActions} from '@pages/inbox/ConciergeChatHistoryContext';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {LegendListRef, LegendListRenderItemProps, OnViewableItemsChangedInfo} from '@legendapp/list/react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {LegendList} from '@legendapp/list/react-native';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {getCustomAgentAccountIDs} from '@selectors/AgentZeroChat';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {accountIDSelector} from '@selectors/Session';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Platform, View} from 'react-native';

import AskConciergeWelcome from './AskConciergeWelcome';
import CollapsedSystemMessages from './CollapsedSystemMessages';
import ConciergeChatHistoryToggle from './ConciergeChatHistoryToggle';
import FloatingMessageCounter from './FloatingMessageCounter';
import {ReportActionPositionContextProvider} from './ReportActionIndexContext';
import {useReportActionsListActions, useReportActionsListState} from './ReportActionsListContext';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ReportActionsListPaddingView from './ReportActionsListPaddingView';
import ReportActionsSkeletonGuard from './ReportActionsSkeletonGuard';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';
import useFollowActionBadgeTarget from './useFollowActionBadgeTarget';
import useReportActionsPresentation from './useReportActionsPresentation';
import useScrollToEditingReportAction from './useScrollToEditingReportAction';

type ReportActionsListContentProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    conciergeChat: OnyxEntry<OnyxTypes.Report>;
    onLayout?: (event: LayoutChangeEvent) => void;
};

type ReportActionsListProps = ReportActionsListContentProps;

const PAGINATION_THRESHOLD = 0.75;
const REPORT_ACTIONS_DRAW_DISTANCE = 1500;

const REPORT_ACTION_COMMENT_SIZE = {
    SHORT: 'short',
    MEDIUM: 'medium',
    LONG: 'long',
    EXTRA_LONG: 'extra-long',
} as const;

// Character-count boundaries used to bucket comments so LegendList can recycle similarly sized items.
const REPORT_ACTION_COMMENT_SHORT_MAX_LENGTH = 80;
const REPORT_ACTION_COMMENT_MEDIUM_MAX_LENGTH = 320;
const REPORT_ACTION_COMMENT_LONG_MAX_LENGTH = 1200;

function getReportActionCommentSize(messageLength: number): string {
    if (messageLength <= REPORT_ACTION_COMMENT_SHORT_MAX_LENGTH) {
        return REPORT_ACTION_COMMENT_SIZE.SHORT;
    }
    if (messageLength <= REPORT_ACTION_COMMENT_MEDIUM_MAX_LENGTH) {
        return REPORT_ACTION_COMMENT_SIZE.MEDIUM;
    }
    if (messageLength <= REPORT_ACTION_COMMENT_LONG_MAX_LENGTH) {
        return REPORT_ACTION_COMMENT_SIZE.LONG;
    }
    return REPORT_ACTION_COMMENT_SIZE.EXTRA_LONG;
}

function getItemType(item: OnyxTypes.ReportAction): string {
    if (item.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
        return item.actionName;
    }

    const message = getReportActionMessage(item);
    const commentSize = getReportActionCommentSize(message?.text.length ?? 0);

    if (item.isAttachmentOnly) {
        return `${item.actionName}-attachment`;
    }
    if (item.isAttachmentWithText) {
        return `${item.actionName}-attachment-${commentSize}`;
    }
    if (item.linkMetadata?.length) {
        return `${item.actionName}-link-preview-${commentSize}`;
    }
    return `${item.actionName}-${commentSize}`;
}

/**
 * Create a unique key for each action in the list.
 * We use the reportActionID that is a string representation of a random 64-bit int, which should be
 * random enough to avoid collisions
 */
function keyExtractor(item: OnyxTypes.ReportAction): string {
    // A report has exactly one CREATED action. Using a stable key lets the list recycle the same cell
    // when the optimistic CREATED is swapped for the server one, avoiding a remount-induced scroll jump.
    if (item.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return CONST.REPORT.ACTIONS.TYPE.CREATED;
    }
    return item.reportActionID;
}

/**
 * Renders the report-actions list. Reads its data from `ReportActionsListStateContext` / `ReportActionsListActionsContext` and holds the
 * UI-close hooks (`useUnreadMarker` / `useMarkAsRead` / `useReportActionsScroll`). `ReportActionsSkeletonGuard`
 * mounts it only once content is ready, so those hooks never run while a skeleton shows.
 */
function ReportActionsListContent({reportID, conciergeChat, onLayout}: ReportActionsListContentProps) {
    const isFocused = useIsFocused();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    const {
        report,
        hasOnceLoadedReportActions,
        isInitialReportLoadPending,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        hasOlderActions,
        hasNewerActions,
        oldestReportActionID,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        parentReportAction,
        sortedReportActions: unfilteredReportActions,
        sortedVisibleReportActions: unfilteredVisibleReportActions,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
        allReportActionIDs,
        shouldShowConciergeWelcome,
        isConciergeHistoryExpanded,
    } = useReportActionsListState();

    // Remove rows hidden by the renderer before calculating summary counts, headers, and scroll positions.
    const sortedReportActions = report?.isWaitingOnBankAccount ? unfilteredReportActions.filter((action) => !shouldHidePayAction(action, true)) : unfilteredReportActions;
    const sortedVisibleReportActions = report?.isWaitingOnBankAccount
        ? unfilteredVisibleReportActions.filter((action) => !shouldHidePayAction(action, true))
        : unfilteredVisibleReportActions;

    const {setTreatAsNoPaginationAnchor, loadOlderChats, loadNewerChats, handleShowPreviousMessages} = useReportActionsListActions();

    const {isOffline} = useNetwork();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const {sessionStartTime} = useSidePanelState();
    const {collapseHistory: collapseConciergeHistory} = useConciergeChatHistoryActions();

    const lastRequestedOldestActionIDRef = useRef<string | undefined>(undefined);
    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true});

    useLinkedMessageOfflineLoading({reportID: report?.reportID ?? reportID, reportActionIDFromRoute});

    // Owned here rather than by the callout, which unmounts as the layout and composer change size.
    useRetireMerchantRuleSuggestionOnLeave(reportID);

    // Clearing a link after sending returns to the live tail of the same list. Only opening a link
    // needs fresh initial positioning, including reopening the same action after its link was cleared.
    const [linkedActionListState, setLinkedActionListState] = useState({reportActionID: reportActionIDFromRoute, version: 0});
    if (linkedActionListState.reportActionID !== reportActionIDFromRoute) {
        setLinkedActionListState({
            reportActionID: reportActionIDFromRoute,
            version: linkedActionListState.version + (reportActionIDFromRoute ? 1 : 0),
        });
    }

    // OpenReport can first provide a tiny cached page and then replace it with the hydrated page. Remounting
    // gives the complete dataset a fresh initial layout so initialScrollAtEnd targets its actual end.
    const listID = [
        reportID,
        linkedActionListState.version,
        hasOnceLoadedReportActions ? 'hydrated' : 'initial',
        hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID,
    ].join(':');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const isReportArchived = !!isArchivedReport(reportNameValuePairs);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const reportAttributesSelector = (value: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => {
        const attrs = value?.reports?.[reportID];
        if (!attrs) {
            return undefined;
        }
        return {
            actionBadge: attrs.actionBadge,
            actionTargetReportActionID: attrs.actionTargetReportActionID,
            brickRoadStatus: attrs.brickRoadStatus,
        };
    };
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesSelector,
    });
    const isHarvestCreatedExpenseReportAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getStableReportSelector});
    const [chatReportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportStable?.chatReportID)}`, {selector: getStableReportSelector});
    const reportsParentHierarchy = useReportsParentHierarchy(reportID);

    const linkedReportActionID = reportActionIDFromRoute;

    const {getScrollOffset, scrollOffsetRef} = useActionListContext();
    const listRef = useActionListRef();
    const legendListRef = useRef<LegendListRef>(null);

    useImperativeHandle(
        listRef,
        (): ActionListRef => ({
            getScrollableNode: (): unknown => legendListRef.current?.getScrollableNode(),
            getState: () => legendListRef.current?.getState(),
            computeVisibleIndices: () => {
                const state = legendListRef.current?.getState();
                return state ? {startIndex: state.start, endIndex: state.end} : undefined;
            },
            scrollToEnd: (options) => {
                legendListRef.current?.scrollToEnd(options);
            },
            scrollToIndex: (options) => {
                legendListRef.current?.scrollToIndex(options);
            },
            scrollToOffset: (options) => {
                legendListRef.current?.scrollToOffset(options);
            },
        }),
        [],
    );

    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft, revealDraftFromReportAction} = useConciergeDraftActions();

    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(() => getScrollOffset() >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
    const shouldRestoreTailAfterHistoryRevealRef = useRef(false);
    const oldestLoadedActionID = allReportActionIDs.at(-1);
    const oldestLoadedActionIDAtHistoryRevealRef = useRef<string | undefined>(undefined);
    const distanceFromBottomRef = useRef(getScrollOffset());
    const shouldFollowEndOnResizeRef = useRef(false);
    const onShowPreviousMessages = () => {
        // Revealing older actions can make a short session scrollable before the requested history page arrives.
        // Follow the tail only when the reader was actually there; the action-visible threshold is much wider.
        shouldRestoreTailAfterHistoryRevealRef.current = distanceFromBottomRef.current <= 1 && !hasNewerActions;
        oldestLoadedActionIDAtHistoryRevealRef.current = shouldRestoreTailAfterHistoryRevealRef.current && hasOlderActions ? oldestLoadedActionID : undefined;
        if (shouldRestoreTailAfterHistoryRevealRef.current) {
            shouldFollowEndOnResizeRef.current = true;
        }
        handleShowPreviousMessages();
    };

    const {unreadMarkerReportActionID} = useUnreadMarker({
        reportID,
        sortedVisibleReportActions,
        sortedReportActions,
        oldestUnreadReportActionID: oldestUnreadReportAction?.reportActionID,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!hasOnceLoadedReportActions,
        newMessageBoundaryTime: isConciergeHiddenHistory ? sessionStartTime : undefined,
    });

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID,
        report,
        transactionThreadReport,
        sortedVisibleReportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
    });

    const persistedDraftReportAction = draftReportAction
        ? (sortedAllReportActions ?? sortedVisibleReportActions).find(
              (action) => action.reportActionID === draftReportAction.reportActionID && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
          )
        : undefined;

    const shouldHideSupportTicketSurvey = isSupportTicket(report) && (!isResolvedSupportTicket(report) || !!reportNameValuePairs?.reopenedAsReportID);
    const latestResolvedSupportTicketAction = sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
    const latestSupportTicketSurveyAction = latestResolvedSupportTicketAction
        ? sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && action.created >= latestResolvedSupportTicketAction.created)
        : undefined;

    const visibleReportActions = (() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && sessionStartTime && draftReportAction.created < sessionStartTime) {
            return sortedVisibleReportActions;
        }

        // A completed reveal belongs to the saved action, even when pagination keeps that action off screen.
        if (persistedDraftReportAction && !isDraftPendingCompletion) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic draft into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === draftReportAction.reportActionID) {
                // Completed local replies can retain their pending add flag after the server merges followups.
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
    })();

    const shouldFilterSupportTicketSurveys =
        isSupportTicket(report) &&
        visibleReportActions.some(
            (action) =>
                action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY &&
                (shouldHideSupportTicketSurvey || action.reportActionID !== latestSupportTicketSurveyAction?.reportActionID),
        );
    const renderedVisibleReportActions = shouldFilterSupportTicketSurveys
        ? visibleReportActions.filter(
              (action) =>
                  action.actionName !== CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY ||
                  (!shouldHideSupportTicketSurvey && action.reportActionID === latestSupportTicketSurveyAction?.reportActionID),
          )
        : visibleReportActions;

    // OpenReport starts with a tiny cached page before replacing it with the hydrated page. Keep that
    // already-visible page mounted until hydration finishes instead of exposing intermediate estimated
    // layouts. The hydrated list then mounts from scratch using the full dataset.
    const initialReportActionsSnapshot = useInitial(renderedVisibleReportActions.length > 0 ? renderedVisibleReportActions : undefined);
    const [hasReleasedInitialSnapshot, setHasReleasedInitialSnapshot] = useState(isOffline || !isInitialReportLoadPending || showFullHistory);
    if (!hasReleasedInitialSnapshot && (isOffline || !isInitialReportLoadPending || showFullHistory)) {
        setHasReleasedInitialSnapshot(true);
    }
    const shouldKeepInitialSnapshot = !hasReleasedInitialSnapshot;
    const reportActionsToRender = shouldKeepInitialSnapshot ? (initialReportActionsSnapshot ?? renderedVisibleReportActions) : renderedVisibleReportActions;

    // Report actions are stored newest-first. LegendList renders them chronologically.
    const chronologicalReportActions = [...reportActionsToRender].reverse();
    const shouldCollapseSystemMessages = isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report) || isTransactionThread(parentReportAction);
    const {
        displayReportActions,
        runsByAnchorReportActionID,
        reportActionIDToDisplayIndex,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
    } = useReportActionsPresentation({
        visibleReportActions: shouldCollapseSystemMessages ? chronologicalReportActions : [],
        linkedReportActionID,
        unreadMarkerReportActionID,
    });
    const listData = shouldCollapseSystemMessages ? displayReportActions : chronologicalReportActions;
    const canonicalIndexByReportActionID = new Map(reportActionsToRender.map((action, index) => [action.reportActionID, index]));

    useEffect(() => {
        if (!showFullHistory) {
            shouldRestoreTailAfterHistoryRevealRef.current = false;
            return;
        }
        if (!shouldRestoreTailAfterHistoryRevealRef.current) {
            return;
        }
        const animationFrame = requestAnimationFrame(() => {
            if (!shouldRestoreTailAfterHistoryRevealRef.current || !shouldFollowEndOnResizeRef.current) {
                return;
            }
            legendListRef.current?.scrollToEnd({animated: false});
            const hasReceivedHistoryPage = oldestLoadedActionID !== oldestLoadedActionIDAtHistoryRevealRef.current || !hasOlderActions;
            if (!oldestLoadedActionIDAtHistoryRevealRef.current || (!isLoadingOlderReportActions && (hasReceivedHistoryPage || hasLoadingOlderReportActionsError))) {
                shouldRestoreTailAfterHistoryRevealRef.current = false;
            }
        });
        return () => cancelAnimationFrame(animationFrame);
    }, [showFullHistory, listData.length, oldestLoadedActionID, hasOlderActions, isLoadingOlderReportActions, hasLoadingOlderReportActionsError]);

    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const draftReportActionID = draftReportAction?.reportActionID;
    const isSyntheticDraftVisible = !!draftReportAction && renderedVisibleReportActions !== sortedVisibleReportActions;

    useEffect(() => {
        if (!draftReportAction || isSyntheticDraftVisible) {
            return;
        }

        clearDraft();
    }, [clearDraft, draftReportAction, isSyntheticDraftVisible]);

    useEffect(() => {
        if (!isDraftPendingCompletion || !draftReportAction || !persistedDraftReportAction) {
            return;
        }

        // The persisted action is the durable completion signal when a terminal Pusher event is missed.
        // Reconcile by action ID even when its HTML is byte-identical to the last streamed draft.
        revealDraftFromReportAction(persistedDraftReportAction);
    }, [draftReportAction, isDraftPendingCompletion, persistedDraftReportAction, revealDraftFromReportAction]);

    const reportScrollManager = useReportScrollManager();

    // Which rows are on screen, tracked so an edit started on a message the user can already see doesn't move the list.
    const viewableRowIndexesRef = useRef<Set<number>>(new Set());

    const expandedFocusIndex = focusRequestedReportActionID ? (reportActionIDToDisplayIndex.get(focusRequestedReportActionID) ?? -1) : -1;
    useEffect(() => {
        if (expandedFocusIndex < 0 || viewableRowIndexesRef.current.has(expandedFocusIndex)) {
            return;
        }

        // An off-window revealed message must mount before it can hand off focus.
        const frame = requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({index: expandedFocusIndex, animated: false, viewPosition: 0.5});
        });
        return () => cancelAnimationFrame(frame);
    }, [expandedFocusIndex, focusRequestedReportActionID, listRef]);

    // The rendered indexes are known here, so scrolling the row into view mounts it and keeps the message visible while it's edited.
    useScrollToEditingReportAction({
        visibleReportActions: listData,
        scrollToIndex: (index) => {
            // Already on screen, so its editor has mounted and taken focus — scrolling would only yank the user.
            if (viewableRowIndexesRef.current.has(index)) {
                return;
            }

            reportScrollManager.scrollToIndex(index, {animated: false, viewPosition: 0.5});
        },
    });

    // Find the index of the action badge target in the chronological data rendered by LegendList.
    const actionBadgeTargetID = reportAttributes?.actionTargetReportActionID;
    const actionBadgeTargetIndex = actionBadgeTargetID
        ? (reportActionIDToDisplayIndex.get(actionBadgeTargetID) ?? listData.findIndex((action) => action.reportActionID === actionBadgeTargetID))
        : -1;
    const unreadMarkerListIndex = shouldCollapseSystemMessages ? unreadMarkerReportActionIndex : listData.findIndex((action) => action.reportActionID === unreadMarkerReportActionID);

    const {
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        shouldBeAlignedToTop,
        initialScrollIndex,
        initialScrollIndexParams,
        onLoad,
        onItemSizeChanged,
        trackLinkedMessageScroll,
        stopLinkedMessagePositioning,
    } = useReportActionsScroll({
        listID,
        reportID,
        conciergeChat,
        report,
        transactionThreadReport,
        parentReportAction,
        sortedVisibleReportActions,
        renderedVisibleReportActions: listData,
        reportActionIDToDisplayIndex,
        keyExtractor,
        markNewestActionAsRead,
        completeSkippedMarkAsRead,
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex: unreadMarkerListIndex,
        hasNewerActions,
        actionBadgeTargetIndex,
        sortedAllReportActionsForPagination: sortedAllReportActions ?? [],
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
    });

    const [loadedInitialViewportListID, setLoadedInitialViewportListID] = useState<string>();
    // Cover every initial LegendList layout, including cached chats, until the rows are positioned.
    const shouldShowInitialViewportSkeleton = !isOffline && (isInitialReportLoadPending || loadedInitialViewportListID !== listID);

    useEffect(() => {
        if (!isFocused || shouldShowInitialViewportSkeleton || loadedInitialViewportListID !== listID) {
            return;
        }
        // onReady positions the list, but only this committed render has removed its cover.
        // Refocus also completes new spans when the positioned list stays mounted.
        markOpenReportEnd(reportID, report, {warm: true});
    }, [isFocused, listID, loadedInitialViewportListID, report, reportID, shouldShowInitialViewportSkeleton]);

    const readyEndListIDRef = useRef<string | undefined>(undefined);
    const lastScrollMetricsRef = useRef<{offset: number; contentHeight: number; viewportHeight: number} | undefined>(undefined);
    const endCorrectionFrameRef = useRef<number | undefined>(undefined);
    const userScrolledListIDRef = useRef<string | undefined>(undefined);

    const stopFollowingEnd = () => {
        userScrolledListIDRef.current = listID;
        shouldFollowEndOnResizeRef.current = false;
        shouldRestoreTailAfterHistoryRevealRef.current = false;
        if (endCorrectionFrameRef.current === undefined) {
            return;
        }
        cancelAnimationFrame(endCorrectionFrameRef.current);
        endCorrectionFrameRef.current = undefined;
    };

    const handleScrollBeginDrag = () => {
        stopLinkedMessagePositioning();
        stopFollowingEnd();
    };

    const scheduleEndCorrection = () => {
        if (readyEndListIDRef.current !== listID || !shouldFollowEndOnResizeRef.current || hasNewerActions || endCorrectionFrameRef.current !== undefined) {
            return;
        }
        endCorrectionFrameRef.current = requestAnimationFrame(() => {
            endCorrectionFrameRef.current = undefined;
            if (readyEndListIDRef.current === listID && shouldFollowEndOnResizeRef.current) {
                legendListRef.current?.scrollToEnd({animated: false});
            }
        });
    };

    useEffect(
        () => () => {
            if (endCorrectionFrameRef.current === undefined) {
                return;
            }
            cancelAnimationFrame(endCorrectionFrameRef.current);
            endCorrectionFrameRef.current = undefined;
        },
        [listID],
    );

    const updateVisibleItemOverflow = (info: OnViewableItemsChangedInfo<OnyxTypes.ReportAction>) => {
        viewableRowIndexesRef.current = new Set(info.viewableItems.map((token) => token.index));
        onViewableItemsChanged(info);
        for (const item of info.changed) {
            if (!item.isViewable) {
                continue;
            }
            allowLegendListItemOverflow(legendListRef.current, item.index);
        }
    };

    const handleListReady = () => {
        // onLoad only means rows rendered; keep their estimated positions covered until initial scrolling settles.
        onLoad();
        setLoadedInitialViewportListID(listID);
        readyEndListIDRef.current = listID;
        // An unread marker near the newest action lands at the end. Rows above it are still measured after
        // onReady, so keep that end in view instead of exposing older messages.
        const isUnreadInitialScroll = initialScrollIndex !== undefined && !reportActionIDFromRoute && !shouldBeAlignedToTop;
        const didLandAtEnd = initialScrollIndex === undefined || (isUnreadInitialScroll && !!legendListRef.current?.getState()?.isAtEnd);
        shouldFollowEndOnResizeRef.current = didLandAtEnd && !hasNewerActions && userScrolledListIDRef.current !== listID;
        lastScrollMetricsRef.current = undefined;
        // The final row can grow after LegendList's initial end estimate (for example, Concierge feedback).
        scheduleEndCorrection();
    };

    const loadOlderChatsOnStartReached = () => {
        if (showHiddenHistory || isOffline || !hasOlderActions || !oldestReportActionID || lastRequestedOldestActionIDRef.current === oldestReportActionID) {
            return;
        }

        lastRequestedOldestActionIDRef.current = oldestReportActionID;
        loadOlderChats(false);
    };

    const trackScrollPositionAndThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        trackLinkedMessageScroll(event);
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
        const distanceFromBottom = Math.max(0, contentSize.height - layoutMeasurement.height - contentOffset.y);
        distanceFromBottomRef.current = distanceFromBottom;
        const isNearStart = contentOffset.y <= layoutMeasurement.height * PAGINATION_THRESHOLD;
        const previousMetrics = lastScrollMetricsRef.current;
        if (readyEndListIDRef.current === listID && !hasNewerActions) {
            if (distanceFromBottom < CONST.REPORT.ACTIONS.AUTOSCROLL_TO_TOP_THRESHOLD) {
                shouldFollowEndOnResizeRef.current = true;
            } else if (
                (previousMetrics && contentOffset.y < previousMetrics.offset - 1) ||
                (previousMetrics &&
                    previousMetrics.contentHeight === contentSize.height &&
                    previousMetrics.viewportHeight === layoutMeasurement.height &&
                    endCorrectionFrameRef.current === undefined)
            ) {
                // A pending history request must not reclaim the end after the reader has moved away.
                stopFollowingEnd();
            }
        }
        lastScrollMetricsRef.current = {offset: contentOffset.y, contentHeight: contentSize.height, viewportHeight: layoutMeasurement.height};

        if (isNearStart) {
            loadOlderChatsOnStartReached();
        } else {
            lastRequestedOldestActionIDRef.current = undefined;
        }

        const bottomRelativeEvent = {
            ...event,
            nativeEvent: {
                ...event.nativeEvent,
                contentOffset: {...contentOffset, y: distanceFromBottom},
            },
        };

        trackVerticalScrolling(bottomRelativeEvent);
        setHasScrolledOverThreshold(distanceFromBottom >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
        emitComposerScrollEvents();
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

    const firstVisibleReportActionID = getFirstVisibleReportActionID(sortedReportActions, isOffline);

    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    // An agent account can be opened through Copilot, and the agent must not rate its own replies
    const actorAccountIDs = [...new Set(renderedVisibleReportActions.map((action) => action.actorAccountID))].filter((accountID) => accountID !== currentUserAccountID);
    const [customAgentAccountIDs = getEmptyArray<number>()] = usePersonalDetailsByIDs(actorAccountIDs, getCustomAgentAccountIDs);

    // Skip inside the thread the backend opens after a thumbs down, while a Concierge answer is still streaming, and while newer actions are not loaded because the newest reply may not be in the list yet
    const latestConciergeFeedbackActionIDs =
        reportNameValuePairs?.conciergeFeedbackForReportActionID || isDraftPendingCompletion || hasNewerActions
            ? getEmptyArray<string>()
            : getFeedbackPromptActionIDs(renderedVisibleReportActions, allReportActionIDs, customAgentAccountIDs);

    useFollowActionBadgeTarget({
        reportID,
        actionTargetReportActionID: reportAttributes?.actionTargetReportActionID,
        actionBadgeTargetIndex,
        renderedVisibleReportActions: listData,
        reportActionIDToDisplayIndex,
        scrollToActionBadgeTarget,
    });

    /**
     * Thread's divider line should hide when the first chat in the thread is marked as unread.
     * This is so that it will not be conflicting with header's separator line.
     */
    const shouldHideThreadDividerLine = firstVisibleReportActionID === unreadMarkerReportActionID;

    const shouldUseThreadDividerLine = (() => {
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

        if (isSupportTicket(report)) {
            return true;
        }

        return isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    })();

    const renderItem = ({item: reportAction, index}: LegendListRenderItemProps<OnyxTypes.ReportAction>) => {
        const canonicalIndex = canonicalIndexByReportActionID.get(reportAction.reportActionID) ?? index;
        const systemMessageRun = runsByAnchorReportActionID.get(reportAction.reportActionID);
        const previousReportAction = index > 0 ? listData.at(index - 1) : undefined;
        const previousRun = previousReportAction ? runsByAnchorReportActionID.get(previousReportAction.reportActionID) : undefined;
        const isAfterCollapsedRun = !!previousRun && !previousRun.isExpanded;
        const shouldDisableContextMenuForConciergeDraft = isDraftPendingCompletion && draftReportActionID === reportAction.reportActionID;

        return (
            <ReportActionPositionContextProvider
                index={index}
                isNewest={index === listData.length - 1}
                isRecycling
            >
                {systemMessageRun && !systemMessageRun.isExpanded ? (
                    <CollapsedSystemMessages
                        count={systemMessageRun.reportActionIDs.length}
                        earliestReportAction={systemMessageRun.earliestReportAction}
                        report={reportStable}
                        onPress={() => expandSystemMessageRun(systemMessageRun.reportActionIDs)}
                        unreadMarkerReportActionID={
                            unreadMarkerReportActionID &&
                            systemMessageRun.reportActionIDs.includes(unreadMarkerReportActionID) &&
                            (!shouldUseThreadDividerLine || !shouldHideThreadDividerLine)
                                ? unreadMarkerReportActionID
                                : undefined
                        }
                    />
                ) : (
                    <ReportActionsListItemRenderer
                        reportAction={reportAction}
                        parentReportAction={parentReportAction}
                        parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                        report={reportStable}
                        transactionThreadReport={transactionThreadReport}
                        chatReport={chatReportStable}
                        linkedReportActionID={linkedReportActionID}
                        displayAsGroup={
                            !isAfterCollapsedRun &&
                            !isConsecutiveChronosAutomaticTimerAction(reportActionsToRender, canonicalIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                            isConsecutiveActionMadeByPreviousActor(reportActionsToRender, canonicalIndex, isOffline)
                        }
                        shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                        shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                        shouldDisplayReplyDivider={reportActionsToRender.length > 1}
                        isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                        isLatestConciergeFeedbackAction={latestConciergeFeedbackActionIDs.includes(reportAction.reportActionID)}
                        reportsParentHierarchy={reportsParentHierarchy}
                        onExpandedSystemMessageReady={
                            reportAction.reportActionID === focusRequestedReportActionID ? (target) => onExpandedSystemMessageReady(reportAction.reportActionID, target) : undefined
                        }
                        shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                        isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReportAction}
                        shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
                    />
                )}
                {!!reportStable?.reportID && (
                    <ShowPreviousMessagesButton
                        reportID={reportStable.reportID}
                        actionType={reportAction.actionName}
                        hasPreviousMessages={!!hasPreviousMessages}
                        showFullHistory={!showHiddenHistory}
                        onPress={onShowPreviousMessages}
                    />
                )}
            </ReportActionPositionContextProvider>
        );
    };

    // Ensure row presentation updates when these values change without changing the action data.
    const extraData = [
        unreadMarkerReportActionID,
        isArchivedNonExpenseReport(report, isReportArchived),
        draftReportActionID,
        draftMessageHTML,
        isDraftPendingCompletion,
        latestConciergeFeedbackActionIDs,
        expandedSystemMessageReportActionIDs,
        focusRequestedReportActionID,
    ];

    const latestActionsFooter = (
        <>
            {isConciergeHistoryExpanded && (
                <ConciergeChatHistoryToggle
                    isHistoryShown
                    onPress={() => {
                        collapseConciergeHistory();
                        if (reportActionIDFromRoute) {
                            Navigation.setParams({reportActionID: ''}, route.key);
                        }
                    }}
                />
            )}
            <ReportActionsListHeader
                reportID={reportID}
                isDraftPendingCompletion={isDraftPendingCompletion}
            />
        </>
    );

    const shouldShowOfflineSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const offlineHistoryHeader = shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : undefined;

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
        rules,
    });

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = (event: LayoutChangeEvent) => {
        onLayout?.(event);
        const state = legendListRef.current?.getState();
        if (state && readyEndListIDRef.current === listID) {
            const distanceFromBottom = Math.max(0, state.contentLength - state.scrollLength - state.scroll);
            scrollOffsetRef.current = distanceFromBottom;
            distanceFromBottomRef.current = distanceFromBottom;
        }
        scheduleEndCorrection();
    };

    // The guard only mounts this content when the report is loaded, so this is effectively unreachable.
    // It narrows `report` to non-undefined for the render below and stays a safe fallback if the report
    // is cleared mid-session while the latch keeps the content mounted.
    if (!report) {
        return <ReportActionsAnimatedSkeletonCover />;
    }

    if (shouldShowConciergeWelcome) {
        return (
            <AskConciergeWelcome
                reportID={reportID}
                onShowPreviousMessages={onShowPreviousMessages}
            />
        );
    }

    return (
        <>
            {/* Pinned over the top of the list rather than laid out inside it, so scrolling the expense detail view
                does not carry it out of sight. Renders nothing on the layouts the composer mount serves. */}
            <MerchantRuleSuggestionBanner
                reportID={reportID}
                policyID={report?.policyID}
                containerStyles={[styles.mh4, styles.mt2]}
                overlayStyles={styles.merchantRuleCalloutOverlay}
            />
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
                actionBadge={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.actionBadge : undefined}
                actionBadgeBrickRoadStatus={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.brickRoadStatus : undefined}
                onActionBadgePress={scrollToActionBadgeTarget}
                shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
            />
            <ReportActionsListPaddingView
                report={report}
                isReportArchived={isReportArchived}
            >
                <LegendList
                    accessibilityLabel={Platform.OS === 'web' ? undefined : translate('sidebarScreen.listOfChatMessages')}
                    aria-label={Platform.OS === 'web' ? translate('sidebarScreen.listOfChatMessages') : undefined}
                    data-testid={Platform.OS === 'web' ? 'report-actions-list' : undefined}
                    testID={Platform.OS === 'web' ? undefined : 'report-actions-list'}
                    ref={legendListRef}
                    style={[styles.flex1, styles.overscrollBehaviorContain]}
                    data={listData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    drawDistance={REPORT_ACTIONS_DRAW_DISTANCE}
                    recycleItems
                    experimental_hideItemsUntilMeasured
                    renderScrollComponent={Platform.OS === 'web' ? undefined : renderActionSheetAwareScrollView}
                    scrollEventThrottle={16}
                    contentContainerStyle={[styles.chatContentScrollView, styles.pb0]}
                    onEndReached={loadNewerChatsAfterTransitions}
                    onEndReachedThreshold={PAGINATION_THRESHOLD}
                    ListHeaderComponent={offlineHistoryHeader}
                    ListFooterComponent={latestActionsFooter}
                    ListFooterComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    keyboardShouldPersistTaps="handled"
                    onLayout={recordTimeToMeasureItemLayout}
                    onScroll={trackScrollPositionAndThreshold}
                    onScrollBeginDrag={handleScrollBeginDrag}
                    onStartReached={loadOlderChatsOnStartReached}
                    onStartReachedThreshold={PAGINATION_THRESHOLD}
                    onViewableItemsChanged={updateVisibleItemOverflow}
                    extraData={extraData}
                    key={listID}
                    getItemType={getItemType}
                    initialScrollAtEnd={initialScrollIndex === undefined}
                    initialScrollIndex={initialScrollIndex === undefined ? undefined : {index: initialScrollIndex, ...initialScrollIndexParams}}
                    alignItemsAtEnd={!shouldBeAlignedToTop}
                    // Keep the existing pixel-based new-message policy in useReportActionsScroll.
                    maintainScrollAtEnd={false}
                    maintainVisibleContentPosition
                    onReady={handleListReady}
                    onItemSizeChanged={onItemSizeChanged}
                    onContentSizeChange={() => {
                        trackVerticalScrolling(undefined);
                        scheduleEndCorrection();
                    }}
                />
                {shouldShowInitialViewportSkeleton && (
                    <View
                        pointerEvents="none"
                        style={[styles.pAbsolute, styles.t0, styles.r0, styles.b0, styles.l0, styles.zIndex10]}
                    >
                        <ReportActionsAnimatedSkeletonCover />
                    </View>
                )}
            </ReportActionsListPaddingView>
        </>
    );
}

/**
 * Public report-actions list. Thin composition that wraps the content in `ReportActionsSkeletonGuard`,
 * which owns the data pipeline + skeleton decision and only mounts the content once it is ready.
 */
function ReportActionsList({reportID, conciergeChat, onLayout}: ReportActionsListProps) {
    return (
        <ReportActionsSkeletonGuard
            key={reportID}
            reportID={reportID}
        >
            <ReportActionsListContent
                key={reportID}
                reportID={reportID}
                conciergeChat={conciergeChat}
                onLayout={onLayout}
            />
        </ReportActionsSkeletonGuard>
    );
}

export default ReportActionsList;
