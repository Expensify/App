import React, {Component} from 'react';
import {PanResponder, View, Animated} from 'react-native';
import PropTypes from 'prop-types';

import CONST from '../../CONST';

const propTypes = {
    children: PropTypes.element.isRequired,

    /** Callback to fire when the user swipes down on the child content */
    onSwipeDown: PropTypes.func,

    /** Callback to fire when swiping left or right */
    onSwipeHorizontal: PropTypes.func,

    /** Callback to facility an press event */
    onPress: PropTypes.func,

    /** should the movement be animated */
    isAnimated: PropTypes.bool,
};

const defaultProps = {
    onSwipeDown: () => {},
    onSwipeHorizontal: () => {},
    onPress: () => {},
    isAnimated: false,
};

class SwipeableView extends Component {
    constructor(props) {
        super(props);

        if (this.props.isAnimated) {
            this.pan = new Animated.ValueXY();
        }

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: (_event, gestureState) => {
                if (gestureState.dy < CONST.COMPOSER_MAX_HEIGHT) { return; }
                return true;
            },

            onStartShouldSetPanResponder: () => this.props.isAnimated,
            onPanResponderMove: (event, gestureState) => {
                if (!this.props.isAnimated) { return; }
                return Animated.event([null, {
                    dx: this.pan.x,
                    dy: this.pan.y,
                }], {useNativeDriver: false})(event, gestureState);
            },

            onPanResponderRelease: (event, gestureState) => {
                if (!this.props.isAnimated) {
                    return this.props.onSwipeDown();
                }

                // For swiping through images, I needed to catch a single press to hide the arrows
                if (gestureState.dx === 0 && gestureState.dy === 0) {
                    return this.props.onPress();
                }

                if (Math.abs(gestureState.dx) > CONST.MAX_HORIZONTAL_SWIPE) {
                    const deltaSlide = gestureState.dx > 0 ? -1 : 1;
                    this.props.onSwipeHorizontal(deltaSlide);
                }

                Animated.spring(this.pan, {useNativeDriver: false, toValue: {x: 0, y: 0}}).start();
            },
        });
    }

    render() {
        if (this.props.isAnimated) {
            return (
                <Animated.View
                    style={{
                        transform: [{translateX: this.pan.x}],
                    }}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.panResponder.panHandlers}
                >
                    {this.props.children}
                </Animated.View>
            );
        }

        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <View {...this.panResponder.panHandlers}>
                {this.props.children}
            </View>
        );
    }
}

SwipeableView.propTypes = propTypes;
SwipeableView.defaultProps = defaultProps;

export default SwipeableView;
