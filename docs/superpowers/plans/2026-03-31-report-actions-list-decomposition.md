# ReportActionsList Decomposition — Final Plan

> **IMPORTANT:** All code blocks below are **pseudo code** illustrating the target architecture and data flow. They are NOT copy-pasteable implementations. When implementing, always read the actual source files (`ReportActionsView.tsx`, `ReportActionsList.tsx`, existing hooks) and move the real logic — preserving all edge cases, eslint-disable comments, type signatures, and behavior. The pseudo code shows WHERE things go and HOW they compose, not the exact code.

## Goal

One `ReportActionsList` component that knows nothing about variants. Feature-specific logic lives inside reusable hooks and self-deciding sub-components. The list just renders whatever the hooks give it.

## Architecture

```
src/pages/inbox/ReportActions.tsx                        ← router (existing, add app-load skeleton)
  ├── skeleton
  ├── MoneyRequestReportActionsList                      ← existing
  └── ReportActionsList                                  ← one component, no variants

ReportActionsList composes:
  ├── useReportActionsPagination(reportID)               ← internally handles thread merging
  ├── useReportActionsVisibility(reportID, actions, ...)  ← internally handles concierge filtering
  ├── useReportActionsScroll(...)                         ← all scroll behavior
  ├── useUnreadMarker(...)                                ← unread marker positioning
  ├── useMarkAsRead(...)                                  ← mark-as-read
  ├── useLoadReportActions(...)                           ← existing, modified
  ├── ReportActionsListHeader                             ← self-deciding (renders ConciergeThinkingMessage only for concierge)
  ├── ShowPreviousMessagesButton                          ← self-deciding (renders only for concierge CREATED action)
  └── InvertedFlatList + renderItem

Pure functions (not hooks):
  ├── filterConciergeSessionActions(...)                  ← pure filter, no hooks/state
  └── buildConciergeGreetingAction(...)                   ← pure factory
```

## The list component (full pseudo code)

