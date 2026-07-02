import type {FlashListProps, ListRenderItemInfo} from '@shopify/flash-list';
import React, {memo, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle, ViewToken} from 'react-native';
import FlashList from '@components/FlashList';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import variables from '@styles/variables';
import type * as OnyxTypes from '@src/types/onyx';
import ExternalScrollFlashListTable, {createScrollOffsetStore} from './ExternalScrollFlashListTable';
import type {MoneyRequestReportTransactionListController, TransactionListItemData} from './MoneyRequestReportTransactionList';
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
    return item.type;
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
    controller: MoneyRequestReportTransactionListController;
    report: OnyxTypes.Report;
    policy?: OnyxTypes.Policy;
    visibleReportActions: OnyxTypes.ReportAction[];
    renderReportAction: (reportAction: OnyxTypes.ReportAction, indexWithinReportActions: number) => React.ReactElement;
    linkedReportActionID: string | undefined;
    listRef: FlatListRefType;
    accessibilityLabel: string;
    onLayout: () => void;
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onScrollBeginDrag: () => void;
    onContentSizeChange: () => void;
    onViewableItemsChanged: (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => void;
    onEndReached: () => void;
    onStartReached: () => void;
    contentContainerStyle: StyleProp<ViewStyle>;
    isOffline: boolean;
    isLoadingInitialActions: boolean;
    skeletonReasonAttributes: SkeletonSpanReasonAttributes;
    /** Reports the index of the last list item so callers can jump to the bottom via scrollToIndex (which renders the
     * landing region, unlike scrollToEnd's estimated-offset jump that leaves the bottom blank on large lists). */
    onLastItemIndexChange?: (index: number) => void;
};

function MoneyRequestReportUnifiedList({
    controller,
    report,
    policy,
    visibleReportActions,
    renderReportAction,
    linkedReportActionID,
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

    // Report the last index so callers can jump to the bottom via scrollToIndex.
    const lastDataIndex = data.length - 1;

    useEffect(() => {
        onLastItemIndexChange?.(lastDataIndex);
    }, [lastDataIndex, onLastItemIndexChange]);

    const lastTransactionItemIndex = controller.transactionListItems.length - 1;
    const reportActionIndexOffset = shouldInlineTransactions ? controller.transactionListItems.length + 1 : 0;

    // Viewport height + table offset fed to the nested table so it can window its rows against this list's scroll.
    // tableOffsetTop is the height of everything above the table region (the report-fields header).
    const [viewportHeight, setViewportHeight] = useState(0);
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
        if (isHorizontalTable) {
            // Emitter, not state: the nested FlashList updates its own render stack without re-rendering the parent.
            scrollOffsetStore.setOffset(event.nativeEvent.contentOffset.y);
        }
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
            maintainVisibleContentPosition={{
                // In the windowed-table case `data` is report actions only, so during hydration the list briefly sits
                // within the 0-threshold of the bottom and would auto-stick there (opening at the bottom of chat).
                // The table lives in the header, so we want to open at the top; the app handles "jump to latest"
                // explicitly (floating counter + current-user sends), so bottom auto-stick isn't needed here.
                autoscrollToBottomThreshold: isHorizontalTable ? undefined : 0,
            }}
            onViewableItemsChanged={onViewableItemsChangedAdjusted}
            onLayout={handleLayout}
            onEndReached={onEndReached}
            onStartReached={onStartReached}
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
            ListEmptyComponent={!isOffline && isLoadingInitialActions ? <ReportActionsListLoadingSkeleton reasonAttributes={skeletonReasonAttributes} /> : undefined}
            drawDistance={1000}
        />
    );
}

export default memo(MoneyRequestReportUnifiedList);
