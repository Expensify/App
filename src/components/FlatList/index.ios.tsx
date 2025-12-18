import React, {useCallback, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import KeyboardDismissibleFlatList from '@components/KeyboardDismissibleFlatList';
import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import type {CustomFlatListProps} from './types';

// On iOS, we have to unset maintainVisibleContentPosition while the user is scrolling to prevent jumping to the beginning issue
function CustomFlatList<T>({
    ref,
    maintainVisibleContentPosition: maintainVisibleContentPositionProp,
    shouldDisableVisibleContentPosition,
    enableAnimatedKeyboardDismissal = false,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onScroll: onScrollProp,
    ...restProps
}: CustomFlatListProps<T>) {
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScrollBegin = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            onMomentumScrollBegin?.(event);
            setIsScrolling(true);
        },
        [onMomentumScrollBegin],
    );

    const handleScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            onMomentumScrollEnd?.(event);
            setIsScrolling(false);
        },
        [onMomentumScrollEnd],
    );

    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: !enableAnimatedKeyboardDismissal, inverted: restProps.inverted});
    const handleScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            onScrollProp?.(e);
            emitComposerScrollEvents();
        },
        [emitComposerScrollEvents, onScrollProp],
    );

    const maintainVisibleContentPosition = isScrolling || shouldDisableVisibleContentPosition ? undefined : maintainVisibleContentPositionProp;

    if (enableAnimatedKeyboardDismissal) {
        return (
            <KeyboardDismissibleFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...restProps}
                ref={ref}
                maintainVisibleContentPosition={maintainVisibleContentPosition}
                // Composer scroll events are emitted in `KeyboardDismissibleFlatList` separately, therefore we pass the `onScroll` prop instead of the `handleScroll` callback.
                onScroll={onScrollProp}
                onMomentumScrollBegin={handleScrollBegin}
                onMomentumScrollEnd={handleScrollEnd}
            />
        );
    }

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={ref}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onScroll={handleScroll}
            onMomentumScrollBegin={handleScrollBegin}
            onMomentumScrollEnd={handleScrollEnd}
        />
    );
}

export default CustomFlatList;
