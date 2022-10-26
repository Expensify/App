import React, {Component} from 'react';
import {PanResponder, Dimensions, Animated} from 'react-native';
import PropTypes from 'prop-types';

import styles from '../../../styles/styles';

const propTypes = {
    children: PropTypes.element.isRequired,

    /** Callback to fire when swiping left or right */
    onCycleThroughAttachments: PropTypes.func,

    /** Callback to handle a press event because PanResponder will intercept all gestures */
    onPress: PropTypes.func,

    /** These help to prevent a swipe animation when at either end */
    canSwipeLeft: PropTypes.bool,
    canSwipeRight: PropTypes.bool,
};

const defaultProps = {
    onCycleThroughAttachments: () => {},
    onPress: () => {},
    canSwipeLeft: false,
    canSwipeRight: false,
};

class Carousel extends Component {
    constructor(props) {
        super(props);
        this.pan = new Animated.Value(0);

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,

            onPanResponderMove: (event, gestureState) => Animated.event([null, {
                dx: this.pan,
            }], {useNativeDriver: false})(event, gestureState),

            onPanResponderRelease: (event, gestureState) => {
                if (gestureState.dx === 0 && gestureState.dy === 0) {
                    return this.props.onPress();
                }

                const deltaSlide = gestureState.dx > 0 ? -1 : 1;
                if (Math.abs(gestureState.vx) < 1.6 || (deltaSlide === -1 && !this.props.canSwipeLeft) || (deltaSlide === 1 && !this.props.canSwipeRight)) {
                    return Animated.spring(this.pan, {useNativeDriver: false, toValue: 0}).start();
                }

                const width = Dimensions.get('window').width;
                const slideLength = deltaSlide * (width * (3 / 4));
                Animated.timing(this.pan, {useNativeDriver: false, duration: 100, toValue: -slideLength}).start(({finished}) => {
                    if (!finished) {
                        return;
                    }

                    this.props.onCycleThroughAttachments(deltaSlide);
                    this.pan.setValue(slideLength);
                    Animated.timing(this.pan, {useNativeDriver: false, duration: 100, toValue: 0}).start();
                });
            },
        });
    }

    render() {
        return (
            <Animated.View
                style={[
                    styles.w100,
                    styles.h100,
                    {transform: [{translateX: this.pan}]},
                ]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.panResponder.panHandlers}
            >
                {this.props.children}
            </Animated.View>
        );
    }
}

Carousel.propTypes = propTypes;
Carousel.defaultProps = defaultProps;

export default Carousel;
