import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {RefObject} from 'react';
import type {ViewStyle} from 'react-native';
import type {GestureType} from 'react-native-gesture-handler';
import type {PermissionStatus} from 'react-native-permissions';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {Camera, CameraDevice, CameraDeviceFormat} from 'react-native-vision-camera';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated from 'react-native-reanimated';

import NavigationAwareCamera from './NavigationAwareCamera/Camera';

type CameraViewportProps = {
    /** Ref to the underlying Camera instance */
    camera: RefObject<Camera | null>;

    /** The active camera device descriptor */
    device: CameraDevice;

    /** The selected camera format (resolution / FPS) */
    format: CameraDeviceFormat | undefined;

    /** Target frames-per-second for the camera preview */
    fps: number;

    /** Aspect ratio used to size the camera viewfinder */
    cameraAspectRatio: number | undefined;

    /** Whether the device is currently in landscape orientation */
    isInLandscapeMode: boolean;

    /** Gesture handler for tap-to-focus */
    tapGesture: GestureType;

    /** Animated style driving the focus indicator ring */
    cameraFocusIndicatorAnimatedStyle: AnimatedStyle<ViewStyle>;

    /** Animated style for the post-capture blink overlay */
    blinkStyle: AnimatedStyle<ViewStyle>;

    /** Whether the attachment picker modal is currently open */
    isAttachmentPickerActive: boolean;

    /** Whether a photo has been captured (forces camera inactive) */
    didCapturePhoto: boolean;

    /** Callback fired when the camera finishes initializing */
    onInitialized: () => void;

    /** Whether the multi-scan feature is available */
    canUseMultiScan: boolean;

    /** Current camera permission status; used to disable the flash button until granted */
    cameraPermissionStatus: PermissionStatus | null;

    /** Whether the camera flash is currently on */
    flash: boolean;

    /** Whether the camera device supports flash */
    hasFlash: boolean;

    /** Updater function to toggle flash state */
    setFlash: (updater: (prev: boolean) => boolean) => void;
};

function CameraViewport({
    camera,
    device,
    format,
    fps,
    cameraAspectRatio,
    isInLandscapeMode,
    tapGesture,
    cameraFocusIndicatorAnimatedStyle,
    blinkStyle,
    isAttachmentPickerActive,
    didCapturePhoto,
    onInitialized,
    canUseMultiScan,
    cameraPermissionStatus,
    flash,
    hasFlash,
    setFlash,
}: CameraViewportProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt']);

    return (
        <View style={[styles.cameraView, styles.alignItemsCenter]}>
            <GestureDetector gesture={tapGesture}>
                <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio, isInLandscapeMode)}>
                    <NavigationAwareCamera
                        ref={camera}
                        device={device}
                        format={format}
                        fps={fps}
                        style={styles.flex1}
                        zoom={device.neutralZoom}
                        photo
                        cameraTabIndex={1}
                        forceInactive={isAttachmentPickerActive || didCapturePhoto}
                        onInitialized={onInitialized}
                        // Use TextureView on Android to fix partially blank images for takeSnapshot()
                        androidPreviewViewType="texture-view"
                    />
                    <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                    <Animated.View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFill, StyleUtils.getBackgroundColorStyle(theme.appBG), blinkStyle, styles.zIndex10]}
                    />
                </View>
            </GestureDetector>
            {canUseMultiScan ? (
                <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                        disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                    >
                        <Icon
                            height={variables.iconSizeSmall}
                            width={variables.iconSizeSmall}
                            src={lazyIcons.Bolt}
                            fill={flash ? theme.white : theme.icon}
                        />
                    </PressableWithFeedback>
                </View>
            ) : null}
        </View>
    );
}

export default CameraViewport;
