/* eslint-disable react/prop-types */
import React from 'react';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import styles from '../../../styles/styles';

const AnimatedView = Animated.createAnimatedComponent(View);

const Slider = (props) => {
    const rSliderStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: props.sliderValue.value,
            },
        ],
    }));

    return (
        <View style={[{width: props.SLIDER_LINE_WIDTH}, styles.sliderLine, styles.mh5]}>
            <PanGestureHandler onGestureEvent={props.onGestureEvent}>
                <AnimatedView style={[styles.sliderKnob, rSliderStyle]} />
            </PanGestureHandler>
        </View>
    );
};

export default Slider;
