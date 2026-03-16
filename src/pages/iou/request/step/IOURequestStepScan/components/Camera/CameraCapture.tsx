import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useReducer, useRef, useState} from 'react';
import type {LayoutRectangle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import type Webcam from 'react-webcam';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileWebKit} from '@libs/Browser';
import {base64ToFile} from '@libs/fileDownload/FileUtils';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/components/NavigationAwareCamera/WebCamera';
import {cropImageToAspectRatio} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CameraProps} from './types';

/**
 * Preload camera permission state at module load so first render can use a cached value.
 */
let cachedPermissionState: PermissionState | undefined;

if (typeof navigator !== 'undefined' && navigator.permissions) {
    navigator.permissions
        .query({name: 'camera'})
        .then((status) => {
            cachedPermissionState = status.state;
            if ('addEventListener' in status) {
                status.addEventListener('change', () => {
                    cachedPermissionState = status.state;
                });
            }
        })
        .catch(() => {
            cachedPermissionState = 'denied';
        });
}

function queryCameraPermission(): Promise<PermissionState> {
    if (cachedPermissionState !== undefined) {
        return Promise.resolve(cachedPermissionState);
    }

    if (typeof navigator === 'undefined' || !navigator.permissions) {
        return Promise.resolve('denied');
    }

    return navigator.permissions
        .query({name: 'camera'})
        .then((status) => status.state)
        .catch(() => 'denied');
}

const BLINK_DURATION_MS = 80;

/**
 * CameraCapture — mobile web capture variant.
 * Renders a camera viewfinder, shutter button, flash toggle and gallery picker.
 * Calls `onCapture(file, source)` for each photo taken or file picked from the gallery.
 */
