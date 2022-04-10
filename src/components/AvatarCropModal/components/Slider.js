import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import styles from '../../../styles/styles';

const AnimatedView = Animated.createAnimatedComponent(View);

const propTypes = {
    /** Width of the image container that will be rendered */
    sliderLineWidth: PropTypes.number,

    /** Callback to execute when user panning slider */
    onGestureEvent: PropTypes.func,

    /** X posion of the slider knob */
    sliderValue: PropTypes.shape({value: PropTypes.number}),
};

const defaultProps = {
    sliderLineWidth: 0,
    onGestureEvent: () => { },
    sliderValue: {},
};

const Slider = (props) => {
    const rSliderStyle = useAnimatedStyle(() => ({
        transform: [{translateX: props.sliderValue.value}],
    }));

    return (
        <View style={[{width: props.sliderLineWidth}, styles.sliderLine, styles.mh5]}>
            <PanGestureHandler onGestureEvent={props.onGestureEvent}>
                <AnimatedView style={[styles.sliderKnob, rSliderStyle]} />
            </PanGestureHandler>
        </View>
    );
};

Slider.displayName = 'Slider';
Slider.propTypes = propTypes;
Slider.defaultProps = defaultProps;
export default Slider;
