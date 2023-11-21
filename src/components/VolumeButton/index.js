import React, {useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {useVolumeContext} from '@components/VideoPlayerContexts/VolumeContext';
import colors from '@styles/colors';
import stylePropTypes from '@styles/stylePropTypes';
import styles from '@styles/styles';

const propTypes = {
    style: stylePropTypes.isRequired,
};

const defaultProps = {};

const getVolumeIcon = (volume) => {
    if (volume === 0) {
        return Expensicons.Mute;
    }
    if (volume <= 0.5) {
        return Expensicons.VolumeLow;
    }
    return Expensicons.VolumeHigh;
};

function ProgressBar({style}) {
    const {updateVolume, volume} = useVolumeContext();
    const [sliderHeight, setSliderHeight] = useState(1);
    const [volumeIcon, setVolumeIcon] = useState({icon: getVolumeIcon(volume.value)});

    const onSliderLayout = (e) => {
        setSliderHeight(e.nativeEvent.layout.height);
    };

    const pan = Gesture.Pan().onChange((event) => {
        const val = Math.floor((1 - event.y / sliderHeight) * 100) / 100;
        volume.value = Math.min(Math.max(val, 0), 1);
    });

    const progressBarStyle = useAnimatedStyle(() => {
        updateVolume(volume.value);
        setVolumeIcon({icon: getVolumeIcon(volume.value)});
        return {height: `${volume.value * 100}%`};
    });

    return (
        <Hoverable>
            {(isHovered) => (
                <Animated.View style={[styles.videoIconButton, style]}>
                    {isHovered && (
                        <View style={[styles.volumeSliderContainer]}>
                            <GestureDetector gesture={pan}>
                                <Animated.View
                                    style={[styles.volumeSliderOverlay]}
                                    onLayout={onSliderLayout}
                                >
                                    <Animated.View style={[styles.volumeSliderFill, progressBarStyle]} />
                                </Animated.View>
                            </GestureDetector>
                        </View>
                    )}

                    <Icon
                        src={volumeIcon.icon}
                        fill={colors.white}
                        small
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
