import type {FlashListProps, ListRenderItemInfo} from '@shopify/flash-list';
import React, {memo, useEffect} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle, ViewToken} from 'react-native';
import FlashList from '@components/FlashList';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportHorizontalScrollWrapper from './MoneyRequestReportHorizontalScrollWrapper';
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
    const reportActionItems: UnifiedListItem[] = visibleReportActions.map((action) => ({type: 'report-action', action}));
    const data: UnifiedListItem[] = controller.isEmptyTransactions ? reportActionItems : [...controller.transactionListItems, TRANSACTIONS_FOOTER_ITEM, ...reportActionItems];

    // Report the last index so callers can jump to the bottom via scrollToIndex.
    const lastDataIndex = data.length - 1;

    useEffect(() => {
        onLastItemIndexChange?.(lastDataIndex);
    }, [lastDataIndex, onLastItemIndexChange]);

    const lastTransactionItemIndex = controller.transactionListItems.length - 1;
    const reportActionIndexOffset = controller.isEmptyTransactions ? 0 : controller.transactionListItems.length + 1;

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

    return (
        <MoneyRequestReportHorizontalScrollWrapper
            shouldScroll={controller.shouldScrollHorizontally}
            contentWidth={controller.tableMinWidth}
            restorationKey={controller.horizontalScrollRestorationKey}
        >
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
                    autoscrollToBottomThreshold: 0,
                }}
                onViewableItemsChanged={onViewableItemsChangedAdjusted}
                onLayout={onLayout}
                onEndReached={onEndReached}
                onStartReached={onStartReached}
                ListHeaderComponent={
                    <>
                        <MoneyRequestViewReportFields
                            report={report}
                            policy={policy}
                        />
                        {controller.beforeListContent}
                    </>
                }
                keyboardShouldPersistTaps="handled"
                onScroll={onScroll}
                onScrollBeginDrag={onScrollBeginDrag}
                onContentSizeChange={onContentSizeChange}
                contentContainerStyle={contentContainerStyle}
                ListEmptyComponent={!isOffline && isLoadingInitialActions ? <ReportActionsListLoadingSkeleton reasonAttributes={skeletonReasonAttributes} /> : undefined}
                drawDistance={1000}
            />
        </MoneyRequestReportHorizontalScrollWrapper>
    );
}

export default memo(MoneyRequestReportUnifiedList);
