import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getZoomProp} from '@libs/cameraCapture/getWideLensZoom';
import Log from '@libs/Log';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode, RefObject} from 'react';
import type {LayoutChangeEvent, ViewStyle} from 'react-native';
import type {GestureType} from 'react-native-gesture-handler';
import type {PermissionStatus} from 'react-native-permissions';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {CameraDevice, CameraOutput, CameraRef, CameraSessionConfig, Constraint} from 'react-native-vision-camera';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated from 'react-native-reanimated';

import NavigationAwareCamera from './NavigationAwareCamera/Camera';

type CameraViewportProps = {
    /** Ref to the underlying Camera instance */
    camera: RefObject<CameraRef | null>;

    /** The active camera device descriptor */
    device: CameraDevice;

    outputs: CameraOutput[];

    constraints?: Constraint[];

    /** Aspect ratio used to size the camera viewfinder */
    cameraAspectRatio: number | undefined;

    /** Whether the device is currently in landscape orientation */
    isInLandscapeMode: boolean;

    /** Whether a portrait viewfinder should overflow the container to fill the screen (cropping the preview) */
    shouldFillPortraitViewport?: boolean;

    /** Gesture handler for tap-to-focus */
    tapGesture: GestureType;

    /** Animated style driving the focus indicator ring */
    cameraFocusIndicatorAnimatedStyle: AnimatedStyle<ViewStyle>;

    /** Animated style for the post-capture blink overlay */
    blinkStyle: AnimatedStyle<ViewStyle>;

    /** Whether the attachment picker modal is currently open */
    isAttachmentPickerActive: boolean;

    /** Whether a photo has been captured (forces camera inactive) */
    didCapturePhoto?: boolean;

    onConfigured?: () => void;

    onStarted?: () => void;

    onSessionConfigSelected?: (config: CameraSessionConfig) => void;

    /** Callback fired when the camera preview is laid out */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Whether the flash button is rendered on top of the viewfinder */
    shouldShowFlashButton: boolean;

    /** Sentry label for the flash button */
    flashSentryLabel?: string;

    /** Current camera permission status; used to disable the flash button until granted */
    cameraPermissionStatus: PermissionStatus | null;

    flash: boolean;

    /** Whether the camera device supports flash */
    hasFlash: boolean;

    setFlash: (updater: (prev: boolean) => boolean) => void;

    /** Extra content rendered below the viewfinder, inside the camera view */
    children?: ReactNode;
};

function CameraViewport({
    camera,
    device,
    outputs,
    constraints,
    cameraAspectRatio,
    isInLandscapeMode,
    shouldFillPortraitViewport = true,
    tapGesture,
    cameraFocusIndicatorAnimatedStyle,
    blinkStyle,
    isAttachmentPickerActive,
    didCapturePhoto = false,
    onConfigured,
    onStarted,
    onSessionConfigSelected,
    onLayout,
    shouldShowFlashButton,
    flashSentryLabel = CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH,
    cameraPermissionStatus,
    flash,
    hasFlash,
    setFlash,
    children,
}: CameraViewportProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt']);

    return (
        <View style={[styles.cameraView, styles.alignItemsCenter]}>
            <GestureDetector gesture={tapGesture}>
                <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio, isInLandscapeMode, shouldFillPortraitViewport)}>
                    <NavigationAwareCamera
                        ref={camera}
                        device={device}
                        outputs={outputs}
                        constraints={constraints}
                        style={styles.flex1}
                        zoom={getZoomProp(device)}
                        cameraTabIndex={1}
                        forceInactive={isAttachmentPickerActive || didCapturePhoto}
                        onConfigured={onConfigured}
                        onStarted={onStarted}
                        onSessionConfigSelected={onSessionConfigSelected}
                        // VisionCamera's default handler is console.error, which pops LogBox over the camera.
                        onError={(error) => Log.warn('[Camera] VisionCamera error', {code: error.message.split('\n').at(0)?.trim(), message: error.message})}
                        onLayout={onLayout}
                        // With 'device', a phone held flat keeps its last landscape reading and the photo is saved
                        // rotated. Following the UI also matches v4, whose snapshots took the preview's orientation.
                        orientationSource="interface"
                        implementationMode="compatible"
                    />
                    <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                    <Animated.View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFill, StyleUtils.getBackgroundColorStyle(theme.appBG), blinkStyle, styles.zIndex10]}
                    />
                </View>
            </GestureDetector>
            {shouldShowFlashButton ? (
                <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        sentryLabel={flashSentryLabel}
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
            {children}
        </View>
    );
}

export default CameraViewport;
