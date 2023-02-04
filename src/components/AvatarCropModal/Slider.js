import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import styles from '../../styles/styles';
import gestureHandlerPropTypes from './gestureHandlerPropTypes';
import ControlSelection from '../../libs/ControlSelection';

const propTypes = {
    /** React-native-reanimated lib handler which executes when the user is panning slider */
    onGesture: gestureHandlerPropTypes,

    /** X position of the slider knob */
    sliderValue: PropTypes.shape({value: PropTypes.number}),
};

const defaultProps = {
    onGesture: () => {},
    sliderValue: {},
};

// This component can't be written using class since reanimated API uses hooks.
const Slider = (props) => {
    // A reanimated memoized style, which tracks
    // a translateX shared value and updates the slider position.
    const rSliderStyle = useAnimatedStyle(() => ({
        transform: [{translateX: props.sliderValue.value}],
    }));

    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (
        <View ref={ControlSelection.blockElement} style={styles.sliderBar}>
            <PanGestureHandler onGestureEvent={props.onGesture}>
                <Animated.View style={[styles.sliderKnob, rSliderStyle]} />
            </PanGestureHandler>
        </View>
    );
};

Slider.displayName = 'Slider';
Slider.propTypes = propTypes;
Slider.defaultProps = defaultProps;
export default Slider;
