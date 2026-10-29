import {fireEvent, render, screen} from '@testing-library/react-native';

import type {LegendListProps, LegendListRef} from '@legendapp/list/react-native';

import {LegendList as LibraryLegendList} from '@legendapp/list/react-native';
import {createRef} from 'react';
import {View} from 'react-native';

const DATA = ['first', 'second', 'third'];

const renderItem: NonNullable<LegendListProps<string>['renderItem']> = ({item}) => {
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
        const ref = createRef<LegendListRef>();
        const onScroll = jest.fn(() => ref.current?.getState());
        render(
            <LibraryLegendList
                data={DATA}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                onScroll={onScroll}
                ref={ref}
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
        expect(onScroll).toHaveLastReturnedWith(expect.objectContaining({contentLength: 600, scroll: 100, scrollLength: 400}));
        expect(onEndReached).toHaveBeenCalledWith({distanceFromEnd: 100});
    });

    it('fires edge callbacks again only after leaving and re-entering their thresholds', () => {
        const onEndReached = jest.fn();
        const onStartReached = jest.fn();
        render(
            <LibraryLegendList
                data={DATA}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                onStartReached={onStartReached}
                onStartReachedThreshold={0.5}
                renderItem={renderItem}
                testID="legend-list"
            />,
        );

        const scrollTo = (y: number) => {
            fireEvent.scroll(screen.getByTestId('legend-list'), {
                nativeEvent: {
                    contentOffset: {x: 0, y},
                    contentSize: {height: 1000, width: 100},
                    layoutMeasurement: {height: 100, width: 100},
                },
            });
        };

        scrollTo(860);
        scrollTo(870);
        expect(onEndReached).toHaveBeenCalledTimes(1);

        scrollTo(800);
        scrollTo(860);
        expect(onEndReached).toHaveBeenCalledTimes(2);

        scrollTo(40);
        scrollTo(30);
        expect(onStartReached).toHaveBeenCalledTimes(1);

        scrollTo(100);
        scrollTo(40);
        expect(onStartReached).toHaveBeenCalledTimes(2);
    });

    it('provides the imperative scroll methods used by list consumers', async () => {
        const ref = createRef<LegendListRef>();
        const onLoad = jest.fn(() => ref.current?.getState());
        render(
            <LibraryLegendList
                data={DATA}
                onLoad={onLoad}
                ref={ref}
                renderItem={renderItem}
            />,
        );

        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onLoad).toHaveLastReturnedWith(expect.objectContaining({data: DATA, endBuffered: DATA.length - 1, startBuffered: 0}));
        await expect(ref.current?.scrollToIndex({index: 1})).resolves.toBeUndefined();
        await expect(ref.current?.scrollToOffset({offset: 20})).resolves.toBeUndefined();
    });
});