```tsx
function ReportActionsList({reportID}) {
    // Core data
    const [report] = useOnyx(`report_${reportID}`);
    const [reportMetadata] = useOnyx(`reportMetadata_${reportID}`);
    const parentReportAction = useParentReportAction(report);
    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

    // Pipeline — hooks handle thread merging and concierge internally
    const pagination = useReportActionsPagination(reportID);
    const visibility = useReportActionsVisibility(
        reportID, pagination.reportActions, canPerformWriteAction,
        pagination.hasOlderActions,
    );
    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions: pagination.reportActions,
        allReportActionIDs: pagination.allReportActionIDs,
        transactionThreadReportID: pagination.transactionThreadReport?.reportID,
        hasOlderActions: pagination.hasOlderActions,
        hasNewerActions: pagination.hasNewerActions,
    });

    // List behavior
    const scrollingVerticalOffset = useRef(0);
    const {unreadMarkerReportActionID, unreadMarkerReportActionIndex} = useUnreadMarker({
        reportID,
        sortedVisibleReportActions: visibility.visibleReportActions,
        sortedReportActions: visibility.visibleReportActions,
        scrollingVerticalOffset,
    });
    const {readActionSkippedRef} = useMarkAsRead({
        reportID,
        sortedVisibleReportActions: visibility.visibleReportActions,
        transactionThreadReport: pagination.transactionThreadReport,
        scrollingVerticalOffset,
    });

    // Scroll
    const [shouldScrollToEndAfterLayout, setShouldScrollToEndAfterLayout] = useState(...);
    const scroll = useReportActionsScroll({
        reportID, report,
        sortedVisibleReportActions: visibility.visibleReportActions,
        scrollingVerticalOffset, readActionSkippedRef,
        unreadMarkerReportActionIndex,
        loadOlderChats, loadNewerChats,
        linkedReportActionID: pagination.reportActionID,
        shouldScrollToEndAfterLayout, setShouldScrollToEndAfterLayout,
        isOffline: visibility.isOffline,
        hasOnceLoadedReportActions: !!reportMetadata?.hasOnceLoadedReportActions,
    });

    // listID — ref + effect
    const listOldIDRef = useRef(LIST_ID_SEED);
    const [listID, setListID] = useState(LIST_ID_SEED);
    useEffect(() => { ... }, [pagination.reportActionID]);

    // Telemetry
    const didLayout = useRef(false);
    const recordTimeToMeasureItemLayout = (event) => { ... };

    // ═══ renderItem passthrough (tech debt) ═══
    const personalDetailsList = usePersonalDetails();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow']);
    const [userWalletTierName] = useOnyx(USER_WALLET, {selector: tierNameSelector});
    const [isUserValidated] = useOnyx(ACCOUNT, {selector: isUserValidatedSelector});
    const [reportActionsFromOnyx] = useOnyx(`reportActions_${reportID}`);
    const [userBillingFundID] = useOnyx(NVP_BILLING_FUND_ID);
    const [tryNewDot] = useOnyx(NVP_TRY_NEW_DOT);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const [reportNameValuePairs] = useOnyx(`reportNameValuePairs_${reportID}`);
    // ═══ end renderItem passthrough ═══

    // Skeletons
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;
    const isMissingReportActions = visibility.visibleReportActions.length === 0;
    const shouldShowSkeleton = (isLoadingInitialReportActions && isMissingReportActions && !visibility.isOffline);

    if (shouldShowSkeleton) return <ReportActionsSkeletonView />;

    const hasDerivedValueTimingIssue = pagination.reportActions.length > 0 && isMissingReportActions;
    if (hasDerivedValueTimingIssue && !visibility.showConciergeSidePanelWelcome) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    // renderItem — plain function, uses FlatList native index
    const sortedVisibleReportActions = visibility.visibleReportActions;
    const flatListData = [...sortedVisibleReportActions].reverse();

    const renderItem = ({item, index}: ListRenderItemInfo<ReportAction>) => {
        const originalIndex = sortedVisibleReportActions.length - 1 - index;
        const displayAsGroup = isConsecutiveActionMadeByPreviousActor(sortedVisibleReportActions, originalIndex, ...);

        return (
            <>
                <ShowPreviousMessagesButton
                    reportAction={item}
                    hasPreviousMessages={visibility.hasPreviousMessages}
                    showFullHistory={visibility.showFullHistory}
                    onPress={visibility.handleShowPreviousMessages}
                />
                <ReportActionsListItemRenderer
                    reportAction={item}
                    index={originalIndex}
                    report={report}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={pagination.parentReportActionForTransactionThread}
                    transactionThreadReport={pagination.transactionThreadReport}
                    displayAsGroup={displayAsGroup}
                    mostRecentIOUReportActionID={visibility.mostRecentIOUReportActionID}
                    shouldDisplayNewMarker={item.reportActionID === unreadMarkerReportActionID}
                    // ... rest of renderItem passthrough props
                />
            </>
        );
    };

    return (
        <>
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={scroll.isFloatingMessageCounterVisible}
                onClick={scroll.scrollToBottomAndMarkReportAsRead}
            />
            <InvertedFlatList
                data={flatListData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={
                    <ReportActionsListHeader reportID={reportID} onRetry={scroll.retryLoadNewerChatsError} />
                }
                ListFooterComponent={
                    shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : null
                }
                onScroll={scroll.trackVerticalScrolling}
                onViewableItemsChanged={scroll.onViewableItemsChanged}
                onStartReached={scroll.onStartReached}
                onEndReached={scroll.onEndReached}
                onLayout={scroll.onLayoutInner}
                key={listID}
                initialNumToRender={initialNumToRender}
            />
        </>
    );
}
```

## useReportActionsPagination — internally handles thread merging

```tsx
function useReportActionsPagination(reportID) {
    const route = useRoute();
    const reportActionID = route.params?.reportActionID;
    const [report] = useOnyx(`report_${reportID}`);
    const {isOffline} = useNetwork();

    // Base — always runs
    const {reportActions: unfilteredReportActions, hasOlderActions, hasNewerActions} =
        usePaginatedReportActions(reportID, reportActionID);
    const allReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    // Thread merge — useTransactionThread returns empty for non-thread reports
    // getCombinedReportActions returns allReportActions unchanged when threadID is null
    const thread = useTransactionThread({reportID, report, allReportActions, isOffline});
    const reportActions = getCombinedReportActions(
        allReportActions,
        thread.transactionThreadReportID ?? null,
        thread.transactionThreadReportActions ?? [],
    );

    return {
        reportActions,                  // combined if thread, base if not
        allReportActions,               // always base (before merge)
        allReportActionIDs: allReportActions.map(a => a.reportActionID),
        hasOlderActions, hasNewerActions, reportActionID,
        transactionThreadReport: thread.transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        isReportTransactionThread: thread.isReportTransactionThread,
    };
}
```

