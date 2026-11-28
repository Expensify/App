import FlashList from '@components/FlashList';
import type {ViewableItemsChangedHandler} from '@components/FlashList/types';

import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import mergeRefs from '@libs/mergeRefs';

import type ActionListRefType from '@pages/inbox/ActionListTypes';
import CollapsedReportHeaderSpacer from '@pages/inbox/report/CollapsibleReportHeader/CollapsedReportHeaderSpacer';
import useScrollToEditingReportAction from '@pages/inbox/report/useScrollToEditingReportAction';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {FlashListProps, FlashListRef, ListRenderItemInfo, ViewToken} from '@shopify/flash-list';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {ExternalScrollFlashListTableHandle} from './ExternalScrollFlashListTable';
import type {MoneyRequestReportTransactionListController, TransactionListItemData} from './MoneyRequestReportTransactionList';

import ExternalScrollFlashListTable, {createScrollOffsetStore} from './ExternalScrollFlashListTable';
import MoneyRequestViewReportFields from './MoneyRequestViewReportFields';
import ReportActionsListLoadingSkeleton from './ReportActionsListLoadingSkeleton';
import StickyReportTableHeader from './StickyReportTableHeader';
import useScrollToNewTransaction from './useScrollToNewTransaction';

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
    /** Ref to the underlying list, shared via the common ActionList imperative API. */
    ref: React.Ref<FlashListRef<UnifiedListItem>>;
};

