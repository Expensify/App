import type {ForwardedRef, ReactNode} from 'react';
import React, {createContext, forwardRef, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps} from 'react-native';
import {ScrollView} from 'react-native';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

type ScrollContextValue = {
    contentOffsetY: number;
    scrollViewRef: ForwardedRef<ScrollView>;
};

const ScrollContext = createContext<ScrollContextValue>({
    contentOffsetY: 0,
    scrollViewRef: null,
});

type ScrollViewWithContextProps = {
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    children?: ReactNode;
    scrollEventThrottle?: number;
} & Partial<ScrollViewProps>;

/*
 * <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
 * <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
 * if it contains one or more <Picker /> / <RNPickerSelect /> components.
 * Using this wrapper will automatically handle scrolling to the picker's <TextInput />
 * when the picker modal is opened
 */
function ScrollViewWithContext({onScroll, scrollEventThrottle, children, ...restProps}: ScrollViewWithContextProps, ref: ForwardedRef<ScrollView>) {
    const [contentOffsetY, setContentOffsetY] = useState(0);
    const defaultScrollViewRef = useRef<ScrollView>(null);
    const scrollViewRef = ref ?? defaultScrollViewRef;

    const setContextScrollPosition = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (onScroll) {
            onScroll(event);
        }
        setContentOffsetY(event.nativeEvent.contentOffset.y);
    };

    const contextValue = useMemo(
        () => ({
            scrollViewRef,
            contentOffsetY,
        }),
        [scrollViewRef, contentOffsetY],
    );

    return (
        <ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={scrollViewRef}
            onScroll={setContextScrollPosition}
            scrollEventThrottle={scrollEventThrottle ?? MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            <ScrollContext.Provider value={contextValue}>{children}</ScrollContext.Provider>
        </ScrollView>
    );
}

ScrollViewWithContext.displayName = 'ScrollViewWithContext';

export default forwardRef(ScrollViewWithContext);
export {ScrollContext};
export type {ScrollContextValue};
