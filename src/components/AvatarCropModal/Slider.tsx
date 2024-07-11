import React, {useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import type {GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import ControlSelection from '@libs/ControlSelection';

type SliderProps = {
    /** React-native-reanimated lib handler which executes when the user is panning slider */
    gestureCallbacks: {
        onBegin: () => void;
        onChange: (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => void;
        onFinalize: () => void;
    };

    /** X position of the slider knob */
    sliderValue: SharedValue<number>;
};

// This component can't be written using class since reanimated API uses hooks.
function Slider({sliderValue, gestureCallbacks}: SliderProps) {
    const styles = useThemeStyles();
    const [tooltipIsVisible, setTooltipIsVisible] = useState(true);
    const {translate} = useLocalize();

    // A reanimated memoized style, which tracks
    // a translateX shared value and updates the slider position.
    const rSliderStyle = useAnimatedStyle(() => {
        'worklet';

        return {
            transform: [{translateX: sliderValue.value}],
        };
    });

    const panGesture = Gesture.Pan()
        .minDistance(5)
        .onBegin(() => {
            runOnJS(setTooltipIsVisible)(false);
            gestureCallbacks.onBegin();
        })
        .onChange((event) => {
            gestureCallbacks.onChange(event);
        })
        .onFinalize(() => {
            runOnJS(setTooltipIsVisible)(true);
            gestureCallbacks.onFinalize();
        });

    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (
        <View
            ref={(el) => ControlSelection.blockElement(el as HTMLElement | null)}
            style={styles.sliderBar}
        >
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.sliderKnob, rSliderStyle]}>
                    {tooltipIsVisible && (
                        <Tooltip
                            text={translate('common.zoom')}
                            shiftVertical={-2}
                        >
                            {/* pointerEventsNone is a workaround to make sure the pan gesture works correctly on mobile safari */}
                            <View style={[styles.sliderKnobTooltipView, Browser.isMobileSafari() && styles.pointerEventsNone]} />
                        </Tooltip>
                    )}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

Slider.displayName = 'Slider';
export default Slider;
