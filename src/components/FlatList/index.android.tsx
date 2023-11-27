import {useFocusEffect} from '@react-navigation/native';
import React, {ForwardedRef, forwardRef, useCallback, useState} from 'react';
import {FlatList, FlatListProps} from 'react-native';

type ScrollPosition = {offset?: number};

// FlatList wrapped with the freeze component will lose its scroll state when frozen (only for Android).
// CustomFlatList saves the offset and use it for scrollToOffset() when unfrozen.
function CustomFlatList<T>(props: FlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});

    const onScreenFocus = useCallback(() => {
        if (typeof ref === 'function') {
            return;
        }
        if (!ref?.current || !scrollPosition.offset) {
            return;
        }
        if (ref.current && scrollPosition.offset) {
            ref.current.scrollToOffset({offset: scrollPosition.offset, animated: false});
        }
    }, [scrollPosition.offset, ref]);

    useFocusEffect(
        useCallback(() => {
            onScreenFocus();
        }, [onScreenFocus]),
    );

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScroll={(event) => props.onScroll?.(event)}
            onMomentumScrollEnd={(event) => {
                setScrollPosition({offset: event.nativeEvent.contentOffset.y});
            }}
            ref={ref}
        />
    );
}

CustomFlatList.displayName = 'CustomFlatListWithRef';
export default forwardRef(CustomFlatList);
