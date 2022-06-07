import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import styles from '../../styles/styles';
import gestureHandlerPropTypes from './gestureHandlerPropTypes';

const AnimatedView = Animated.createAnimatedComponent(View);

const propTypes = {
    /** Width of the slider that will be rendered */
    sliderLineWidth: PropTypes.number,

    /** React-native-reanimated lib handler which executes when the user is panning slider */
    onGestureEventHandler: gestureHandlerPropTypes,

    /** X position of the slider knob */
    sliderValue: PropTypes.shape({value: PropTypes.number}),
};

const defaultProps = {
    sliderLineWidth: 0,
    onGestureEventHandler: () => {},
    sliderValue: {},
};

// This component can't be written using class since reanimated API uses hooks.
const Slider = (props) => {
    // A memoized by reanimated style, which tracks
    // a translateX shared value and updates a slider's position
    const rSliderStyle = useAnimatedStyle(() => ({
        transform: [{translateX: props.sliderValue.value}],
    }));

    return (
        <View style={[{width: props.sliderLineWidth}, styles.sliderLine]}>
            <PanGestureHandler onGestureEvent={props.onGestureEventHandler}>
                <AnimatedView style={[styles.sliderKnob, rSliderStyle]} />
            </PanGestureHandler>
        </View>
    );
};

Slider.displayName = 'Slider';
Slider.propTypes = propTypes;
Slider.defaultProps = defaultProps;
export default Slider;
