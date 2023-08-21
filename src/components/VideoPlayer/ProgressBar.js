import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue, withTiming, runOnJS} from 'react-native-reanimated';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    duration: PropTypes.number.isRequired,

    position: PropTypes.number.isRequired,

    updatePostiion: PropTypes.func.isRequired,
};

const defaultProps = {};

function ProgressBar({duration, position, updatePostiion}) {
    const [sliderWidth, setSliderWidth] = useState(1);
    const progressWidth = useSharedValue(0);

    const onSliderLayout = (e) => {
        setSliderWidth(e.nativeEvent.layout.width);
    };

    const pan = Gesture.Pan().onChange((event) => {
        progressWidth.value = (event.x / sliderWidth) * 100;
        runOnJS(updatePostiion)((event.x / sliderWidth) * duration);
    });

    useEffect(() => {
        progressWidth.value = withTiming((position / duration) * 100, {duration: 270});
    }, [duration, position, progressWidth]);

    const progressBarStyle = useAnimatedStyle(() => ({width: `${progressWidth.value}%`}));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                style={{width: '100%', height: 5, backgroundColor: 'gray', borderRadius: 10, marginVertical: 10}}
                onLayout={onSliderLayout}
            >
                <Animated.View style={[{height: '100%', backgroundColor: 'white', borderRadius: 10}, progressBarStyle]} />
            </Animated.View>
        </GestureDetector>
    );
}

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;
ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
