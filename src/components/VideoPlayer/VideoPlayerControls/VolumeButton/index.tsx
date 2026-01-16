import React, {memo, useCallback, useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {GestureStateChangeEvent, GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useDerivedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import Hoverable from '@components/Hoverable';
import IconButton from '@components/VideoPlayer/IconButton';
import {useVolumeContext} from '@components/VideoPlayerContexts/VolumeContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clamp, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type VolumeButtonProps = {
    /** Style for the volume button. */
    style?: StyleProp<ViewStyle>;

    /** Is button icon small. */
    small?: boolean;
};

const getVolumeIcon = (icons: Record<'Mute' | 'VolumeHigh' | 'VolumeLow', IconAsset>, volume: number) => {
    if (volume === 0) {
        return icons.Mute;
    }
    if (volume <= 0.5) {
        return icons.VolumeLow;
    }
    return icons.VolumeHigh;
};

function VolumeButton({style, small = false}: VolumeButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Mute', 'VolumeHigh', 'VolumeLow']);
    const {updateVolume, volume, toggleMute} = useVolumeContext();
    const [sliderHeight, setSliderHeight] = useState(1);
    const [volumeIcon, setVolumeIcon] = useState({icon: getVolumeIcon(expensifyIcons, volume.get())});
    const [isSliderBeingUsed, setIsSliderBeingUsed] = useState(false);

    const onSliderLayout = useCallback((event: LayoutChangeEvent) => {
        setSliderHeight(event.nativeEvent.layout.height);
    }, []);

    const changeVolumeOnPan = useCallback(
        (event: GestureStateChangeEvent<PanGestureHandlerEventPayload> | GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
            const val = roundToTwoDecimalPlaces(1 - event.y / sliderHeight);
            volume.set(clamp(val, 0, 1));
        },
        [sliderHeight, volume],
    );

    const pan = Gesture.Pan()
        .onBegin((event) => {
            scheduleOnRN(setIsSliderBeingUsed, true);
            changeVolumeOnPan(event);
        })
        .onChange((event) => {
            changeVolumeOnPan(event);
        })
        .onFinalize(() => {
            scheduleOnRN(setIsSliderBeingUsed, false);
        });

    const progressBarStyle = useAnimatedStyle(() => ({height: `${volume.get() * 100}%`}));

    const updateIcon = useCallback(
        (vol: number) => {
            setVolumeIcon({icon: getVolumeIcon(expensifyIcons, vol)});
        },
        [expensifyIcons],
    );

    useDerivedValue(() => {
        scheduleOnRN(updateVolume, volume.get());
        scheduleOnRN(updateIcon, volume.get());
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
                        sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.MUTE_BUTTON}
                    />
                </Animated.View>
            )}
        </Hoverable>
    );
}

export default memo(VolumeButton);
