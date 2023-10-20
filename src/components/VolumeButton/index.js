import React, {useState} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Hoverable from '../Hoverable';
import {useVolumeContext} from '../VideoPlayerContexts/VolumeContext';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {};

function ProgressBar({style}) {
    const {updateVolume, volume} = useVolumeContext();
    const [sliderHeight, setSliderHeight] = useState(1);

    const onSliderLayout = (e) => {
        setSliderHeight(e.nativeEvent.layout.height);
    };

    const getVolumeIcon = () => {
        if (volume.value === 0) {
            return Expensicons.Mute;
        }
        if (volume.value <= 0.5) {
            return Expensicons.VolumeLow;
        }
        return Expensicons.VolumeHigh;
    };

    const pan = Gesture.Pan().onChange((event) => {
        const val = Math.floor((1 - event.y / sliderHeight) * 100) / 100;
        volume.value = Math.min(Math.max(val, 0), 1);
        updateVolume(volume.value);
    });

    const progressBarStyle = useAnimatedStyle(() => ({height: `${volume.value * 100}%`}));

    return (
        <Hoverable>
            {(isHovered) => (
                <Animated.View style={[{padding: 5, position: 'relative'}, style]}>
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
                        src={getVolumeIcon()}
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