function CameraCapture({onCapture, shouldAcceptMultipleFiles = false, onLayout}: CameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['Hand', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'boltSlash']);
    const isTabActive = useIsFocused();
    const [cameraPermissionState, setCameraPermissionState] = useState<PermissionState | undefined>(() => cachedPermissionState ?? 'prompt');
    const [isFlashLightOn, toggleFlashlight] = useReducer((state: boolean) => !state, false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const [isQueriedPermissionState, setIsQueriedPermissionState] = useState(() => cachedPermissionState !== undefined);
    const [deviceConstraints, setDeviceConstraints] = useState<MediaTrackConstraints>();
    const videoConstraints = isTabActive ? deviceConstraints : undefined;
    const cameraRef = useRef<Webcam>(null);
    const trackRef = useRef<MediaStreamTrack | null>(null);
    const viewfinderLayout = useRef<LayoutRectangle>(null);
    const getScreenshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Blink animation for shutter feedback
    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = () => {
        blinkOpacity.set(withSequence(withTiming(1, {duration: BLINK_DURATION_MS}), withTiming(0, {duration: BLINK_DURATION_MS})));
    };

    /**
     * On phones that have ultra-wide lens, react-webcam uses ultra-wide by default.
     * The last deviceId is of regular lens camera.
     */
    const requestCameraPermission = () => {
        const defaultConstraints = {facingMode: {exact: 'environment'}};
        navigator.mediaDevices
            .getUserMedia({video: {facingMode: {exact: 'environment'}, zoom: {ideal: 1}}})
            .then((stream) => {
                setCameraPermissionState('granted');
                for (const track of stream.getTracks()) {
                    track.stop();
                }
                // Only Safari 17+ supports zoom constraint
                if (isMobileWebKit() && stream.getTracks().length > 0) {
                    let deviceId;
                    for (const track of stream.getTracks()) {
                        const setting = track.getSettings();
                        if (setting.zoom === 1) {
                            deviceId = setting.deviceId;
                            break;
                        }
                    }
                    if (deviceId) {
                        setDeviceConstraints({deviceId});
                        return;
                    }
                }
                if (!navigator.mediaDevices.enumerateDevices) {
                    setDeviceConstraints(defaultConstraints);
                    return;
                }
                navigator.mediaDevices.enumerateDevices().then((devices) => {
                    let lastBackDeviceId = '';
                    for (let i = devices.length - 1; i >= 0; i--) {
                        const device = devices.at(i);
                        if (device?.kind === 'videoinput') {
                            lastBackDeviceId = device.deviceId;
                            break;
                        }
                    }
                    if (!lastBackDeviceId) {
                        setDeviceConstraints(defaultConstraints);
                        return;
                    }
                    setDeviceConstraints({deviceId: lastBackDeviceId});
                });
            })
            .catch(() => {
                setDeviceConstraints(defaultConstraints);
                setCameraPermissionState('denied');
            });
    };

    useEffect(() => {
        if (!isTabActive) {
            return;
        }
        queryCameraPermission()
            .then((state) => {
                setCameraPermissionState(state);
                if (state === 'granted') {
                    requestCameraPermission();
                }
            })
            .catch(() => {
                setCameraPermissionState('denied');
            })
            .finally(() => {
                setIsQueriedPermissionState(true);
            });
        // Refresh permission state whenever this tab regains focus.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTabActive]);

    useEffect(
        () => () => {
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            if (!getScreenshotTimeoutRef.current) {
                return;
            }
            clearTimeout(getScreenshotTimeoutRef.current);
        },
        [],
    );

    const setupCameraPermissionsAndCapabilities = (stream: MediaStream) => {
        setCameraPermissionState('granted');

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();

        if ('torch' in capabilities && capabilities.torch) {
            trackRef.current = track;
        }
        setIsTorchAvailable('torch' in capabilities && !!capabilities.torch);
    };

    const clearTorchConstraints = () => {
        if (!trackRef.current) {
            return;
        }
        trackRef.current.applyConstraints({
            advanced: [{torch: false}],
        });
    };

    const getScreenshot = () => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
            name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
            op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'web'},
        });
        startSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'web'},
        });

        const imageBase64 = cameraRef.current.getScreenshot();

        if (imageBase64 === null) {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            return;
        }

        showBlink();

        const originalFileName = `receipt_${Date.now()}.png`;
        const originalFile = base64ToFile(imageBase64 ?? '', originalFileName);
        const imageObject: ImageObject = {file: originalFile, filename: originalFile.name, source: URL.createObjectURL(originalFile)};
        // Some browsers center-crop the viewfinder inside the video element (due to object-position: center),
        // while other browsers let the video element overflow and the container crops it from the top.
        // We crop and align the result image the same way.
        const videoHeight = cameraRef.current.video?.getBoundingClientRect?.()?.height ?? NaN;
        const viewFinderHeight = viewfinderLayout.current?.height ?? NaN;
        const shouldAlignTop = videoHeight > viewFinderHeight;
        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, shouldAlignTop).then(({file, source}) => {
            endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            onCapture(file, source);
        });
    };

    const capturePhoto = () => {
        if (trackRef.current && isFlashLightOn) {
            trackRef.current
                .applyConstraints({
                    advanced: [{torch: true}],
                })
                .then(() => {
                    getScreenshotTimeoutRef.current = setTimeout(() => {
                        getScreenshot();
                        clearTorchConstraints();
                    }, CONST.RECEIPT.FLASH_DELAY_MS);
                });
            return;
        }

        getScreenshot();
    };

    const emitPickedFiles = (files: FileObject[]) => {
        for (const file of files) {
            const source = file.uri ?? URL.createObjectURL(file as Blob);
            onCapture(file, source);
        }
    };

    return (
        <View
            onLayout={() => onLayout?.()}
            style={[styles.flex1]}
        >
            <View style={[styles.flex1, styles.justifyContentCenter]}>
                <View style={[styles.cameraView]}>
                    {((cameraPermissionState === 'prompt' && !isQueriedPermissionState) || (cameraPermissionState === 'granted' && isEmptyObject(videoConstraints))) && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            color={theme.textSupporting}
                        />
                    )}
                    {cameraPermissionState !== 'granted' && isQueriedPermissionState && (
                        <View style={[styles.flex1, styles.permissionView, styles.userSelectNone]}>
                            <Icon
                                src={lazyIllustrations.Hand}
                                width={CONST.RECEIPT.HAND_ICON_WIDTH}
                                height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                                additionalStyles={[styles.pb5]}
                            />
                            <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                            {cameraPermissionState === 'denied' ? (
                                <Text style={[styles.subTextFileUpload]}>
                                    <RenderHTML html={translate('receipt.deniedCameraAccess')} />
                                </Text>
                            ) : (
                                <Text style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text>
                            )}
                            <Button
                                success
                                text={translate('common.continue')}
                                accessibilityLabel={translate('common.continue')}
                                style={[styles.p9, styles.pt5]}
                                onPress={capturePhoto}
                                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_SUBMIT_BUTTON}
                            />
                        </View>
                    )}
                    {cameraPermissionState === 'granted' && !isEmptyObject(videoConstraints) && (
                        <View
                            style={styles.flex1}
                            onLayout={(e) => (viewfinderLayout.current = e.nativeEvent.layout)}
                        >
                            <NavigationAwareCamera
                                onUserMedia={setupCameraPermissionsAndCapabilities}
                                onUserMediaError={() => setCameraPermissionState('denied')}
                                style={{
                                    ...styles.videoContainer,
                                    display: cameraPermissionState !== 'granted' ? 'none' : 'block',
                                }}
                                ref={cameraRef}
                                screenshotFormat="image/png"
                                videoConstraints={videoConstraints}
                                forceScreenshotSourceSize
                                audio={false}
                                disablePictureInPicture={false}
                                imageSmoothing={false}
                                mirrored={false}
                                screenshotQuality={0}
                            />
                            <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, isFlashLightOn && styles.bgGreenSuccess, !isTorchAvailable && styles.opacity0]}>
                                <PressableWithFeedback
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={translate('receipt.flash')}
                                    disabled={!isTorchAvailable}
                                    onPress={toggleFlashlight}
                                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                                >
                                    <Icon
                                        height={16}
                                        width={16}
                                        src={lazyIcons.Bolt}
                                        fill={isFlashLightOn ? theme.white : theme.icon}
                                    />
                                </PressableWithFeedback>
                            </View>
                            <Animated.View
                                pointerEvents="none"
                                style={[StyleSheet.absoluteFillObject, styles.backgroundWhite, blinkStyle, styles.zIndex10]}
                            />
                        </View>
                    )}
                </View>

                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    <AttachmentPicker
                        acceptedFileTypes={[...CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS]}
                        allowMultiple={shouldAcceptMultipleFiles}
                    >
                        {({openPicker}) => (
                            <PressableWithFeedback
                                accessibilityLabel={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                                role={CONST.ROLE.BUTTON}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => emitPickedFiles(data),
                                    });
                                }}
                                sentryLabel={shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE}
                            >
                                <Icon
                                    height={32}
                                    width={32}
                                    src={lazyIcons.Gallery}
                                    fill={theme.textSupporting}
                                />
                            </PressableWithFeedback>
                        )}
                    </AttachmentPicker>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.shutter')}
                        style={[styles.alignItemsCenter]}
                        onPress={capturePhoto}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.SHUTTER}
                    >
                        <Icon
                            src={lazyIllustrations.Shutter}
                            width={CONST.RECEIPT.SHUTTER_SIZE}
                            height={CONST.RECEIPT.SHUTTER_SIZE}
                        />
                    </PressableWithFeedback>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        style={[styles.alignItemsEnd, !isTorchAvailable && styles.opacity0]}
                        onPress={toggleFlashlight}
                        disabled={!isTorchAvailable}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                    >
                        <Icon
                            height={32}
                            width={32}
                            src={isFlashLightOn ? lazyIcons.Bolt : lazyIcons.boltSlash}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>
                </View>
            </View>
        </View>
    );
}

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;
