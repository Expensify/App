import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle} from 'react-native-reanimated';
import Tooltip from '@components/Tooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';

const propTypes = {
    /** Callbacks for react-native-gesture-handler to be executed when the user is panning slider */
    gestureCallbacks: PropTypes.shape({onBegin: PropTypes.func, onChange: PropTypes.func, onFinalize: PropTypes.func}),

    /** X position of the slider knob */
    sliderValue: PropTypes.shape({value: PropTypes.number}),

    ...withLocalizePropTypes,
};

const defaultProps = {
    gestureCallbacks: {
        onBegin: () => {
            'worklet';
        },
        onChange: () => {
            'worklet';
        },
        onFinalize: () => {
            'worklet';
        },
    },
    sliderValue: {},
};

// This component can't be written using class since reanimated API uses hooks.
function Slider(props) {
    const styles = useThemeStyles();
    const sliderValue = props.sliderValue;
    const [tooltipIsVisible, setTooltipIsVisible] = useState(true);

    // A reanimated memoized style, which tracks
    // a translateX shared value and updates the slider position.
    const rSliderStyle = useAnimatedStyle(() => ({
        transform: [{translateX: sliderValue.value}],
    }));

    const panGesture = Gesture.Pan()
        .minDistance(5)
        .onBegin(() => {
            runOnJS(setTooltipIsVisible)(false);
            props.gestureCallbacks.onBegin();
        })
        .onChange((event) => {
            props.gestureCallbacks.onChange(event);
        })
        .onFinalize(() => {
            runOnJS(setTooltipIsVisible)(true);
            props.gestureCallbacks.onFinalize();
        });

    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (
        <View
            ref={ControlSelection.blockElement}
            style={styles.sliderBar}
        >
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.sliderKnob, rSliderStyle]}>
                    {tooltipIsVisible && (
                        <Tooltip
                            text={props.translate('common.zoom')}
                            shiftVertical={-2}
                        >
                            {/* pointerEventsNone is a workaround to make sure the pan gesture works correctly on mobile safari */}
                            <View style={[styles.sliderKnobTooltipView, styles.pointerEventsNone]} />
                        </Tooltip>
                    )}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

Slider.displayName = 'Slider';
Slider.propTypes = propTypes;
Slider.defaultProps = defaultProps;
export default withLocalize(Slider);
