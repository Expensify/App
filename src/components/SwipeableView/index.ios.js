import React, {PureComponent} from 'react';
import {PanResponder, View} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.element.isRequired,

    // callback whenever swipe down is registered
    onSwipeDown: PropTypes.func.isRequired,
};

class SwipeableView extends PureComponent {
    constructor(props) {
        super(props);
        this.panResponder = PanResponder.create({

            // The PanResponder gets focus only when the y-axis movement is over 3 pixels
            onMoveShouldSetPanResponderCapture:
            (_, gestureState) => gestureState.dy > 3,

            // Calls the callback when the swipe down is released; after the completion of the gesture
            onPanResponderRelease: () => {
                this.props.onSwipeDown();
            },
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
