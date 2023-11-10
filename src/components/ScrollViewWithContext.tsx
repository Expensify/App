import React, {ForwardedRef, useMemo, useRef, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView} from 'react-native';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

type ScrollContextValue = {
    contentOffsetY: number;
    scrollViewRef: ForwardedRef<ScrollView>;
};

const ScrollContext = React.createContext<ScrollContextValue>({
    contentOffsetY: 0,
    scrollViewRef: null,
});

type ScrollViewWithContextProps = {
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    children?: React.ReactNode;
    scrollEventThrottle: number;
} & Partial<ScrollView>;

/*
 * <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
 * <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
 * if it contains one or more <Picker /> / <RNPickerSelect /> components.
 * Using this wrapper will automatically handle scrolling to the picker's <TextInput />
 * when the picker modal is opened
 */
function ScrollViewWithContextWithRef({onScroll, scrollEventThrottle, children, ...restProps}: ScrollViewWithContextProps, ref: ForwardedRef<ScrollView>) {
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
            scrollEventThrottle={scrollEventThrottle || MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            <ScrollContext.Provider value={contextValue}>{children}</ScrollContext.Provider>
        </ScrollView>
    );
}

ScrollViewWithContextWithRef.displayName = 'ScrollViewWithContextWithRef';

export default React.forwardRef(ScrollViewWithContextWithRef);
export {ScrollContext};
