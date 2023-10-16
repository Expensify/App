import React, {useState, useRef} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView} from 'react-native';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

const ScrollContext = React.createContext();

// eslint-disable-next-line react/forbid-foreign-prop-types
const propTypes = ScrollView.propTypes;

type ScrollViewWithContextProps = {
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    children?: React.ReactNode;
    scrollEventThrottle: number;
    innerRef: React.MutableRefObject<ScrollView>;
};

/*
 * <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
 * <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
 * if it contains one or more <Picker /> / <RNPickerSelect /> components.
 * Using this wrapper will automatically handle scrolling to the picker's <TextInput />
 * when the picker modal is opened
 */
function ScrollViewWithContext({onScroll, scrollEventThrottle, children, innerRef, ...restProps}: ScrollViewWithContextProps) {
    const [contentOffsetY, setContentOffsetY] = useState(0);
    const defaultScrollViewRef = useRef<ScrollView>();
    const scrollViewRef = innerRef || defaultScrollViewRef;

    const setContextScrollPosition = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (onScroll) {
            onScroll(event);
        }
        setContentOffsetY(event.nativeEvent.contentOffset.y);
    };

    return (
        <ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={scrollViewRef}
            onScroll={setContextScrollPosition}
            scrollEventThrottle={scrollEventThrottle || MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            <ScrollContext.Provider
                value={{
                    scrollViewRef,
                    contentOffsetY,
                }}
            >
                {children}
            </ScrollContext.Provider>
        </ScrollView>
    );
}

ScrollViewWithContext.propTypes = propTypes;
ScrollViewWithContext.displayName = 'ScrollViewWithContext';

export default React.forwardRef((props, ref) => (
    <ScrollViewWithContext
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
export {ScrollContext};
