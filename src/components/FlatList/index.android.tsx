import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useRef} from 'react';
import type {FlatListProps, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import KeyboardDismissableFlatList from '@components/KeyboardDismissableFlatList';
import {useKeyboardDismissableFlatListContext} from '@components/KeyboardDismissableFlatList/KeyboardDismissableFlatListContext';
import type {AdditionalFlatListProps} from '.';

// FlatList wrapped with the freeze component will lose its scroll state when frozen (only for Android).
// CustomFlatList saves the offset and use it for scrollToOffset() when unfrozen.
function CustomFlatList<T>(props: FlatListProps<T> & AdditionalFlatListProps, ref: ForwardedRef<FlatList>) {
    const lastScrollOffsetRef = useRef(0);
    const {onScroll} = useKeyboardDismissableFlatListContext();

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

    if (props.withAnimatedKeyboardHandler) {
        return (
            <KeyboardDismissableFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                onScroll={onScroll}
                ref={ref}
                onMomentumScrollEnd={onMomentumScrollEnd}
            />
        );
    }

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
export default forwardRef(CustomFlatList);
