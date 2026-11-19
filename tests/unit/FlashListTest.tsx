import {render} from '@testing-library/react-native';

import type {RecyclerViewProps} from '@shopify/flash-list/dist/recyclerview/RecyclerViewProps';
import type {ComponentRef} from 'react';
import type {LayoutChangeEvent, View as RNView, ViewStyle} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import {RecyclerViewManager} from '@shopify/flash-list/dist/recyclerview/RecyclerViewManager';
import React from 'react';
import {View} from 'react-native';

import createMock from '../utils/createMock';

type CellProps = {
    index: number;
    onLayout: (event: LayoutChangeEvent) => void;
    style: ViewStyle;
    children: React.ReactNode;
};

describe('FlashList - stale onLayout after rapid data change', () => {
    it('does not throw when ViewHolder onLayout fires with a now out-of-bounds index', () => {
        // Map of index -> captured onLayout handler from each ViewHolder render
        const capturedLayoutHandlers = new Map<number, (event: LayoutChangeEvent) => void>();

        const CapturingCell = React.forwardRef<ComponentRef<typeof RNView>, CellProps>(({index, onLayout, style, children}, ref) => {
            capturedLayoutHandlers.set(index, onLayout);
            return (
                <View
                    ref={ref}
                    onLayout={onLayout}
                    style={style}
                >
                    {children}
                </View>
            );
        });
        CapturingCell.displayName = 'CapturingCell';

        const renderItem = ({item}: {item: {id: number}}) => (
            <View
                testID={`item-${item.id}`}
                style={{height: 50}}
            />
        );

        const initialData = Array.from({length: 10}, (_, i) => ({id: i}));
        const shrunkData = initialData.slice(0, 2);

        const {rerender} = render(
            <FlashList
                data={initialData}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                CellRendererComponent={CapturingCell}
            />,
        );

        // Quickly shrink data
        rerender(
            <FlashList
                data={shrunkData}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                CellRendererComponent={CapturingCell}
            />,
        );

        // Pick a handler that was captured for an index now beyond the new
        // data length. In production the browser would fire this from a
        // queued ResizeObserver callback after the data shrunk.
        const staleIndex = [...capturedLayoutHandlers.keys()].find((idx) => idx >= shrunkData.length);
        expect(staleIndex).toBeDefined();
        const staleOnLayout = staleIndex ? capturedLayoutHandlers.get(staleIndex) : undefined;
        expect(staleOnLayout).toBeDefined();

        // Pre-fix: this throws "index out of bounds, not enough layouts"
        // Post-fix: validateItemSize bails when tryGetLayout returns undefined
        expect(() => {
            staleOnLayout?.(
                createMock<LayoutChangeEvent>({
                    nativeEvent: {
                        layout: {x: 0, y: 0, width: 100, height: 50},
                    },
                }),
            );
        }).not.toThrow();
    });
});

describe('FlashList - scroll events before the first layout', () => {
    type Item = {id: number};

    const data: Item[] = Array.from({length: 3}, (_, i) => ({id: i}));

    it('does not throw from recordInteraction when the list has no layout and no viewability callbacks', () => {
        // Given a list that has never received a non-zero layout (patch 002 skips 0x0 layouts), so it has no layout manager
        const manager = new RecyclerViewManager<Item>(createMock<RecyclerViewProps<Item>>({data}));
        expect(manager.hasLayout()).toBe(false);

        // When a native scroll event reaches the list, FlashList's onScroll calls recordInteraction
        // Then it does not throw "LayoutManager is not initialized, window size is unavailable"
        expect(() => manager.recordInteraction()).not.toThrow();
    });

    it('does not throw before the first layout and still reports viewable items after it', () => {
        // Given a list with a viewability callback that waits for an interaction, and no layout yet
        const onViewableItemsChanged = jest.fn();
        const manager = new RecyclerViewManager<Item>(
            createMock<RecyclerViewProps<Item>>({
                data,
                onViewableItemsChanged,
                viewabilityConfig: {waitForInteraction: true, minimumViewTime: 0},
            }),
        );

        // When a scroll event arrives before the first layout
        // Then neither scroll handler throws, and no viewability change is reported
        expect(() => manager.recordInteraction()).not.toThrow();
        expect(() => manager.computeItemViewability()).not.toThrow();
        expect(onViewableItemsChanged).not.toHaveBeenCalled();

        // When the list gets its first layout
        manager.updateLayoutParams({width: 100, height: 500}, 0);
        manager.modifyChildrenLayout(
            data.map((_, index) => ({index, dimensions: {width: 100, height: 50}})),
            data.length,
        );
        manager.computeItemViewability();

        // Then nothing is reported yet, because the early scroll did not count as the interaction that waitForInteraction needs
        expect(onViewableItemsChanged).not.toHaveBeenCalled();

        // When the next scroll event arrives
        manager.recordInteraction();
        manager.computeItemViewability();

        // Then the visible items are reported
        expect(onViewableItemsChanged).toHaveBeenCalledWith(expect.objectContaining({viewableItems: expect.arrayContaining([expect.objectContaining({index: 0, isViewable: true})])}));
    });
});
