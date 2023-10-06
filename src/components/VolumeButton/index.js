import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {View} from 'react-native';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Hoverable from '../Hoverable';

const propTypes = {
    updateVolume: PropTypes.func.isRequired,
};

const defaultProps = {};

function ProgressBar({updateVolume}) {
    const [sliderHeight, setSliderHeight] = useState(1);
    const progressHeight = useSharedValue(0);

    const onSliderLayout = (e) => {
        setSliderHeight(e.nativeEvent.layout.height);
    };

    const pan = Gesture.Pan().onChange((event) => {
        progressHeight.value = Math.min(Math.max(100 - (event.y / sliderHeight) * 100, 0), 100);
        updateVolume(progressHeight.value / 100);
    });

    const progressBarStyle = useAnimatedStyle(() => ({height: `${progressHeight.value}%`}));

    return (
        <Hoverable>
            {(isHovered) => (
                <Animated.View style={{padding: 5, position: 'relative'}}>
                    {isHovered && (
                        <View style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: 100, alignItems: 'center', borderRadius: 4, backgroundColor: '#085239'}}>
                            <GestureDetector gesture={pan}>
                                <Animated.View
                                    style={{width: 5, height: 60, backgroundColor: 'gray', borderRadius: 10, marginTop: 10, alignItems: 'end', justifyContent: 'flex-end'}}
                                    onLayout={onSliderLayout}
                                >
                                    <Animated.View style={[{width: 5, height: 20, backgroundColor: 'white', borderRadius: 10}, progressBarStyle]} />
                                </Animated.View>
                            </GestureDetector>
                        </View>
                    )}
                    <Icon
                        src={Expensicons.VolumeHigh}
                        fill="white"
                    />
                </Animated.View>
            )}
        </Hoverable>
    );
}

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;
ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
