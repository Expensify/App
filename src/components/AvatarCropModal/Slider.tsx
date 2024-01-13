import React, {useState} from 'react';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import type {GestureEvent, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';

type SliderProps = {
    /** React-native-reanimated lib handler which executes when the user is panning slider */
    onGesture?: (event: GestureEvent<PanGestureHandlerEventPayload>) => void;

    /** X position of the slider knob */
    sliderValue?: {
        value: number;
    };
};

// This component can't be written using class since reanimated API uses hooks.
function Slider({onGesture = () => {}, sliderValue = {value: 0}}: SliderProps) {
    const styles = useThemeStyles();
    const [tooltipIsVisible, setTooltipIsVisible] = useState(true);
    const {translate} = useLocalize();

    // A reanimated memoized style, which tracks
    // a translateX shared value and updates the slider position.
    const rSliderStyle = useAnimatedStyle(() => ({
        transform: [{translateX: sliderValue.value}],
    }));

    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (
        <View
            ref={(el) => {
                ControlSelection.blockElement(el as HTMLElement | null);
            }}
            style={styles.sliderBar}
        >
            <PanGestureHandler
                onBegan={() => setTooltipIsVisible(false)}
                onEnded={() => setTooltipIsVisible(true)}
                onGestureEvent={onGesture}
            >
                <Animated.View style={[styles.sliderKnob, rSliderStyle]}>
                    {tooltipIsVisible && (
                        <Tooltip
                            text={translate('common.zoom')}
                            shiftVertical={-2}
                        >
                            <View style={[styles.sliderKnobTooltipView]} />
                        </Tooltip>
                    )}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

Slider.displayName = 'Slider';

export default Slider;
