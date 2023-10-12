import React, {useRef} from 'react';
import {PanResponder, View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../CONST';

const propTypes = {
    children: PropTypes.element.isRequired,

    /** Callback to fire when the user swipes down on the child content */
    onSwipeDown: PropTypes.func.isRequired,
};

function SwipeableView(props) {
    const minimumPixelDistance = CONST.COMPOSER_MAX_HEIGHT;
    const oldYRef = useRef(0);
    const panResponder = useRef(
        PanResponder.create({
            // The PanResponder gets focus only when the y-axis movement is over minimumPixelDistance
            // & swipe direction is downwards
            onMoveShouldSetPanResponderCapture: (_event, gestureState) => {
                if (gestureState.dy - oldYRef.current > 0 && gestureState.dy > minimumPixelDistance) {
                    return true;
                }
                oldYRef.current = gestureState.dy;
            },

            // Calls the callback when the swipe down is released; after the completion of the gesture
            onPanResponderRelease: props.onSwipeDown,
        }),
    ).current;

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...panResponder.panHandlers}>{props.children}</View>
    );
}

SwipeableView.propTypes = propTypes;
SwipeableView.displayName = 'SwipeableView';

export default SwipeableView;
