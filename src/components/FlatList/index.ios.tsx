import React, {useCallback, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import KeyboardDismissibleFlatList from '@components/KeyboardDismissibleFlatList';
import type {CustomFlatListProps} from './types';

// On iOS, we have to unset maintainVisibleContentPosition while the user is scrolling to prevent jumping to the beginning issue
function CustomFlatList<T>({
    ref,
    maintainVisibleContentPosition: maintainVisibleContentPositionProp,
    enableAnimatedKeyboardDismissal = false,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
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

    const maintainVisibleContentPosition = isScrolling ? undefined : maintainVisibleContentPositionProp;

    if (enableAnimatedKeyboardDismissal) {
        return (
            <KeyboardDismissibleFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...restProps}
                ref={ref}
                maintainVisibleContentPosition={maintainVisibleContentPosition}
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
            onMomentumScrollBegin={handleScrollBegin}
            onMomentumScrollEnd={handleScrollEnd}
        />
    );
}

CustomFlatList.displayName = 'CustomFlatList';
export default CustomFlatList;