## useReportActionsVisibility — internally handles concierge filtering

```tsx
function useReportActionsVisibility(reportID, reportActions, baseVisibleActions, canPerformWriteAction) {
    const {isOffline} = useNetwork();
    const [report] = useOnyx(`report_${reportID}`);

    // Base visibility filter
    const [visibleReportActionsData] = useOnyx(DERIVED.VISIBLE_REPORT_ACTIONS);
    const {transactions} = useTransactionsAndViolationsForReport(reportID);
    const reportTransactionIDs = getAllNonDeletedTransactions(transactions, reportActions).map(t => t.transactionID);

    const filteredActions = reportActions.filter(action => {
        // offline check, isReportActionVisible, isIOUActionMatchingTransactionList
    });

    // Concierge — pure function, called only when applicable
    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);

    const {sessionStartTime} = useSidePanelState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [showFullHistory, setShowFullHistory] = useState(false);
    const hasUserSentMessage = isConciergeSidePanel && sessionStartTime
        ? reportActions.some(a => !isCreatedAction(a) && a.actorAccountID === currentUserAccountID && a.created >= sessionStartTime)
        : false;

    // Pure function — just filters, no hooks, no state
    const conciergeFiltered = isConciergeSidePanel
        ? filterConciergeSessionActions(filteredActions, {
              sessionStartTime, showFullHistory, currentUserAccountID,
              hasOlderActions, hasUserSentMessage,
              reportID, lastReadTime: report?.lastReadTime,
          })
        : undefined;

    // Greeting action — built separately, not inside the filter
    const {translate} = useLocalize();
    const conciergeGreetingAction = isConciergeSidePanel && conciergeFiltered?.showGreeting
        ? buildConciergeGreetingAction(reportID, report?.lastReadTime, translate('common.concierge.sidePanelGreeting'))
        : undefined;

    // Inject greeting into filtered actions if applicable
    const visibleReportActions = conciergeFiltered
        ? injectGreetingAction(conciergeFiltered.visibleActions, conciergeGreetingAction)
        : filteredActions;

    return {
        visibleReportActions,
        mostRecentIOUReportActionID: getMostRecentIOURequestActionID(reportActions),
        isOffline,
        isConciergeSidePanel,
        hasPreviousMessages: conciergeFiltered?.hasPreviousMessages ?? false,
        showConciergeSidePanelWelcome: conciergeFiltered?.showWelcome ?? false,
        handleShowPreviousMessages: () => { setShowFullHistory(true); loadOlderChats(true); },
    };
}
```

## filterConciergeSessionActions — pure function

