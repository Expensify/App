import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useContext, useEffect} from 'react';
import type {FlatListProps, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import {ActionListContext} from '@pages/home/ReportScreenContext';

// FlatList wrapped with the freeze component will lose its scroll state when frozen (only for Android).
// CustomFlatList saves the offset and use it for scrollToOffset() when unfrozen.
function CustomFlatList<T>(props: FlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {setScrollPosition, getScrollPosition} = useContext(ActionListContext);

    const onScreenFocus = useCallback(() => {
        const pos = getScrollPosition();
        if (typeof ref === 'function') {
            return;
        }
        if (!ref?.current || !pos?.offset) {
            return;
        }
        if (ref.current && pos?.offset) {
            ref.current.scrollToOffset({offset: pos.offset, animated: false});
        }
    }, [ref]);

    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => setScrollPosition({offset: event.nativeEvent.contentOffset.y}), []);

    useEffect(() => {
        setScrollPosition(undefined);
        return () => setScrollPosition(undefined);
    },[])

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
export default forwardRef(CustomFlatList);
