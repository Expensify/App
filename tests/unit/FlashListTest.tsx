import type {LayoutChangeEvent, View as RNView, ViewStyle} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';

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

        const CapturingCell = React.forwardRef<RNView, CellProps>(({index, onLayout, style, children}, ref) => {
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
            staleOnLayout?.({
                nativeEvent: {
                    layout: {x: 0, y: 0, width: 100, height: 50},
                },
            } as LayoutChangeEvent);
        }).not.toThrow();
    });
});
