import FlashList from '@components/FlashList';
import type FlatListRefType from '@components/FlashList/types';

import useWindowDimensions from '@hooks/useWindowDimensions';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import variables from '@styles/variables';

import type * as OnyxTypes from '@src/types/onyx';

import type {FlashListProps, ListRenderItemInfo} from '@shopify/flash-list';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle, ViewToken} from 'react-native';

import React, {memo, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {ExternalScrollFlashListTableHandle} from './ExternalScrollFlashListTable';
import type {MoneyRequestReportTransactionListController, TransactionListItemData} from './MoneyRequestReportTransactionList';

import ExternalScrollFlashListTable, {createScrollOffsetStore} from './ExternalScrollFlashListTable';
import MoneyRequestViewReportFields from './MoneyRequestViewReportFields';
import ReportActionsListLoadingSkeleton from './ReportActionsListLoadingSkeleton';

/** Single virtualized data item rendered by the unified FlatList. Mixes transactions, a footer marker, and report actions in one scroll. */
type UnifiedListItem = TransactionListItemData | {readonly type: 'transactions-footer'} | {readonly type: 'report-action'; readonly action: OnyxTypes.ReportAction};

const TRANSACTIONS_FOOTER_ITEM: UnifiedListItem = {type: 'transactions-footer'};

function unifiedListKeyExtractor(item: UnifiedListItem) {
    switch (item.type) {
        case 'section-header':
            return `group-${item.groupKey}`;
        case 'transaction':
            return item.transaction.transactionID;
        case 'transactions-footer':
            return 'transactions-footer';
        case 'report-action':
            return item.action.reportActionID;
        default:
            return '';
    }
}

function unifiedListItemType(item: UnifiedListItem) {
    return item.type === 'report-action' ? item.action.actionName : item.type;
}

type MoneyRequestReportFlashListProps = FlashListProps<UnifiedListItem> & {
    /** Ref to the underlying list, shared via the ActionList context (typed for the legacy FlatList). */
    ref: FlatListRefType;
};

/**
 * Forwards the shared ActionList context ref to the underlying FlashList. That context slot predates this FlashList-based
 * list and is still shared with the legacy report list, so it is typed for a FlatList. Mirroring InvertedFlashList, the
 * ref is forwarded through @components/FlashList — which receives it as an untyped runtime prop — so no type assertion is
 * needed. The scroll manager relies on the FlashList registering into this slot.
 */
function MoneyRequestReportFlashList(props: MoneyRequestReportFlashListProps) {
    return (
        <FlashList<UnifiedListItem>
            // thin forwarder; spreading the props (including the ref) is the point
            {...props}
        />
    );
}

type MoneyRequestReportUnifiedListProps = {
    /** Controller that owns the transaction rows and their selection/long-press state. */
    controller: MoneyRequestReportTransactionListController;

    /** The report whose transactions and actions are rendered. */
    report: OnyxTypes.Report;

    /** Policy the report belongs to. */
    policy?: OnyxTypes.Policy;

    /** Report actions to render below the transactions. */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** Renders a single report action. */
    renderReportAction: (reportAction: OnyxTypes.ReportAction, indexWithinReportActions: number) => React.ReactElement;

    /** ID of the report action deep-linked to, if any. */
    linkedReportActionID: string | undefined;

    /** ID of a newly added transaction to highlight, if any. */
    newTransactionID?: string;

    /** Ref to the underlying list, shared via the ActionList context. */
    listRef: FlatListRefType;

    /** Accessibility label for the list. */
    accessibilityLabel: string;

    /** Called when the list lays out. */
    onLayout: () => void;

    /** Called on scroll. */
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Called when the user starts dragging the list. */
    onScrollBeginDrag: () => void;

    /** Called when the list content size changes. */
    onContentSizeChange: () => void;

    /** Called when the set of viewable items changes. */
    onViewableItemsChanged: (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => void;

    /** Called when the end of the list is reached (older actions). */
    onEndReached: () => void;

    /** Called when the start of the list is reached (newer actions). */
    onStartReached: () => void;

    /** Style applied to the list's content container. */
    contentContainerStyle: StyleProp<ViewStyle>;

    /** Whether the app is offline. */
    isOffline: boolean;

    /** Whether the initial batch of report actions is still loading. */
    isLoadingInitialActions: boolean;

    /** Attributes describing why the skeleton is shown, for telemetry. */
    skeletonReasonAttributes: SkeletonSpanReasonAttributes;

    /** Reports the index of the last list item so callers can jump to the bottom via scrollToIndex (which renders the
     * landing region, unlike scrollToEnd's estimated-offset jump that leaves the bottom blank on large lists). */
    onLastItemIndexChange?: (index: number) => void;

    /** Rendered at the very bottom of the list, below all report actions (e.g. the Concierge thinking tail indicator). */
    listFooterComponent?: React.ReactElement;
};

function MoneyRequestReportUnifiedList({
    controller,
    report,
    policy,
    visibleReportActions,
    renderReportAction,
    linkedReportActionID,
    newTransactionID,
    listRef,
    accessibilityLabel,
    onLayout,
    onScroll,
    onScrollBeginDrag,
    onContentSizeChange,
    onViewableItemsChanged,
    onEndReached,
    onStartReached,
    contentContainerStyle,
    isOffline,
    isLoadingInitialActions,
    skeletonReasonAttributes,
    onLastItemIndexChange,
    listFooterComponent,
}: MoneyRequestReportUnifiedListProps) {
    // When the table is wider than the viewport it can't share the horizontally-scrolled container with the chat (chat
    // would drift sideways / jump on web). Instead the FlashList keeps ONLY the report actions virtualized, and the table is
    // rendered as the list header via ExternalScrollFlashListTable — a nested FlashList in its own single native
    // horizontal scroller that windows its rows against THIS list's vertical scroll offset. Chat never lives inside a
    // horizontal scroller, so it never moves sideways. Everywhere else the transactions stay virtualized inline with
    // the report actions.
    const isHorizontalTable = controller.shouldScrollHorizontally && !controller.isEmptyTransactions;
    const shouldInlineTransactions = !isHorizontalTable && !controller.isEmptyTransactions;

    const reportActionItems: UnifiedListItem[] = visibleReportActions.map((action) => ({type: 'report-action', action}));
    const data: UnifiedListItem[] = shouldInlineTransactions ? [...controller.transactionListItems, TRANSACTIONS_FOOTER_ITEM, ...reportActionItems] : reportActionItems;

    // Report actions load separately from transactions. When transactions are inlined, `data` is already non-empty
    // (transaction rows + footer) while comments are still loading, so ListEmptyComponent can never surface the
    // comments loading skeleton. Gate the skeleton on the report actions being empty and render it as the list footer
    // (right below the transaction section, where comments will appear) in that case.
    const shouldShowActionsLoadingSkeleton = !isOffline && isLoadingInitialActions && reportActionItems.length === 0;

    // Report the last index so callers can jump to the bottom via scrollToIndex.
    const lastDataIndex = data.length - 1;

    useEffect(() => {
        onLastItemIndexChange?.(lastDataIndex);
    }, [lastDataIndex, onLastItemIndexChange]);

    const lastTransactionItemIndex = controller.transactionListItems.length - 1;
    const reportActionIndexOffset = shouldInlineTransactions ? controller.transactionListItems.length + 1 : 0;

    // Latest viewable items, kept current from onViewableItemsChanged, so the new-transaction scroll can skip when the row is already on screen.
    const viewableItemsRef = useRef<ViewToken[]>([]);

    // Handle to the nested table (horizontal mode) — read for row page positions, never driven to scroll (its scroll is a no-op).
    const tableRef = useRef<ExternalScrollFlashListTableHandle>(null);

    // Viewport height + table offset fed to the nested table so it can window its rows against this list's scroll.
    // tableOffsetTop is the height of everything above the table region (the report-fields header).
    // Seed with the window height (a safe over-estimate) so the nested list windows against a non-zero viewport on the
    // first paint — otherwise a height of 0 renders the transactions area blank until onLayout corrects it next frame.
    const {windowHeight} = useWindowDimensions();
    const [viewportHeight, setViewportHeight] = useState(windowHeight);
    const [tableOffsetTop, setTableOffsetTop] = useState(0);

    // A subscribe/notify store carries the scroll offset to the nested table FlashList with zero parent re-renders.
    // Lazy useState initializer (not useRef.current) so it is created exactly once without reading a ref during render.
    const [scrollOffsetStore] = useState(createScrollOffsetStore);

    // Reset the offset to the top whenever the report changes. A report view opens at the top, but the store only
    // updates from onScroll — so without this a stale offset
    useEffect(() => {
        scrollOffsetStore.setOffset(0);
    }, [report.reportID, scrollOffsetStore]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Always feed the offset store (emitter, not state: the nested FlashList updates its own render stack without
        // re-rendering the parent). Feed it even in inline mode — the store has no subscribers then, so this is a cheap
        // write — so that if the layout flips to the horizontal table, the nested list windows against the real scroll
        // offset instead of a stale 0.
        scrollOffsetStore.setOffset(event.nativeEvent.contentOffset.y);
        onScroll(event);
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setViewportHeight(event.nativeEvent.layout.height);
        onLayout();
    };

    // The hook compares unreadMarkerReportActionIndex (0-based within visibleReportActions) against
    // raw FlashList indices. When transactions are present, report actions start at reportActionIndexOffset,
    // so we shift all viewable indices down before forwarding so the comparison is apples-to-apples.
    const onViewableItemsChangedAdjusted = (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        // Keep the raw array so the new-transaction effect can tell whether the new row is already on screen.
        viewableItemsRef.current = info.viewableItems;
        if (reportActionIndexOffset === 0) {
            onViewableItemsChanged(info);
            return;
        }
        onViewableItemsChanged({
            ...info,
            viewableItems: info.viewableItems.map((item) => ({...item, index: item.index !== null ? item.index - reportActionIndexOffset : null})),
        });
    };

    const dispatchRenderItem = ({item, index}: ListRenderItemInfo<UnifiedListItem>) => {
        switch (item.type) {
            case 'section-header':
            case 'transaction':
                return controller.renderTransactionListItem(item, {isFirst: index === 0, isLast: index === lastTransactionItemIndex});
            case 'transactions-footer':
                return controller.afterListContent;
            case 'report-action':
                return renderReportAction(item.action, index - reportActionIndexOffset);
            default:
                return null;
        }
    };

    const linkedActionLocalIndex = linkedReportActionID ? visibleReportActions.findIndex((action) => action.reportActionID === linkedReportActionID) : -1;
    const initialScrollIndex = linkedActionLocalIndex >= 0 ? linkedActionLocalIndex + reportActionIndexOffset : undefined;

    // FlashList's `initialScrollIndex` is captured once at mount. On a cold deep-link open the linked action is
    // often not in `visibleReportActions` yet (it paginates in after mount), so the mount-only hint resolves to
    // undefined and the list never anchors on the linked message. Re-anchor imperatively once the linked action is
    // present. Guarded so it fires exactly once per linked target and never yanks the user after they've scrolled.
    const hasAnchoredLinkedActionRef = useRef(false);
    useEffect(() => {
        hasAnchoredLinkedActionRef.current = false;
    }, [linkedReportActionID]);

    useEffect(() => {
        if (!linkedReportActionID || initialScrollIndex === undefined || hasAnchoredLinkedActionRef.current) {
            return;
        }
        hasAnchoredLinkedActionRef.current = true;
        // Defer to the next frame so the newly paginated-in rows are laid out before we scroll to the target.
        const rafId = requestAnimationFrame(() => {
            listRef?.current?.scrollToIndex({index: initialScrollIndex, animated: false});
        });
        return () => cancelAnimationFrame(rafId);
    }, [linkedReportActionID, initialScrollIndex, listRef]);

    // Scroll a newly-created transaction into view, once per transaction. The rows are virtualized, so the row can't
    // drive this itself (an off-window row never mounts) — the list scrolls to it by index/layout instead, which
    // reaches unmounted rows. Skipped when the row is already on screen so the user isn't yanked.
    const scrolledToNewTransactionIDRef = useRef<string | undefined>(undefined);

    // The index is derived at render (not inside the effect) so the effect keys on a stable number — the items array
    // identity churns across the re-renders that follow a transaction insert, and re-firing the effect would cancel
    // the scheduled frame below before it runs.
    const newTransactionTableIndex = newTransactionID
        ? controller.transactionListItems.findIndex((item) => item.type === 'transaction' && item.transaction.transactionID === newTransactionID)
        : -1;

    useEffect(() => {
        if (newTransactionTableIndex < 0 || scrolledToNewTransactionIDRef.current === newTransactionID) {
            return;
        }

        if (shouldInlineTransactions) {
            // Inline: the transaction is a main-list item at the same index (transactions lead `data`).
            const rafId = requestAnimationFrame(() => {
                // The ID is consumed inside the frame (not at schedule time): if a re-fire cancels this frame, the next
                // effect run reschedules instead of treating the scroll as done.
                scrolledToNewTransactionIDRef.current = newTransactionID;
                if (viewableItemsRef.current.some((token) => token.index === newTransactionTableIndex)) {
                    return;
                }
                listRef?.current?.scrollToIndex({index: newTransactionTableIndex, animated: true, viewPosition: 0.5});
            });
            return () => cancelAnimationFrame(rafId);
        }

        // Horizontal table: the rows live in a nested FlashList whose own scroll is a no-op — only the parent page
        // scrolls. Ask the table where the row sits in page space (works for unmounted rows) and scroll the parent there.
        const rafId = requestAnimationFrame(() => {
            scrolledToNewTransactionIDRef.current = newTransactionID;
            const row = tableRef.current?.getRowPageOffset(newTransactionTableIndex);
            if (!row) {
                return;
            }
            const scrollOffset = scrollOffsetStore.getOffset();
            if (row.top >= scrollOffset && row.top + row.height <= scrollOffset + viewportHeight) {
                return;
            }
            listRef?.current?.scrollToOffset({offset: Math.max(0, row.top - viewportHeight / 2), animated: true});
        });
        return () => cancelAnimationFrame(rafId);
    }, [newTransactionID, newTransactionTableIndex, shouldInlineTransactions, viewportHeight, scrollOffsetStore, listRef]);

    const reportFieldsHeader = (
        <MoneyRequestViewReportFields
            report={report}
            policy={policy}
        />
    );

    return (
        <MoneyRequestReportFlashList
            ref={listRef}
            accessibilityLabel={accessibilityLabel}
            testID="money-request-report-actions-list"
            data={data}
            renderItem={dispatchRenderItem}
            keyExtractor={unifiedListKeyExtractor}
            getItemType={unifiedListItemType}
            initialScrollIndex={initialScrollIndex}
            maintainVisibleContentPosition={{autoscrollToBottomThreshold: undefined}}
            onViewableItemsChanged={onViewableItemsChangedAdjusted}
            onLayout={handleLayout}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.75}
            onStartReached={onStartReached}
            onStartReachedThreshold={0.75}
            ListHeaderComponent={
                isHorizontalTable ? (
                    <>
                        {/* Report fields + group-by/columns controls stay pinned to the page; only the column header and
                            rows scroll horizontally. Measured together so the table's offset into the page is exact. */}
                        <View onLayout={(event: LayoutChangeEvent) => setTableOffsetTop(event.nativeEvent.layout.height)}>
                            {reportFieldsHeader}
                            {controller.beforeListContent}
                        </View>
                        <ExternalScrollFlashListTable<TransactionListItemData>
                            items={controller.transactionListItems}
                            keyExtractor={unifiedListKeyExtractor}
                            getItemType={unifiedListItemType}
                            renderItem={(item, _index, meta) => controller.renderTransactionListItem(item, meta)}
                            renderHeader={() => controller.tableColumnHeader}
                            estimatedRowHeight={variables.tableRowHeight}
                            contentWidth={controller.tableMinWidth}
                            store={scrollOffsetStore}
                            viewportHeight={viewportHeight}
                            offsetTop={tableOffsetTop}
                            ref={tableRef}
                        />
                        {/* Rendered outside the horizontal scroller so the totals/add-expense summary stays pinned to the viewport. */}
                        {controller.afterListContent}
                    </>
                ) : (
                    <>
                        {reportFieldsHeader}
                        {controller.beforeListContent}
                        {controller.tableColumnHeader}
                    </>
                )
            }
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            onScrollBeginDrag={onScrollBeginDrag}
            onContentSizeChange={onContentSizeChange}
            contentContainerStyle={contentContainerStyle}
            ListEmptyComponent={shouldShowActionsLoadingSkeleton ? <ReportActionsListLoadingSkeleton reasonAttributes={skeletonReasonAttributes} /> : undefined}
            ListFooterComponent={
                <>
                    {shouldInlineTransactions && shouldShowActionsLoadingSkeleton && <ReportActionsListLoadingSkeleton reasonAttributes={skeletonReasonAttributes} />}
                    {listFooterComponent}
                </>
            }
            drawDistance={1000}
        />
    );
}

export default memo(MoneyRequestReportUnifiedList);
