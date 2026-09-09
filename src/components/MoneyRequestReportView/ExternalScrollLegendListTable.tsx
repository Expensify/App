import ScrollView from '@components/ScrollView';

import type {LegendListRef, LegendListRenderItemProps} from '@legendapp/list/react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps} from 'react-native';

import {LegendList} from '@legendapp/list/react-native';
import React, {useEffect, useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';

/**
 * A tiny subscribe/notify store carrying the parent list's vertical scroll offset. It is fed by the parent's onScroll
 * WITHOUT React state, so the parent (and every sibling report action) never re-renders on scroll; the offset reaches
 * the driver, which turns it into a synthetic scroll event that updates only the nested LegendList's render window.
 */
type ScrollOffsetStore = {
    getOffset: () => number;
    setOffset: (offset: number) => void;
    subscribe: (listener: () => void) => () => void;
};

function createScrollOffsetStore(): ScrollOffsetStore {
    let offset = 0;
    const listeners = new Set<() => void>();
    return {
        getOffset: () => offset,
        setOffset: (next: number) => {
            if (next === offset) {
                return;
            }
            offset = next;
            for (const listener of listeners) {
                listener();
            }
        },
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}

type MeasureCallback = (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void;

// The ScrollView methods LegendList reads from its custom scroll component. The driver does not scroll itself, but it
// must report the parent viewport during layout and provide the no-op scrolling methods used by LegendList internals.
type MinimalScrollRef = {
    measure: (callback: MeasureCallback) => void;
    scrollTo: (options?: {x?: number; y?: number; animated?: boolean}) => void;
    scrollToEnd: (options?: {animated?: boolean}) => void;
    flashScrollIndicators: () => void;
    getScrollableNode: () => View | null;
    getNativeScrollRef: () => View | null;
    getScrollResponder: () => null;
    getCurrentScrollOffset: () => number;
};

type ExternalScrollDriverProps = Omit<ScrollViewProps, 'ref'> & {
    /** Source of the parent list's vertical scroll offset. */
    store: ScrollOffsetStore;

    /** Where the table region starts within the parent page's scrollable content (px from the top). */
    offsetTop: number;

    /** Height LegendList must use for its virtualized viewport instead of the full-height driver View. */
    viewportHeight: number;

    /** Imperative handle LegendList drives. */
    ref?: React.Ref<MinimalScrollRef>;
};

/**
 * Replacement scroll container for the nested table LegendList. It does not scroll. It is a plain View that grows to
 * the full content height so the parent page scrolls through it. Its layout callbacks substitute the parent viewport
 * height for the View's real height, giving LegendList a bounded virtualized window without a package patch.
 */
function ExternalScrollDriver({store, offsetTop, viewportHeight, onLayout, onScroll, children, style, testID, ref}: ExternalScrollDriverProps) {
    const nodeRef = useRef<View>(null);
    const lastLayoutEventRef = useRef<LayoutChangeEvent>(null);

    useImperativeHandle(
        ref,
        () => ({
            measure: (callback) => {
                const node = nodeRef.current;
                if (!node) {
                    callback(0, 0, 0, viewportHeight, 0, 0);
                    return;
                }

                node.measure((x, y, width, _height, pageX, pageY) => callback(x, y, width, viewportHeight, pageX, pageY));
            },
            scrollTo: () => {},
            scrollToEnd: () => {},
            flashScrollIndicators: () => {},
            getScrollableNode: () => nodeRef.current,
            getNativeScrollRef: () => nodeRef.current,
            getScrollResponder: () => null,
            getCurrentScrollOffset: () => getLocalScrollOffset(store, offsetTop),
        }),
        [offsetTop, store, viewportHeight],
    );

    useEffect(() => {
        const emit = () => {
            // NativeSyntheticEvent's host targets cannot be constructed in JavaScript. LegendList's vertical handler
            // reads contentOffset.y and treats the event like a normal parent-driven scroll frame.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            onScroll?.({nativeEvent: {contentOffset: {x: 0, y: getLocalScrollOffset(store, offsetTop)}}} as NativeSyntheticEvent<NativeScrollEvent>);
        };
        emit();
        return store.subscribe(emit);
    }, [offsetTop, onScroll, store]);

    useEffect(() => {
        const event = lastLayoutEventRef.current;
        if (!event) {
            return;
        }

        onLayout?.(getViewportLayoutEvent(event, viewportHeight));
    }, [onLayout, viewportHeight]);

    const handleLayout = (event: LayoutChangeEvent) => {
        lastLayoutEventRef.current = event;
        onLayout?.(getViewportLayoutEvent(event, viewportHeight));
    };

    return (
        <View
            ref={nodeRef}
            testID={testID}
            style={style}
            onLayout={handleLayout}
        >
            {children}
        </View>
    );
}

function getLocalScrollOffset(store: ScrollOffsetStore, offsetTop: number): number {
    return Math.max(0, store.getOffset() - offsetTop);
}

function getViewportLayoutEvent(event: LayoutChangeEvent, viewportHeight: number): LayoutChangeEvent {
    return {
        ...event,
        nativeEvent: {
            ...event.nativeEvent,
            layout: {...event.nativeEvent.layout, height: viewportHeight},
        },
    };
}

type ExternalScrollLegendListTableHandle = {
    /** Page-space position of a row — where it sits within the parent's scrollable content. Derived from the nested
     * list's layout data, so it works for rows that aren't mounted. The table owns this math (offsetTop + its own
     * header height + the row's layout) so the parent never learns the nested coordinate system. */
    getRowPageOffset: (index: number) => {top: number; height: number} | undefined;
};

type ExternalScrollLegendListTableProps<T> = {
    /** Rows to render. LegendList windows them against the parent's scroll offset. */
    items: T[];

    /** Stable key per row. */
    keyExtractor: (item: T, index: number) => string;

    /** Item type per row, used for independent row-size estimates. */
    getItemType: (item: T) => string;

    /** Renders a single row. */
    renderItem: (item: T, index: number, meta: {isFirst: boolean; isLast: boolean}) => React.ReactElement | null;

    /** Column header rendered above the rows and scrolled horizontally with them. */
    renderHeader: () => React.ReactElement | null;

    /** Estimated row height used before a row has been measured. */
    estimatedRowHeight: number;

    /** Full table width (wider than the viewport). Drives the horizontal scroll range. */
    contentWidth: number;

    /** Shared offset store fed by the parent's onScroll. */
    store: ScrollOffsetStore;

    /** Visible height of the parent viewport. */
    viewportHeight: number;

    /** Where the table region starts within the parent page's scrollable content (px from the top). */
    offsetTop: number;

    /** Imperative handle exposing row positions in page space. */
    ref?: React.Ref<ExternalScrollLegendListTableHandle>;
};

/**
 * A vertically virtualized, horizontally scrollable table driven by its parent LegendList's vertical offset.
 * The custom scroll driver grows to content height while reporting the parent's bounded viewport to LegendList. A
 * single horizontal ScrollView keeps the column header and rows aligned without moving the chat below it.
 */
function ExternalScrollLegendListTable<T>({
    items,
    keyExtractor,
    getItemType,
    renderItem,
    renderHeader,
    estimatedRowHeight,
    contentWidth,
    store,
    viewportHeight,
    offsetTop,
    ref,
}: ExternalScrollLegendListTableProps<T>) {
    const lastIndex = items.length - 1;
    const listRef = useRef<LegendListRef>(null);
    const headerSizeRef = useRef(0);

    useImperativeHandle(
        ref,
        () => ({
            getRowPageOffset: (index: number) => {
                const state = listRef.current?.getState();
                const rowTop = state?.positionAtIndex(index);
                if (rowTop === undefined || !Number.isFinite(rowTop)) {
                    return undefined;
                }
                return {
                    top: offsetTop + headerSizeRef.current + rowTop,
                    height: state?.sizeAtIndex(index) ?? estimatedRowHeight,
                };
            },
        }),
        [estimatedRowHeight, offsetTop],
    );

    const renderScrollComponent = (scrollProps: ScrollViewProps) => (
        <ExternalScrollDriver
            {...scrollProps}
            testID="external-scroll-legend-list-driver"
            store={store}
            offsetTop={offsetTop}
            viewportHeight={viewportHeight}
        />
    );

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={{width: contentWidth}}
        >
            <LegendList<T>
                ref={listRef}
                data={items}
                keyExtractor={keyExtractor}
                getItemType={getItemType}
                renderItem={({item, index}: LegendListRenderItemProps<T>) => renderItem(item, index, {isFirst: index === 0, isLast: index === lastIndex})}
                extraData={renderItem}
                ListHeaderComponent={renderHeader()}
                drawDistance={estimatedRowHeight * 12}
                estimatedItemSize={estimatedRowHeight}
                estimatedListSize={{width: contentWidth, height: viewportHeight}}
                renderScrollComponent={renderScrollComponent}
                onMetricsChange={({headerSize}) => {
                    headerSizeRef.current = headerSize;
                }}
                // Grow to content height and don't clip — the parent page owns vertical scroll, so the list's own
                // clipping viewport must be neutralized.
                style={{width: contentWidth, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', overflow: 'visible'}}
                scrollEnabled={false}
            />
        </ScrollView>
    );
}

export default ExternalScrollLegendListTable;
export {createScrollOffsetStore};
export type {ExternalScrollLegendListTableHandle};
