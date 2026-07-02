import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps} from 'react-native';
import FlashList from '@components/FlashList';
import ScrollView from '@components/ScrollView';

/**
 * A tiny subscribe/notify store carrying the parent list's vertical scroll offset. It is fed by the parent's onScroll
 * WITHOUT React state, so the parent (and every sibling report action) never re-renders on scroll; the offset reaches
 * the driver, which turns it into a synthetic scroll event that updates only the nested FlashList's render stack.
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

// The subset of the ScrollView imperative surface FlashList actually drives — `getScrollableNode` is read internally
// by RecyclerView for bound detection, and `scrollTo`/`scrollToEnd`/`flashScrollIndicators`/`getNativeScrollRef` back
// FlashList's public ref. Naming it makes "the part of ScrollView the driver must honor" explicit rather than erased.
type MinimalScrollRef = {
    scrollTo: () => void;
    scrollToEnd: () => void;
    flashScrollIndicators: () => void;
    getScrollableNode: () => View | null;
    getNativeScrollRef: () => View | null;
};

// `store` and `offsetTop` are injected at runtime by FlashList via `overrideProps`, never by FlashList's own typed
// call site — declaring them optional makes the driver structurally a ScrollView component, so no cast is needed to
// pass it as `renderScrollComponent`. FlashList's renderScrollComponent wrapper passes the ref as a prop, so the
// driver takes `ref` directly (React 19 style) rather than via forwardRef.
type ExternalScrollDriverProps = Omit<ScrollViewProps, 'ref'> & {
    /** Source of the parent list's vertical scroll offset. */
    store?: ScrollOffsetStore;

    /** Where the table region starts within the parent page's scrollable content (px from the top). */
    offsetTop?: number;

    /** Imperative handle FlashList drives (scrollTo/scrollToEnd/getScrollableNode…). */
    ref?: React.Ref<MinimalScrollRef>;
};

/**
 * Replacement scroll container for the nested table FlashList. It does NOT scroll — it is a plain View that grows to
 * the full content height so the parent page scrolls through it — and it synthesizes FlashList's vertical scroll
 * events from the parent's offset. FlashList reads `getScrollableNode` internally and delegates its public
 * `scrollTo`/`scrollToEnd`/`flashScrollIndicators`/`getNativeScrollRef` to this ref; the scroll no-ops mean offset
 * corrections settle below the fold exactly like the parent-driven windowing. Must be a stable module-level component:
 * FlashList memoizes its scroll component on identity.
 */
function ExternalScrollDriver({store, offsetTop = 0, onScroll, children, style, ref}: ExternalScrollDriverProps) {
    const nodeRef = useRef<View>(null);

    useImperativeHandle(
        ref,
        () => ({
            scrollTo: () => {},
            scrollToEnd: () => {},
            flashScrollIndicators: () => {},
            getScrollableNode: () => nodeRef.current,
            getNativeScrollRef: () => nodeRef.current,
        }),
        [],
    );

    useEffect(() => {
        if (!store) {
            return;
        }
        const emit = () => {
            // Offset into the nested list's own coordinate space (FlashList subtracts its measured firstItemOffset —
            // the header height — internally). Only `contentOffset.y` is read for a vertical list, so nothing else is
            // populated; windowing comes from the `overrideWindowSize` prop, not this event.
            const y = Math.max(0, store.getOffset() - offsetTop);
            // Synthesizing a native scroll event requires an assertion: NativeSyntheticEvent's target/currentTarget are
            // RN HostInstances that can't be constructed in JS. FlashList's vertical handler reads only contentOffset.y.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            onScroll?.({nativeEvent: {contentOffset: {x: 0, y}}} as NativeSyntheticEvent<NativeScrollEvent>);
        };
        // Seed the initial window, then track subsequent parent scrolls. Re-subscribes only when the store, the
        // measured offset, or FlashList's scroll handler change — none of which happen per scroll frame.
        emit();
        return store.subscribe(emit);
    }, [store, offsetTop, onScroll]);

    return (
        <View
            ref={nodeRef}
            style={style}
        >
            {children}
        </View>
    );
}

type ExternalScrollFlashListTableProps<T> = {
    /** Rows to render. FlashList windows and recycles them against the parent's scroll offset. */
    items: T[];

    /** Stable key per row. */
    keyExtractor: (item: T, index: number) => string;

    /** Recycling bucket per row (transaction vs. group header) so FlashList reuses like with like. */
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
};

/**
 * A vertically-virtualized, horizontally-scrollable table built on FlashList instead of a hand-rolled virtualized list.
 *
 * The nested FlashList is fed a non-scrolling `ExternalScrollDriver` as its scroll container, so it grows to full
 * content height (the parent page scrolls through it) while FlashList still recycles rows against the parent's scroll
 * offset — via the patched `overrideWindowSize` prop, which lets FlashList treat the parent viewport as its window
 * instead of measuring its own (full-height) container. A single native horizontal ScrollView wraps the whole list, so
 * all rows share one smooth horizontal scroll and nothing outside it moves sideways.
 *
 * LAYOUT NOTE: FlashList's outer container defaults to `flex: 1` + `overflow: hidden` (a clipping viewport). We
 * override it via `style` below to grow to content height and not clip, since the page — not the list — owns vertical
 * scroll.
 */
function ExternalScrollFlashListTable<T>({
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
}: ExternalScrollFlashListTableProps<T>) {
    const lastIndex = items.length - 1;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={{width: contentWidth}}
        >
            <FlashList<T>
                data={items}
                keyExtractor={keyExtractor}
                getItemType={getItemType}
                renderItem={({item, index}: ListRenderItemInfo<T>) => renderItem(item, index, {isFirst: index === 0, isLast: index === lastIndex})}
                ListHeaderComponent={renderHeader()}
                drawDistance={estimatedRowHeight * 12}
                renderScrollComponent={ExternalScrollDriver}
                // Consumed by ExternalScrollDriver (FlashList spreads overrideProps onto the scroll component).
                overrideProps={{store, offsetTop}}
                // Treat the parent viewport as the list's window instead of measuring the (full-height) driver View.
                overrideWindowSize={{width: contentWidth, height: viewportHeight}}
                // Grow to content height and don't clip — the parent page owns vertical scroll, so the list's own
                // clipping viewport must be neutralized.
                style={{width: contentWidth, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', overflow: 'visible'}}
                scrollEnabled={false}
            />
        </ScrollView>
    );
}

export default ExternalScrollFlashListTable;
export {createScrollOffsetStore};
