import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.element.isRequired,

    /** Callback to fire when the user swipes down on the child content */
    onSwipeDown: PropTypes.func,

    /** Callback to fire when the user swipes up on the child content */
    onSwipeUp: PropTypes.func,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    onSwipeDown: undefined,
    onSwipeUp: undefined,
    style: undefined,
};

const MIN_DELTA_Y = 25;

const isTextSelection = () => {
    const focused = document.activeElement;
    if (!focused) return false;
    if (typeof focused.selectionStart === 'number' && typeof focused.selectionEnd === 'number') {
        return focused.selectionStart !== focused.selectionEnd;
    }
    return false;
};

function SwipeableView(props) {
    const ref = useRef();
    const scrollableChildRef = useRef();
    const startY = useRef(0);
    const isScrolling = useRef(false);

    useEffect(() => {
        const element = ref.current;

        const handleTouchStart = (event) => {
            startY.current = event.touches[0].clientY;
        };

        const handleTouchEnd = (event) => {
            const deltaY = event.changedTouches[0].clientY - startY.current;
            const isSelecting = isTextSelection();
            let canSwipeDown = true;
            let canSwipeUp = true;
            if (scrollableChildRef.current) {
                canSwipeUp = scrollableChildRef.current.scrollHeight - scrollableChildRef.current.scrollTop === scrollableChildRef.current.clientHeight;
                canSwipeDown = scrollableChildRef.current.scrollTop === 0;
            }

            if (deltaY > MIN_DELTA_Y && props.onSwipeDown && !isSelecting && canSwipeDown && !isScrolling.current) {
                props.onSwipeDown();
            }

            if (deltaY < -MIN_DELTA_Y && props.onSwipeUp && !isSelecting && canSwipeUp && !isScrolling.current) {
                props.onSwipeUp();
            }
            isScrolling.current = false;
        };

        const handleScroll = (event) => {
            isScrolling.current = true;
            if (!event.target || scrollableChildRef.current) return;
            scrollableChildRef.current = event.target;
        };

        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchend', handleTouchEnd);
        element.addEventListener('scroll', handleScroll, true);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('scroll', handleScroll);
        };
    }, [props]);

    return (
        <View
            ref={ref}
            style={props.style}
        >
            {props.children}
        </View>
    );
}

SwipeableView.propTypes = propTypes;
SwipeableView.defaultProps = defaultProps;

export default SwipeableView;
