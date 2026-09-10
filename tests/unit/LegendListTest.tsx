import {fireEvent, render, screen} from '@testing-library/react-native';

import type {LegendListRef, LegendListRenderItem, LegendListRenderItemProps} from '@components/LegendList/types';

import {LegendList as LibraryLegendList} from '@legendapp/list/react-native';
import {createRef} from 'react';
import {View} from 'react-native';

const DATA = ['first', 'second', 'third'];

const renderItem: LegendListRenderItem<string> = ({item}: LegendListRenderItemProps<string>) => {
    return <View testID={item} />;
};

describe('LegendList Jest mock', () => {
    it('renders every item without another virtualized list', () => {
        render(
            <LibraryLegendList
                data={DATA}
                renderItem={renderItem}
            />,
        );

        for (const item of DATA) {
            expect(screen.getByTestId(item)).toBeOnTheScreen();
        }
    });

    it('forwards scroll events and calculates the end distance', () => {
        const onEndReached = jest.fn();
        const onScroll = jest.fn();
        render(
            <LibraryLegendList
                data={DATA}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                onScroll={onScroll}
                renderItem={renderItem}
                testID="legend-list"
            />,
        );

        fireEvent.scroll(screen.getByTestId('legend-list'), {
            nativeEvent: {
                contentOffset: {x: 0, y: 100},
                contentSize: {height: 600, width: 300},
                layoutMeasurement: {height: 400, width: 300},
            },
        });

        expect(onScroll).toHaveBeenCalledTimes(1);
        expect(onEndReached).toHaveBeenCalledWith({distanceFromEnd: 100});
    });

    it('provides the imperative scroll methods used by list consumers', async () => {
        const ref = createRef<LegendListRef>();
        render(
            <LibraryLegendList
                data={DATA}
                ref={ref}
                renderItem={renderItem}
            />,
        );

        await expect(ref.current?.scrollToIndex({index: 1})).resolves.toBeUndefined();
        await expect(ref.current?.scrollToOffset({offset: 20})).resolves.toBeUndefined();
    });
});
