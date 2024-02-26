import PropTypes from 'prop-types';
import React, {memo, useCallback, useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useDerivedValue} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import * as Expensicons from '@components/Icon/Expensicons';
import IconButton from '@components/VideoPlayer/IconButton';
import {useVolumeContext} from '@components/VideoPlayerContexts/VolumeContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as NumberUtils from '@libs/NumberUtils';
import stylePropTypes from '@styles/stylePropTypes';

const propTypes = {
    style: stylePropTypes.isRequired,
    small: PropTypes.bool,
};

const defaultProps = {
    small: false,
};

const getVolumeIcon = (volume) => {
    if (volume === 0) {
        return Expensicons.Mute;
    }
    if (volume <= 0.5) {
        return Expensicons.VolumeLow;
    }
    return Expensicons.VolumeHigh;
};

function VolumeButton({style, small}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateVolume, volume} = useVolumeContext();
    const [sliderHeight, setSliderHeight] = useState(1);
    const [volumeIcon, setVolumeIcon] = useState({icon: getVolumeIcon(volume.value)});
    const [isSliderBeingUsed, setIsSliderBeingUsed] = useState(false);

    const onSliderLayout = useCallback((e) => {
        setSliderHeight(e.nativeEvent.layout.height);
    }, []);

    const changeVolumeOnPan = useCallback(
        (event) => {
            const val = NumberUtils.roundToTwoDecimalPlaces(1 - event.y / sliderHeight);
            volume.value = NumberUtils.clamp(val, 0, 1);
        },
        [sliderHeight, volume],
    );

    const pan = Gesture.Pan()
        .onBegin((event) => {
            runOnJS(setIsSliderBeingUsed)(true);
            changeVolumeOnPan(event);
        })
        .onChange((event) => {
            changeVolumeOnPan(event);
        })
        .onFinalize(() => {
            runOnJS(setIsSliderBeingUsed)(false);
        });

    const progressBarStyle = useAnimatedStyle(() => ({height: `${volume.value * 100}%`}));

    const updateIcon = useCallback((vol) => {
        setVolumeIcon({icon: getVolumeIcon(vol)});
    }, []);

    useDerivedValue(() => {
        runOnJS(updateVolume)(volume.value);
        runOnJS(updateIcon)(volume.value);
    }, [volume]);

    return (
        <Hoverable>
            {(isHovered) => (
                <Animated.View style={[{cursor: isSliderBeingUsed ? 'grabbing' : 'pointer'}, style]}>
                    {(isSliderBeingUsed || isHovered) && (
                        <View style={[styles.volumeSliderContainer]}>
                            <GestureDetector gesture={pan}>
                                <View style={styles.ph2}>
                                    <View
                                        style={[styles.volumeSliderOverlay]}
                                        onLayout={onSliderLayout}
                                    >
                                        <View style={styles.volumeSliderThumb} />
                                        <Animated.View style={[styles.volumeSliderFill, progressBarStyle]} />
                                    </View>
                                </View>
                            </GestureDetector>
                        </View>
                    )}

                    <IconButton
                        tooltipText={volume.value === 0 ? translate('videoPlayer.unmute') : translate('videoPlayer.mute')}
                        onPress={() => updateVolume(volume.value === 0 ? 1 : 0)}
                        src={volumeIcon.icon}
                        fill={styles.white}
                        small={small}
                        shouldForceRenderingTooltipBelow
                    />
                </Animated.View>
            )}
        </Hoverable>
    );
}

VolumeButton.propTypes = propTypes;
VolumeButton.defaultProps = defaultProps;
VolumeButton.displayName = 'VolumeButton';

export default memo(VolumeButton);
