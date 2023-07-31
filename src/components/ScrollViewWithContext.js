import React, {useState, useRef} from 'react';
import {ScrollView} from 'react-native';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

const ScrollContext = React.createContext();

// eslint-disable-next-line react/forbid-foreign-prop-types
const propTypes = ScrollView.propTypes;

function ScrollViewWithContext({onScroll, scrollEventThrottle, children, innerRef, ...restProps}) {
    const [contentOffsetY, setContentOffsetY] = useState(0);
    const defaultScrollViewRef = useRef();
    const scrollViewRef = innerRef || defaultScrollViewRef;

    const setContextScrollPosition = (event) => {
        if (onScroll) {
            onScroll(event);
        }
        setContentOffsetY(event.nativeEvent.contentOffset.y);
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
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
