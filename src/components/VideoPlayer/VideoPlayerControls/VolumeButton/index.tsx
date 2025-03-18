import React, {memo, useCallback, useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {GestureStateChangeEvent, GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useDerivedValue} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import * as Expensicons from '@components/Icon/Expensicons';
import IconButton from '@components/VideoPlayer/IconButton';
import {useVolumeContext} from '@components/VideoPlayerContexts/VolumeContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as NumberUtils from '@libs/NumberUtils';

type VolumeButtonProps = {
    /** Style for the volume button. */
    style?: StyleProp<ViewStyle>;

    /** Is button icon small. */
    small?: boolean;
};

const getVolumeIcon = (volume: number) => {
    if (volume === 0) {
        return Expensicons.Mute;
    }
    if (volume <= 0.5) {
        return Expensicons.VolumeLow;
    }
    return Expensicons.VolumeHigh;
};

function VolumeButton({style, small = false}: VolumeButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateVolume, volume, toggleMute} = useVolumeContext();
    const [sliderHeight, setSliderHeight] = useState(1);
    const [volumeIcon, setVolumeIcon] = useState({icon: getVolumeIcon(volume.get())});
    const [isSliderBeingUsed, setIsSliderBeingUsed] = useState(false);

    const onSliderLayout = useCallback((event: LayoutChangeEvent) => {
        setSliderHeight(event.nativeEvent.layout.height);
    }, []);

    const changeVolumeOnPan = useCallback(
        (event: GestureStateChangeEvent<PanGestureHandlerEventPayload> | GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
            const val = NumberUtils.roundToTwoDecimalPlaces(1 - event.y / sliderHeight);
            volume.set(NumberUtils.clamp(val, 0, 1));
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

    const progressBarStyle = useAnimatedStyle(() => ({height: `${volume.get() * 100}%`}));

    const updateIcon = useCallback((vol: number) => {
        setVolumeIcon({icon: getVolumeIcon(vol)});
    }, []);

    useDerivedValue(() => {
        runOnJS(updateVolume)(volume.get());
        runOnJS(updateIcon)(volume.get());
    }, [volume]);

    return (
        <Hoverable>
            {(isHovered) => (
                <Animated.View style={[isSliderBeingUsed ? styles.cursorGrabbing : styles.cursorPointer, style]}>
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
                        tooltipText={volume.get() === 0 ? translate('videoPlayer.unmute') : translate('videoPlayer.mute')}
                        onPress={toggleMute}
                        src={volumeIcon.icon}
                        small={small}
                        shouldForceRenderingTooltipBelow
                    />
                </Animated.View>
            )}
        </Hoverable>
    );
}

VolumeButton.displayName = 'VolumeButton';

export default memo(VolumeButton);