/**
 * Forwards the shared ActionList ref through @components/FlashList to the underlying list.
 * FlashList implements the common imperative API consumed by the report scroll manager.
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

    /** Values outside the list data that should trigger report action rows to update. */
    reportActionsExtraData: unknown;

    /** ID of the report action deep-linked to, if any. */
    linkedReportActionID: string | undefined;

    /** First revealed action to mount for a manual expansion's focus handoff. */
    focusRequestedReportActionID?: string;

    /** ID of a newly added transaction to highlight, if any. */
    newTransactionID?: string;

    /** Ref to the underlying list, shared via the ActionList context. */
    listRef: ActionListRefType;

    accessibilityLabel: string;

    /** Called when the list lays out. */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Called after FlashList finishes measuring and committing its rows. */
    onCommitLayoutEffect?: () => void;

    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Called when the user starts dragging the list. */
    onScrollBeginDrag: () => void;

    onContentSizeChange: (width: number, height: number) => void;
    onViewableItemsChanged: ViewableItemsChangedHandler;

    /** Called when the end of the list is reached (older actions). */
    onEndReached: () => void;

    /** Called when the start of the list is reached (newer actions). */
    onStartReached: () => void;

    contentContainerStyle: StyleProp<ViewStyle>;

    /** Whether the app is offline. */
    isOffline: boolean;

    /** Whether the initial batch of report actions is still loading. */
    isLoadingInitialActions: boolean;

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
    reportActionsExtraData,
    linkedReportActionID,
    focusRequestedReportActionID,
    newTransactionID,
    listRef,
    accessibilityLabel,
    onLayout,
    onCommitLayoutEffect,
    onScroll,
    onScrollBeginDrag,
    onContentSizeChange,
    onViewableItemsChanged,
    onEndReached,
    onStartReached,
    contentContainerStyle,
    isOffline,
    isLoadingInitialActions,
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
    const viewableItemsRef = useRef<Array<ViewToken<unknown>>>([]);

    const expandedFocusIndex = focusRequestedReportActionID ? visibleReportActions.findIndex((action) => action.reportActionID === focusRequestedReportActionID) : -1;
    useEffect(() => {
        if (expandedFocusIndex < 0) {
            return;
        }

        const dataIndex = expandedFocusIndex + reportActionIndexOffset;
        if (viewableItemsRef.current.some((token) => token.index === dataIndex)) {
            return;
        }

        // Resolve the transaction offset here, where the virtualized list's data is owned.
        const frame = requestAnimationFrame(() => {
            listRef?.current?.scrollToIndex({index: dataIndex, animated: false, viewPosition: 0.5});
        });
        return () => cancelAnimationFrame(frame);
    }, [expandedFocusIndex, focusRequestedReportActionID, reportActionIndexOffset, listRef]);

    // Handle to the nested table (horizontal mode) — read for row page positions, never driven to scroll (its scroll is a no-op).
    const tableRef = useRef<ExternalScrollFlashListTableHandle>(null);

    // Viewport height + table offset fed to the nested table so it can window its rows against this list's scroll.
    // tableOffsetTop is the height of everything above the table region (the report-fields header).
    // Seed with the window height (a safe over-estimate) so the nested list windows against a non-zero viewport on the
    // first paint — otherwise a height of 0 renders the transactions area blank until onLayout corrects it next frame.
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const isMobileWebLandscape = useIsMobileWebLandscape();
    const [viewportHeight, setViewportHeight] = useState(windowHeight);
    const [tableOffsetTop, setTableOffsetTop] = useState(0);
    const contentStyle = StyleSheet.flatten(contentContainerStyle);
    const contentPaddingTop = contentStyle?.paddingTop ?? contentStyle?.paddingVertical ?? contentStyle?.padding ?? 0;
    const columnHeaderOffsetTop = tableOffsetTop + (typeof contentPaddingTop === 'number' ? contentPaddingTop : 0);
    const flashListRef = useRef<FlashListRef<UnifiedListItem>>(null);

    // A subscribe/notify store carries the scroll offset to the nested table FlashList with zero parent re-renders.
    // Lazy useState initializer (not useRef.current) so it is created exactly once without reading a ref during render.
    const [scrollOffsetStore] = useState(createScrollOffsetStore);
    const [tableEndOffsetStore] = useState(createScrollOffsetStore);

    const updateInlineTableEndOffset = () => {
        if (!shouldInlineTransactions) {
            return;
        }
        const footerLayout = flashListRef.current?.getLayout(controller.transactionListItems.length);
        if (!footerLayout) {
            return;
        }
        // Item layouts exclude the list header and padding; the first-item offset includes both.
        tableEndOffsetStore.setOffset((flashListRef.current?.getFirstItemOffset() ?? 0) + footerLayout.y);
    };

    const commitListLayout = () => {
        updateInlineTableEndOffset();
        onCommitLayoutEffect?.();
    };

    const updateContentSize = (width: number, height: number) => {
        updateInlineTableEndOffset();
        onContentSizeChange(width, height);
    };

    // Reset the offset to the top whenever the report changes. A report view opens at the top, but the store only
    // updates from onScroll — so without this a stale offset
    useEffect(() => {
        scrollOffsetStore.setOffset(0);
    }, [report.reportID, scrollOffsetStore]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Always feed the offset store (emitter, not state: the nested FlashList updates its own render stack without
        // re-rendering the parent). The column header subscribes in both wide modes, and the nested list also uses it
        // when the table overflows horizontally.
        scrollOffsetStore.setOffset(event.nativeEvent.contentOffset.y);
        onScroll(event);
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setViewportHeight(event.nativeEvent.layout.height);
        onLayout(event);
    };

    // The hook compares unreadMarkerReportActionIndex (0-based within visibleReportActions) against
    // raw FlashList indices. When transactions are present, report actions start at reportActionIndexOffset,
    // so we shift all viewable indices down before forwarding so the comparison is apples-to-apples.
    const onViewableItemsChangedAdjusted = (info: Parameters<ViewableItemsChangedHandler>[0]) => {
        // Keep the raw array so the new-transaction effect can tell whether the new row is already on screen.
        viewableItemsRef.current = info.viewableItems;
        if (reportActionIndexOffset === 0) {
            onViewableItemsChanged(info);
            return;
        }
        onViewableItemsChanged({
            ...info,
            viewableItems: info.viewableItems.map((item) => ({...item, index: typeof item.index === 'number' ? item.index - reportActionIndexOffset : item.index})),
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

    // This list owns the report-action-ID-to-data-index mapping, so it resolves the scroll request against its own rows —
    // same request the inbox `ReportActionsList` handles for the non-money-request view.
    useScrollToEditingReportAction({
        visibleReportActions,
        scrollToIndex: (index) => {
            const dataIndex = index + reportActionIndexOffset;

            // Already on screen, so its editor has mounted and taken focus — scrolling would only yank the user.
            if (viewableItemsRef.current.some((token) => token.index === dataIndex)) {
                return;
            }

            listRef?.current?.scrollToIndex({index: dataIndex, animated: false, viewPosition: 0.5});
        },
    });

    useScrollToNewTransaction({
        newTransactionID,
        transactionListItems: controller.transactionListItems,
        shouldInlineTransactions,
        listRef,
        tableRef,
        viewableItemsRef,
        scrollOffsetStore,
        viewportHeight,
    });

    const reportFieldsHeader = (
        <MoneyRequestViewReportFields
            report={report}
            policy={policy}
        />
    );

    const tableColumnHeader = controller.tableColumnHeader ? (
        <StickyReportTableHeader
            scrollOffsetStore={scrollOffsetStore}
            tableEndOffsetStore={tableEndOffsetStore}
            offsetTop={columnHeaderOffsetTop}
        >
            {controller.tableColumnHeader}
        </StickyReportTableHeader>
    ) : null;

    return (
        <MoneyRequestReportFlashList
            ref={mergeRefs(listRef, flashListRef)}
            accessibilityLabel={accessibilityLabel}
            testID={CONST.TEST_ID.MONEY_REQUEST_REPORT_ACTIONS_LIST}
            data={data}
            extraData={reportActionsExtraData}
            renderItem={dispatchRenderItem}
            keyExtractor={unifiedListKeyExtractor}
            getItemType={unifiedListItemType}
            initialScrollIndex={initialScrollIndex}
            // In mobile web landscape the report header collapses on scroll and CollapsedReportHeaderSpacer pads the list
            // to keep its rows still, which this would scroll straight back out of view.
            maintainVisibleContentPosition={{autoscrollToBottomThreshold: undefined, disabled: isMobileWebLandscape}}
            onViewableItemsChanged={onViewableItemsChangedAdjusted}
            onLayout={handleLayout}
            onCommitLayoutEffect={commitListLayout}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.75}
            onStartReached={onStartReached}
            onStartReachedThreshold={0.75}
            ListHeaderComponentStyle={tableColumnHeader ? styles.zIndex1 : undefined}
            ListHeaderComponent={
                isHorizontalTable ? (
                    <>
                        {/* Only the table scrolls horizontally; fields and controls keep their page alignment. */}
                        <View onLayout={(event: LayoutChangeEvent) => setTableOffsetTop(event.nativeEvent.layout.height)}>
                            <CollapsedReportHeaderSpacer />
                            {reportFieldsHeader}
                            {controller.beforeListContent}
                        </View>
                        <ExternalScrollFlashListTable<TransactionListItemData>
                            items={controller.transactionListItems}
                            keyExtractor={unifiedListKeyExtractor}
                            getItemType={unifiedListItemType}
                            renderItem={(item, _index, meta) => controller.renderTransactionListItem(item, meta)}
                            renderHeader={() => tableColumnHeader}
                            estimatedRowHeight={variables.tableRowHeight}
                            contentWidth={controller.tableMinWidth}
                            store={scrollOffsetStore}
                            viewportHeight={viewportHeight}
                            offsetTop={columnHeaderOffsetTop}
                            onTableEndOffsetChange={tableEndOffsetStore.setOffset}
                            ref={tableRef}
                        />
                        {/* Rendered outside the horizontal scroller so the totals/add-expense summary stays pinned to the viewport. */}
                        {controller.afterListContent}
                    </>
                ) : (
                    <>
                        <View onLayout={(event: LayoutChangeEvent) => setTableOffsetTop(event.nativeEvent.layout.height)}>
                            <CollapsedReportHeaderSpacer />
                            {reportFieldsHeader}
                            {controller.beforeListContent}
                        </View>
                        {tableColumnHeader}
                    </>
                )
            }
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            onScrollBeginDrag={onScrollBeginDrag}
            onContentSizeChange={updateContentSize}
            // Chrome's scroll anchoring would scroll by the height CollapsedReportHeaderSpacer adds above the rows, undoing the
            // header hand-over. It doesn't help with rows above the viewport, which FlashList moves by rewriting their top.
            contentContainerStyle={[contentContainerStyle, isMobileWebLandscape && styles.overflowAnchorNone]}
            ListEmptyComponent={shouldShowActionsLoadingSkeleton ? <ReportActionsListLoadingSkeleton /> : undefined}
            ListFooterComponent={
                <>
                    {shouldInlineTransactions && shouldShowActionsLoadingSkeleton && <ReportActionsListLoadingSkeleton />}
                    {listFooterComponent}
                </>
            }
            drawDistance={1000}
        />
    );
}

export default MoneyRequestReportUnifiedList;
