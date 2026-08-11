import {act, render} from '@testing-library/react-native';

import type {ActionListRef} from '@components/FlashList/types';
import InvertedLegendList from '@components/LegendList/InvertedLegendList';

import type {LegendListProps, LegendListRef} from '@legendapp/list/react-native';
import type {ForwardedRef} from 'react';

import React, {createRef} from 'react';

type Item = {
    id: string;
};

let mockLegendListProps: LegendListProps<Item> | undefined;
const mockLegendListRef = {
    getNativeScrollRef: jest.fn(),
    scrollToEnd: jest.fn(() => Promise.resolve()),
    scrollToIndex: jest.fn(() => Promise.resolve()),
    scrollToOffset: jest.fn(() => Promise.resolve()),
};

jest.mock('@legendapp/list/react-native', () => {
    const react = jest.requireActual<typeof React>('react');

    return {
        LegendList: react.forwardRef((props: LegendListProps<Item>, ref: ForwardedRef<LegendListRef>) => {
            mockLegendListProps = props;
            // The production ref has additional methods that this adapter does not call.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            react.useImperativeHandle(ref, () => mockLegendListRef as unknown as LegendListRef);
            return null;
        }),
    };
});

const newestItem = {id: 'newest'};
const middleItem = {id: 'middle'};
const oldestItem = {id: 'oldest'};
const data = [newestItem, middleItem, oldestItem];

function renderList() {
    const ref = createRef<ActionListRef>();
    const renderItem = jest.fn(() => null);
    const onEndReached = jest.fn();
    const onStartReached = jest.fn();

    render(
        <InvertedLegendList
            ref={ref}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onEndReached={onEndReached}
            onStartReached={onStartReached}
        />,
    );

    const legendData = mockLegendListProps?.data;
    const legendRenderItem = mockLegendListProps?.renderItem;
    if (!mockLegendListProps || !legendData || !legendRenderItem) {
        throw new Error('LegendList did not receive data-mode props');
    }

    return {ref, renderItem, onEndReached, onStartReached, legendData, legendRenderItem, legendProps: mockLegendListProps};
}

describe('InvertedLegendList', () => {
    beforeEach(() => {
        mockLegendListProps = undefined;
        jest.clearAllMocks();
    });

    it('renders chronological data while preserving external inverted indices', () => {
        const {legendData, legendRenderItem, renderItem} = renderList();

        expect(legendData).toEqual([oldestItem, middleItem, newestItem]);

        legendRenderItem({data: legendData, extraData: undefined, index: 0, item: oldestItem, type: undefined});
        expect(renderItem).toHaveBeenCalledWith(expect.objectContaining({data, index: 2, item: oldestItem}));
    });

    it('maps imperative indices, positions, and offsets to the chronological list', () => {
        const {ref} = renderList();

        act(() => {
            ref.current?.scrollToIndex({animated: false, index: 0, viewOffset: 24, viewPosition: 1});
        });

        expect(mockLegendListRef.scrollToIndex).toHaveBeenCalledWith({animated: false, index: 2, viewOffset: -24, viewPosition: 0});
    });

    it('swaps pagination endpoints and their distances', () => {
        const {legendProps, onEndReached, onStartReached} = renderList();

        legendProps.onEndReached?.({distanceFromEnd: 10});
        legendProps.onStartReached?.({distanceFromStart: 20});

        expect(onStartReached).toHaveBeenCalledWith({distanceFromStart: 10});
        expect(onEndReached).toHaveBeenCalledWith({distanceFromEnd: 20});
    });
});
