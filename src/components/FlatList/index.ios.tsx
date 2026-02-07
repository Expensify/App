import React, {useCallback, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import KeyboardDismissibleFlatList from '@components/KeyboardDismissibleFlatList';
import useThemeStyles from '@hooks/useThemeStyles';
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
    shouldHideContent = false,
    ...restProps
}: CustomFlatListProps<T>) {
    const [isScrolling, setIsScrolling] = useState(false);
    const styles = useThemeStyles();

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

    const maintainVisibleContentPosition = isScrolling || shouldDisableVisibleContentPosition ? undefined : maintainVisibleContentPositionProp;

    const contentContainerStyle = [restProps.contentContainerStyle, shouldHideContent && styles.opacity0];

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
                contentContainerStyle={contentContainerStyle}
            />
        );
    }

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={ref}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onScroll={onScrollProp}
            onMomentumScrollBegin={handleScrollBegin}
            onMomentumScrollEnd={handleScrollEnd}
            contentContainerStyle={contentContainerStyle}
        />
    );
}

export default CustomFlatList;
