import React, {useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useVolumeContext} from '@components/VideoPlayerContexts/VolumeContext';
import useLocalize from '@hooks/useLocalize';
import colors from '@styles/colors';
import stylePropTypes from '@styles/stylePropTypes';
import styles from '@styles/styles';
import spacing from '@styles/utilities/spacing';

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
    const {translate} = useLocalize();
    const {updateVolume, volume} = useVolumeContext();
    const [sliderHeight, setSliderHeight] = useState(1);
    const [volumeIcon, setVolumeIcon] = useState({icon: getVolumeIcon(volume.value)});
    const [isSliderBeingUsed, setIsSliderBeingUsed] = useState(false);

    const onSliderLayout = (e) => {
        setSliderHeight(e.nativeEvent.layout.height);
    };

    const pan = Gesture.Pan()
        .onBegin(() => {
            runOnJS(setIsSliderBeingUsed)(true);
        })
        .onChange((event) => {
            const val = Math.floor((1 - event.y / sliderHeight) * 100) / 100;
            volume.value = Math.min(Math.max(val, 0), 1);
        })
        .onEnd(() => {
            runOnJS(setIsSliderBeingUsed)(false);
        });

    const progressBarStyle = useAnimatedStyle(() => {
        runOnJS(updateVolume)(volume.value);
        runOnJS(setVolumeIcon)({icon: getVolumeIcon(volume.value)});
        return {height: `${volume.value * 100}%`};
    });

    return (
        <Hoverable>
            {(isHovered) => (
                <Animated.View style={[styles.videoIconButton, style]}>
                    {(isSliderBeingUsed || isHovered) && (
                        <View style={[styles.volumeSliderContainer]}>
                            <GestureDetector gesture={pan}>
                                <View style={spacing.ph2}>
                                    <View
                                        style={[styles.volumeSliderOverlay]}
                                        onLayout={onSliderLayout}
                                    >
                                        <Animated.View style={[styles.volumeSliderFill, progressBarStyle]} />
                                    </View>
                                </View>
                            </GestureDetector>
                        </View>
                    )}

                    <PressableWithoutFeedback
                        accessibilityLabel={volume.value === 0 ? translate('videoPlayer.unmute') : translate('videoPlayer.mute')}
                        onPress={() => updateVolume(volume.value === 0 ? 1 : 0)}
                    >
                        <Icon
                            src={volumeIcon.icon}
                            fill={colors.white}
                            small
                        />
                    </PressableWithoutFeedback>
                </Animated.View>
            )}
        </Hoverable>
    );
}

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;
ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