```tsx
// Pure data in → data out. No hooks, no state, no objects.
function filterConciergeSessionActions(
    visibleReportActions: ReportAction[],
    params: {
        sessionStartTime: string | null;
        showFullHistory: boolean;
        currentUserAccountID: number;
        hasOlderActions: boolean;
        hasUserSentMessage: boolean;
        reportID: string;
        lastReadTime: string | undefined;
    },
) {
    const {sessionStartTime, showFullHistory, currentUserAccountID, hasOlderActions, hasUserSentMessage} = params;

    if (showFullHistory) {
        return {visibleActions: visibleReportActions, hasPreviousMessages: false, showWelcome: false, showGreeting: false};
    }

    if (!sessionStartTime) {
        return {visibleActions: visibleReportActions.filter(isCreatedAction), hasPreviousMessages: false, showWelcome: false, showGreeting: false};
    }

    const hadUserMessageAtSessionStart =
        visibleReportActions.some(a => !isCreatedAction(a) && a.actorAccountID === currentUserAccountID && a.created < sessionStartTime)
        || hasOlderActions;

    if (!hadUserMessageAtSessionStart) {
        return {visibleActions: visibleReportActions, hasPreviousMessages: false, showWelcome: false, showGreeting: false};
    }

    const showWelcome = hadUserMessageAtSessionStart && !hasUserSentMessage;
    const showGreeting = hadUserMessageAtSessionStart;
    const hasPreviousMessages = visibleReportActions.some(a => !isCreatedAction(a) && a.created < sessionStartTime);

    if (showWelcome) {
        const createdAction = visibleReportActions.find(isCreatedAction);
        return {visibleActions: createdAction ? [createdAction] : [], hasPreviousMessages, showWelcome, showGreeting};
    }

    // Filter to current session actions
    const firstUserMessageCreated = visibleReportActions.reduce((earliest, action) => {
        if (isCreatedAction(action) || action.created < sessionStartTime || action.actorAccountID !== currentUserAccountID) return earliest;
        return !earliest || action.created < earliest ? action.created : earliest;
    }, undefined);

    const filtered = visibleReportActions.filter(action =>
        isCreatedAction(action) || (action.created >= sessionStartTime && (!firstUserMessageCreated || action.created >= firstUserMessageCreated))
    );

    return {
        visibleActions: filtered.length > 0 ? filtered : visibleReportActions,
        hasPreviousMessages,
        showWelcome: false,
        showGreeting,
    };
}
```

## Self-deciding sub-components

### ReportActionsListHeader
```tsx
function ReportActionsListHeader({reportID}) {
    const [report] = useOnyx(`report_${reportID}`);
    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);

    return (
        <>
            {isConciergeSidePanel && <ConciergeThinkingMessage report={report} />}
            <ListBoundaryLoader type={CONST.LIST_COMPONENTS.HEADER} onRetry={...} />
        </>
    );
}
```

### ShowPreviousMessagesButton
```tsx
// Renders only for CREATED action with hidden history.
// Doesn't know about concierge — hasPreviousMessages is false for non-concierge reports.
function ShowPreviousMessagesButton({reportAction, hasPreviousMessages, showFullHistory, onPress}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow']);

    if (reportAction.actionName !== CREATED) return null;
    if (!hasPreviousMessages) return null;
    if (showFullHistory) return null;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.pv3, styles.mh5]}>
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
            <Button
                small
                shouldShowRightIcon
                iconRight={expensifyIcons.UpArrow}
                text={translate('common.concierge.showHistory')}
                onPress={onPress}
            />
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
        </View>
    );
}
```

## Rules (non-negotiable)

1. No IIFEs — plain expressions or if/else with `let`
2. No manual memoization — no `useCallback`, `useMemo`, `React.memo`
3. No grab-bag hooks — each hook has one concern
4. Inline header/footer JSX (sub-components for self-deciding logic)
5. Hooks subscribe internally — pass IDs and scalars, not objects
6. renderItem passthrough hooks separated with comment boundary
7. `key={reportID}` on the list for state reset
8. Feature-specific pure functions (not hooks) when no subscriptions needed
9. Sub-components make their own rendering decisions — list doesn't know about variants

## Files

### New
- `src/hooks/useReportActionsPagination.ts`
- `src/hooks/useReportActionsVisibility.ts`
- `src/hooks/useReportActionsScroll.ts`
- `src/hooks/useTransactionThread.ts`
- `src/hooks/useUnreadMarker.ts`
- `src/hooks/useMarkAsRead.ts`
- `src/libs/ConciergeSessionFilter.ts` (pure functions)
- `src/pages/inbox/report/ReportActionsListHeader.tsx`
- `src/pages/inbox/report/ShowPreviousMessagesButton.tsx`

### Modified
- `src/pages/inbox/ReportActionsList.tsx` → `src/pages/inbox/ReportActions.tsx` (router)
- `src/pages/inbox/report/ReportActionsList.tsx` (rewrite — one component, ~300 lines)
- `src/pages/inbox/ReportScreen.tsx` (import update)
- `src/hooks/useLoadReportActions.ts` (transactionThreadReportID param)

### Deleted
- `src/pages/inbox/report/ReportActionsView.tsx`
- `src/pages/inbox/report/getReportActionsListInitialNumToRender.ts`
- `tests/unit/getReportActionsListInitialNumToRenderTest.ts`
