import React, {ForwardedRef, Ref, useRef, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewProps} from 'react-native';

type ScrollContextType = {
    scrollViewRef: Ref<ScrollView>;
    contentOffsetY: number;
};

type Props = ScrollViewProps & {
    innerRef: ForwardedRef<ScrollView>;
};

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

const ScrollContext = React.createContext<ScrollContextType | undefined>(undefined);

/*
 * <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
 * <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
 * if it contains one or more <Picker /> / <RNPickerSelect /> components.
 * Using this wrapper will automatically handle scrolling to the picker's <TextInput />
 * when the picker modal is opened
 */
function ScrollViewWithContext(props: Props) {
    const [contentOffsetY, setContentOffsetY] = useState(0);
    const ref = useRef<ScrollView>(null);
    const scrollViewRef = props.innerRef ?? ref;

    const setContextScrollPosition = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (props.onScroll) {
            props.onScroll(event);
        }
        setContentOffsetY(event.nativeEvent.contentOffset.y);
    };

    return (
        <ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={scrollViewRef}
            onScroll={setContextScrollPosition}
            scrollEventThrottle={props.scrollEventThrottle ?? MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            <ScrollContext.Provider
                value={{
                    scrollViewRef,
                    contentOffsetY,
                }}
            >
                {props.children}
            </ScrollContext.Provider>
        </ScrollView>
    );
}

export default React.forwardRef<ScrollView, Props>((props, ref) => (
    <ScrollViewWithContext
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

export {ScrollContext};
