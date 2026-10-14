import {act, fireEvent, render, screen} from '@testing-library/react-native';

import FlashList from '@components/FlashList';
import MVCPFlatList from '@components/FlatList/FlatList';
import type * as MVCPList from '@components/FlatList/FlatList';
import ActiveHoverable from '@components/Hoverable/ActiveHoverable';
import type * as KeyboardList from '@components/KeyboardDismissibleFlatList';
import KeyboardDismissibleFlatList from '@components/KeyboardDismissibleFlatList/index';

import type * as ComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';

import CONST from '@src/CONST';

import type {NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps, ViewProps} from 'react-native';
import type * as Reanimated from 'react-native-reanimated';

import React from 'react';
import {DeviceEventEmitter, View} from 'react-native';

jest.mock('@hooks/useEmitComposerScrollEvents', () => jest.requireActual<typeof ComposerScrollEvents>('@hooks/useEmitComposerScrollEvents/index.ts'));
jest.mock('@components/KeyboardDismissibleFlatList/index', () => jest.requireActual<typeof KeyboardList>('@components/KeyboardDismissibleFlatList/index.tsx'));
jest.mock('@components/FlatList/FlatList', () => jest.requireActual<typeof MVCPList>('@components/FlatList/FlatList/index.tsx'));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@shopify/flash-list', () => ({
    FlashList: (props: ScrollViewProps) => {
        const {ScrollView} = jest.requireActual<{ScrollView: React.ComponentType<ScrollViewProps>}>('react-native');
        return <ScrollView {...props} />;
    },
}));
jest.mock('@components/AnimatedFlatListWithCellRenderer', () => (props: ScrollViewProps) => {
    const {ScrollView} = jest.requireActual<{ScrollView: React.ComponentType<ScrollViewProps>}>('react-native');
    return <ScrollView {...props} />;
});
jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<typeof Reanimated>('react-native-reanimated/mock'),
    useAnimatedScrollHandler: ({onScroll}: {onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void}) => onScroll,
    useComposedEventHandler: (handlers: Array<((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | null>) => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        for (const handler of handlers) {
            handler?.(event);
        }
    },
}));

const scrollEvent = {
    nativeEvent: {
        contentOffset: {x: 0, y: 100},
        contentSize: {width: 300, height: 1000},
        layoutMeasurement: {width: 300, height: 500},
    },
};

function HoverTarget({ref, ...props}: ViewProps & {ref?: React.Ref<HTMLElement>}) {
    // Supply the DOM ref used by web hover handling while rendering through the native test renderer.
    React.useImperativeHandle(ref, () => document.createElement('div'), []);
    return <View {...props} />;
}

describe('Composer scroll events on chronological lists', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it.each([
        ['FlashList', FlashList],
        ['MVCP FlatList', MVCPFlatList],
        ['keyboard dismissible FlatList', KeyboardDismissibleFlatList],
    ] as const)('%s suppresses hover throughout scrolling and forwards the scroll event', (_name, List) => {
        // Given a chronological list, as used by expense chats after the migration.
        const emit = jest.spyOn(DeviceEventEmitter, 'emit');
        const onScroll = jest.fn();
        render(
            <>
                <List
                    testID="chronological-list"
                    data={['message']}
                    renderItem={() => <View />}
                    inverted={false}
                    onScroll={onScroll}
                />
                <ActiveHoverable shouldHandleScroll>
                    {(isHovered) => (
                        <HoverTarget
                            testID="hoverable-message"
                            accessibilityLabel={isHovered ? 'hovered' : 'idle'}
                        />
                    )}
                </ActiveHoverable>
            </>,
        );

        // When scrolling continues, hover must remain suppressed until the last event settles.
        fireEvent(screen.getByTestId('hoverable-message'), 'mouseEnter');
        expect(screen.getByTestId('hoverable-message').props.accessibilityLabel).toBe('hovered');
        fireEvent.scroll(screen.getByTestId('chronological-list'), scrollEvent);
        expect(onScroll).toHaveBeenCalledWith(scrollEvent);
        expect(emit).toHaveBeenCalledWith(CONST.EVENTS.SCROLLING, true);
        expect(screen.getByTestId('hoverable-message').props.accessibilityLabel).toBe('idle');
        act(() => jest.advanceTimersByTime(200));
        fireEvent.scroll(screen.getByTestId('chronological-list'), scrollEvent);
        fireEvent(screen.getByTestId('hoverable-message'), 'mouseEnter');
        expect(screen.getByTestId('hoverable-message').props.accessibilityLabel).toBe('idle');
        act(() => jest.advanceTimersByTime(200));
        expect(emit).not.toHaveBeenCalledWith(CONST.EVENTS.SCROLLING, false);

        // Then hover resumes once, after scrolling ends.
        act(() => jest.advanceTimersByTime(50));
        expect(emit.mock.calls.filter(([event]) => event === CONST.EVENTS.SCROLLING)).toEqual([
            [CONST.EVENTS.SCROLLING, true],
            [CONST.EVENTS.SCROLLING, false],
        ]);
        fireEvent(screen.getByTestId('hoverable-message'), 'mouseEnter');
        expect(screen.getByTestId('hoverable-message').props.accessibilityLabel).toBe('hovered');
    });
});
