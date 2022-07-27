import React, {Component} from 'react';
import {
    PanResponder, View, Dimensions, Animated,
} from 'react-native';
import PropTypes from 'prop-types';

import CONST from '../../CONST';

const propTypes = {
    children: PropTypes.element.isRequired,

    /** Callback to fire when the user swipes down on the child content */
    onSwipeDown: PropTypes.func,

    /** Callback to fire when swiping left or right */
    onSwipeHorizontal: PropTypes.func,

    /** These help to prevent a swipe animation when at either end */
    canSwipeLeft: PropTypes.bool,
    canSwipeRight: PropTypes.bool,

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
    canSwipeLeft: false,
    canSwipeRight: false,
};

class SwipeableView extends Component {
    constructor(props) {
        super(props);

        if (this.props.isAnimated) {
            this.pan = new Animated.Value(0);
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
                    dx: this.pan,
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

                const deltaSlide = gestureState.dx > 0 ? -1 : 1;
                if (Math.abs(gestureState.vx) < 1.8 || (deltaSlide === -1 && !this.props.canSwipeLeft) || (deltaSlide === 1 && !this.props.canSwipeRight)) {
                    return Animated.spring(this.pan, {useNativeDriver: false, toValue: 0}).start();
                }

                const width = Dimensions.get('window').width;
                const slideLength = deltaSlide * (width * (3 / 4));
                Animated.timing(this.pan, {useNativeDriver: false, duration: 100, toValue: -slideLength}).start(({finished}) => {
                    if (!finished) {
                        return;
                    }
                    this.props.onSwipeHorizontal(deltaSlide);
                    this.pan.setValue(slideLength);
                    Animated.timing(this.pan, {useNativeDriver: false, duration: 100, toValue: 0}).start();
                });
            },
        });
    }

    render() {
        if (this.props.isAnimated) {
            return (
                <Animated.View
                    style={{
                        transform: [{translateX: this.pan}],
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
