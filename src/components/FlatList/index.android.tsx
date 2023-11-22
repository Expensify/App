import {useFocusEffect} from '@react-navigation/native';
import React, {ForwardedRef, forwardRef, useCallback, useState} from 'react';
import {FlatList, FlatListProps} from 'react-native';

type CustomFlatListProps = {
    /** Same as for FlatList */
    onScroll?: (...args: unknown[]) => unknown;

    /** Same as for FlatList */
    onLayout?: () => (...args: unknown[]) => unknown;

    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: ForwardedRef<FlatList>;
} & FlatListProps<unknown>;

// FlatList wrapped with the freeze component will lose its scroll state when frozen (only for Android).
// CustomFlatList saves the offset and use it for scrollToOffset() when unfrozen.
function CustomFlatList(props: CustomFlatListProps) {
    const [scrollPosition, setScrollPosition] = useState<{offset?: number}>({});

    const {innerRef} = props;

    const onScreenFocus = useCallback(() => {
        if (typeof innerRef === 'function') {
            return;
        }
        if (!innerRef?.current || !scrollPosition.offset) {
            return;
        }
        if (innerRef.current && scrollPosition.offset) {
            innerRef.current.scrollToOffset({offset: scrollPosition.offset, animated: false});
        }
    }, [scrollPosition.offset, innerRef]);

    useFocusEffect(
        useCallback(() => {
            onScreenFocus();
        }, [onScreenFocus]),
    );

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScroll={(event) => props.onScroll?.(event)}
            onMomentumScrollEnd={(event) => {
                setScrollPosition({offset: event.nativeEvent.contentOffset.y});
            }}
            ref={props.innerRef}
        />
    );
}

CustomFlatList.displayName = 'CustomFlatListWithRef';

const CustomFlatListWithRef = forwardRef((props: CustomFlatListProps, ref: ForwardedRef<FlatList>) => (
    <CustomFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

export default CustomFlatListWithRef;
