import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import KeyboardDismissibleFlatList from '@components/KeyboardDismissibleFlatList';
import type {CustomFlatListProps} from './types';

// FlatList wrapped with the freeze component will lose its scroll state when frozen (only for Android).
// CustomFlatList saves the offset and use it for scrollToOffset() when unfrozen.
function CustomFlatList<T>({ref, enableAnimatedKeyboardDismissal = false, onMomentumScrollEnd, ...props}: CustomFlatListProps<T>) {
    const lastScrollOffsetRef = useRef(0);

    const onScreenFocus = useCallback(() => {
        if (typeof ref === 'function') {
            return;
        }
        if (!ref?.current || !lastScrollOffsetRef.current) {
            return;
        }
        if (ref.current && lastScrollOffsetRef.current) {
            ref.current.scrollToOffset({offset: lastScrollOffsetRef.current, animated: false});
        }
    }, [ref]);

    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const handleScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            onMomentumScrollEnd?.(event);
            lastScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        },
        [onMomentumScrollEnd],
    );

    useFocusEffect(
        useCallback(() => {
            onScreenFocus();
        }, [onScreenFocus]),
    );

    if (enableAnimatedKeyboardDismissal) {
        return (
            <KeyboardDismissibleFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
                onMomentumScrollEnd={handleScrollEnd}
            />
        );
    }

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onMomentumScrollEnd={handleScrollEnd}
        />
    );
}

CustomFlatList.displayName = 'CustomFlatList';
export default CustomFlatList;
