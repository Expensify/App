import type {ForwardedRef, ReactNode} from 'react';
import React, {createContext, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import type {ScrollViewProps} from './ScrollView';
import ScrollView from './ScrollView';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

type ScrollContextValue = {
    contentOffsetY: number;
    scrollViewRef?: ForwardedRef<RNScrollView>;
};

const ScrollContext = createContext<ScrollContextValue>({
    contentOffsetY: 0,
    scrollViewRef: null,
});

type ScrollViewWithContextProps = Partial<ScrollViewProps> & {
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    children?: ReactNode;
    scrollEventThrottle?: number;
};

/*
 * <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
 * <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
 * if it contains one or more <Picker /> / <RNPickerSelect /> components.
 * Using this wrapper will automatically handle scrolling to the picker's <TextInput />
 * when the picker modal is opened
 */
function ScrollViewWithContext({onScroll, scrollEventThrottle, children, ref, ...restProps}: ScrollViewWithContextProps) {
    const [contentOffsetY, setContentOffsetY] = useState(0);
    const defaultScrollViewRef = useRef<RNScrollView>(null);
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
            // It's possible for scrollEventThrottle to be 0, so we must use "||" to fallback to MIN_SMOOTH_SCROLL_EVENT_THROTTLE.
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            scrollEventThrottle={scrollEventThrottle || MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            <ScrollContext.Provider value={contextValue}>{children}</ScrollContext.Provider>
        </ScrollView>
    );
}

export default ScrollViewWithContext;
export {ScrollContext};
export type {ScrollContextValue};
