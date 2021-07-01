import React, {PureComponent} from 'react';
import {PanResponder, View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../CONST';

const propTypes = {
    children: PropTypes.element.isRequired,

    /** Callback to fire when the user swipes down on the child content */
    onSwipeDown: PropTypes.func.isRequired,
};

class SwipeableView extends PureComponent {
    constructor(props) {
        super(props);

        const minimumPixelDistance = CONST.COMPOSER_MAX_HEIGHT;
        this.oldY = 0;
        this.panResponder = PanResponder.create({

            // The PanResponder gets focus only when the y-axis movement is over minimumPixelDistance
            // & swip direction is downwards
            onMoveShouldSetPanResponderCapture:
            (_event, gestureState) => {
                if ((gestureState.dy - this.oldY) > 0 && gestureState.dy > minimumPixelDistance) {
                    return true;
                }
                this.oldY = gestureState.dy;
            },

            // Calls the callback when the swipe down is released; after the completion of the gesture
            onPanResponderRelease: this.props.onSwipeDown,
        });
    }

    render() {
        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <View {...this.panResponder.panHandlers}>
                {this.props.children}
            </View>
        );
    }
}

SwipeableView.propTypes = propTypes;
SwipeableView.displayName = 'SwipeableView';
export default SwipeableView;
