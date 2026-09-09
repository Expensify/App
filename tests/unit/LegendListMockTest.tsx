import {fireEvent, render, screen} from '@testing-library/react-native';

import type {LegendListRef} from '@legendapp/list/react-native';

import {LegendList} from '@legendapp/list/react-native';
import {FlashList} from '@shopify/flash-list';
import {createRef} from 'react';

const DATA = ['first', 'second', 'third'];

function renderItem() {
    return null;
}

describe('LegendList Jest mock', () => {
    it('uses FlashList as its virtualized renderer', () => {
        const renderResult = render(
            <LegendList
                data={DATA}
                renderItem={renderItem}
            />,
        );

        expect(renderResult.UNSAFE_getByType(FlashList).props.data).toBe(DATA);
    });

    it('starts at the final item when initialScrollAtEnd is enabled', () => {
        const renderResult = render(
            <LegendList
                data={DATA}
                initialScrollAtEnd
                renderItem={renderItem}
            />,
        );
        const flashList = renderResult.UNSAFE_getByType(FlashList);

        expect(flashList.props.initialScrollIndex).toBe(DATA.length - 1);
        expect(flashList.props.initialScrollIndexParams).toEqual({viewPosition: 1});
    });

    it('invokes onEndReached only in response to a matching scroll event', () => {
        const onEndReached = jest.fn();
        const listRef = createRef<LegendListRef>();
        const renderResult = render(
            <LegendList
                data={DATA}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ref={listRef}
                renderItem={renderItem}
                testID="legend-list"
            />,
        );
        const flashList = renderResult.UNSAFE_getByType(FlashList);

        expect(flashList.props.onEndReached).toBeUndefined();
        expect(onEndReached).not.toHaveBeenCalled();

        fireEvent.scroll(screen.getByTestId('legend-list'), {
            nativeEvent: {
                contentOffset: {x: 0, y: 100},
                contentSize: {height: 600, width: 300},
                layoutMeasurement: {height: 400, width: 300},
            },
        });

        expect(onEndReached).toHaveBeenCalledTimes(1);
        expect(listRef.current?.getState()).toEqual(expect.objectContaining({contentLength: 600, scroll: 100, scrollLength: 400}));
    });
});
