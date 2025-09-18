import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import type {CustomFlatListProps} from './index';

// FlatList wrapped with the freeze component will lose its scroll state when frozen (only for Android).
// CustomFlatList saves the offset and use it for scrollToOffset() when unfrozen.
function CustomFlatList<T>({ref, ...props}: CustomFlatListProps<T>) {
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
    const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        lastScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    }, []);

    useFocusEffect(
        useCallback(() => {
            onScreenFocus();
        }, [onScreenFocus]),
    );

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScroll={props.onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            ref={ref}
        />
    );
}

CustomFlatList.displayName = 'CustomFlatListWithRef';
export default CustomFlatList;
