import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import type {ActionListRef} from '@components/FlashList/types';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import useEnvironment from '@hooks/useEnvironment';
import useLinkedMessageOfflineLoading from '@hooks/useLinkedMessageOfflineLoading';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    getFirstVisibleReportActionID,
    getReportActionHtml,
    getReportActionMessage,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isNewerReportAction,
    isReversedTransaction,
    isTransactionThread,
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
    isTaskReport,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useActionListContext, useActionListRef} from '@pages/inbox/ActionListContext';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';

import type {LegendListRef, LegendListRenderItemProps} from '@legendapp/list/react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {LegendList} from '@legendapp/list/react-native';
import {useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';

import FloatingMessageCounter from './FloatingMessageCounter';
import ReportActionIndexContext from './ReportActionIndexContext';
import {useReportActionsListActions, useReportActionsListState} from './ReportActionsListContext';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ReportActionsListPaddingView from './ReportActionsListPaddingView';
import ReportActionsSkeletonGuard from './ReportActionsSkeletonGuard';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';
import useFollowActionBadgeTarget from './useFollowActionBadgeTarget';

type ReportActionsListContentProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    /** The Concierge chat report */
    conciergeChat: OnyxEntry<OnyxTypes.Report>;

    /** Callback executed on list layout */
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

function getReportActionCommentSize(messageLength: number): string {
    if (messageLength <= 80) {
        return REPORT_ACTION_COMMENT_SIZE.SHORT;
    }
    if (messageLength <= 320) {
        return REPORT_ACTION_COMMENT_SIZE.MEDIUM;
    }
    if (messageLength <= 1200) {
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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isProduction} = useEnvironment();

    const {
        report,
        hasOnceLoadedReportActions,
        hasOlderActions,
        hasNewerActions,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        oldestReportActionID,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        parentReportAction,
        sortedReportActions,
        sortedVisibleReportActions,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
    } = useReportActionsListState();

    const {setTreatAsNoPaginationAnchor, loadOlderChats, loadNewerChats, handleShowPreviousMessages} = useReportActionsListActions();

    const {isOffline} = useNetwork();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const {sessionStartTime} = useConciergeSessionState();

    const didLayout = useRef(false);
    const lastRequestedOldestActionIDRef = useRef<string | undefined>(undefined);
    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true});

    useEffect(() => {
        didLayout.current = false;
        lastRequestedOldestActionIDRef.current = undefined;
    }, [reportID]);

    useEffect(() => {
        if (isLoadingOlderReportActions && !hasLoadingOlderReportActionsError) {
            return;
        }
        lastRequestedOldestActionIDRef.current = undefined;
    }, [isLoadingOlderReportActions, hasLoadingOlderReportActionsError]);

    useLinkedMessageOfflineLoading({reportID: report?.reportID ?? reportID, reportActionIDFromRoute});

    // OpenReport can first provide a tiny cached page and then replace it with the hydrated page. Remounting
    // gives the complete dataset a fresh initial layout so initialScrollAtEnd targets its actual end.
    const listID = [
        reportID,
        reportActionIDFromRoute,
        hasOnceLoadedReportActions ? 'hydrated' : 'initial',
        hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID,
    ].join(':');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const isReportArchived = !!isArchivedReport(reportNameValuePairs);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);

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

    const linkedReportActionID = reportActionIDFromRoute;

    const {getScrollOffset} = useActionListContext();
    const listRef = useActionListRef();
    const legendListRef = useRef<LegendListRef>(null);

    useImperativeHandle(
        listRef,
        (): ActionListRef => ({
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
    const onShowPreviousMessages = handleShowPreviousMessages;

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(() => getScrollOffset() >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);

    const {unreadMarkerReportActionID} = useUnreadMarker({
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

    const persistedDraftReportAction = draftReportAction ? sortedVisibleReportActions.find((action) => action.reportActionID === draftReportAction.reportActionID) : undefined;

    const renderedVisibleReportActions = (() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && sessionStartTime && draftReportAction.created < sessionStartTime) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic draft into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === draftReportAction.reportActionID) {
                const isDraftStillRevealingPersistedAction = getReportActionHtml(action) !== getReportActionHtml(draftReportAction);
                if (!isDraftPendingCompletion && !isDraftStillRevealingPersistedAction) {
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

    const [initialReportActionsSnapshot, setInitialReportActionsSnapshot] = useState<{reportActions: OnyxTypes.ReportAction[]; reportID: string}>();
    const hasInitialReportActionsSnapshot = initialReportActionsSnapshot?.reportID === reportID;

    // OpenReport starts with a tiny cached page before replacing it with the hydrated page. Keep that
    // already-visible page mounted until hydration finishes instead of exposing intermediate estimated
    // layouts. The hydrated list then mounts from scratch using the full dataset.
    if (!hasOnceLoadedReportActions && !hasInitialReportActionsSnapshot && renderedVisibleReportActions.length > 0) {
        setInitialReportActionsSnapshot({reportActions: renderedVisibleReportActions, reportID});
    }

    const reportActionsToRender = !hasOnceLoadedReportActions && hasInitialReportActionsSnapshot ? initialReportActionsSnapshot.reportActions : renderedVisibleReportActions;

    // Report actions are stored newest-first. LegendList intentionally has no inverted mode, so
    // give it chronological data and use its normal start/end and scrolling semantics.
    const listData = reportActionsToRender.toReversed();

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
        if (!draftReportAction || !persistedDraftReportAction || getReportActionHtml(draftReportAction) === getReportActionHtml(persistedDraftReportAction)) {
            return;
        }

        revealDraftFromReportAction(persistedDraftReportAction);
    }, [draftReportAction, persistedDraftReportAction, revealDraftFromReportAction]);

    // Find the index of the action badge target in the chronological data rendered by LegendList.
    const actionBadgeTargetID = reportAttributes?.actionTargetReportActionID;
    const actionBadgeTargetIndex = actionBadgeTargetID ? listData.findIndex((action) => action.reportActionID === actionBadgeTargetID) : -1;
    const unreadMarkerListIndex = unreadMarkerReportActionID ? listData.findIndex((action) => action.reportActionID === unreadMarkerReportActionID) : -1;

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
    } = useReportActionsScroll({
        reportID,
        conciergeChat,
        report,
        transactionThreadReport,
        parentReportAction,
        sortedVisibleReportActions,
        renderedVisibleReportActions: listData,
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

    const loadOlderChatsOnStartReached = () => {
        if (showHiddenHistory || isOffline || !hasOlderActions || !oldestReportActionID || lastRequestedOldestActionIDRef.current === oldestReportActionID) {
            return;
        }

        lastRequestedOldestActionIDRef.current = oldestReportActionID;
        loadOlderChats(false);
    };

    const trackScrollPositionAndThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
        const distanceFromBottom = Math.max(0, contentSize.height - layoutMeasurement.height - contentOffset.y);
        const isNearStart = contentOffset.y <= layoutMeasurement.height * PAGINATION_THRESHOLD;

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

    useFollowActionBadgeTarget({
        isProduction,
        reportID,
        actionTargetReportActionID: reportAttributes?.actionTargetReportActionID,
        actionBadgeTargetIndex,
        renderedVisibleReportActions: listData,
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

        return isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    })();

    const renderItem = ({item: reportAction, index}: LegendListRenderItemProps<OnyxTypes.ReportAction>) => {
        const shouldDisableContextMenuForConciergeDraft = isDraftPendingCompletion && draftReportActionID === reportAction.reportActionID;
        const reportActionIndex = renderedVisibleReportActions.length - index - 1;

        return (
            <ReportActionIndexContext.Provider value={{index, isNewest: index === listData.length - 1, isRecycling: true}}>
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                    report={reportStable}
                    transactionThreadReport={transactionThreadReport}
                    chatReport={chatReportStable}
                    linkedReportActionID={linkedReportActionID}
                    displayAsGroup={
                        !isConsecutiveChronosAutomaticTimerAction(renderedVisibleReportActions, reportActionIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                        isConsecutiveActionMadeByPreviousActor(renderedVisibleReportActions, reportActionIndex, isOffline)
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
    };

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = [
        shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined,
        isArchivedNonExpenseReport(report, isReportArchived),
        draftReportActionID,
        draftMessageHTML,
        isDraftPendingCompletion,
    ];

    const listHeaderComponent = (
        <ReportActionsListHeader
            reportID={reportID}
            isDraftPendingCompletion={isDraftPendingCompletion}
        />
    );

    const shouldShowOfflineSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : undefined;

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
    });

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = (event: LayoutChangeEvent) => {
        onLayout?.(event);
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;

        markOpenReportEnd(reportID, report, {warm: true});
    };

    // The guard only mounts this content when the report is loaded, so this is effectively unreachable.
    // It narrows `report` to non-undefined for the render below and stays a safe fallback if the report
    // is cleared mid-session while the latch keeps the content mounted.
    if (!report) {
        return <ReportActionsSkeletonView />;
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
                shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
            />
            <ReportActionsListPaddingView
                report={report}
                isReportArchived={isReportArchived}
            >
                <LegendList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={legendListRef}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={listData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    drawDistance={REPORT_ACTIONS_DRAW_DISTANCE}
                    recycleItems
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={styles.chatContentScrollView}
                    onEndReached={loadNewerChatsAfterTransitions}
                    onEndReachedThreshold={PAGINATION_THRESHOLD}
                    ListHeaderComponent={listFooterComponent}
                    ListFooterComponent={listHeaderComponent}
                    ListFooterComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    keyboardShouldPersistTaps="handled"
                    onLayout={recordTimeToMeasureItemLayout}
                    onScroll={trackScrollPositionAndThreshold}
                    onViewableItemsChanged={onViewableItemsChanged}
                    extraData={extraData}
                    key={listID}
                    getItemType={getItemType}
                    initialScrollAtEnd={initialScrollIndex === undefined}
                    initialScrollIndex={initialScrollIndex === undefined ? undefined : {index: initialScrollIndex, ...initialScrollIndexParams}}
                    alignItemsAtEnd={!shouldBeAlignedToTop}
                    // Only follow the real latest page. Older/linked windows must retain their visible anchor.
                    maintainScrollAtEnd={!hasNewerActions && {animated: false}}
                    // Keyboard avoidance can shrink the viewport by almost a full screen before LegendList evaluates end proximity.
                    // Leave the end-follow region as soon as the user starts reading older messages.
                    maintainScrollAtEndThreshold={0.01}
                    maintainVisibleContentPosition
                    onLoad={onLoad}
                    onContentSizeChange={() => trackVerticalScrolling(undefined)}
                />
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
        <ReportActionsSkeletonGuard reportID={reportID}>
            <ReportActionsListContent
                reportID={reportID}
                conciergeChat={conciergeChat}
                onLayout={onLayout}
            />
        </ReportActionsSkeletonGuard>
    );
}

export default ReportActionsList;
