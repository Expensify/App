import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import {PanResponder, View} from 'react-native';
import type {LayoutRectangle} from 'react-native';
import type Webcam from 'react-webcam';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import {useDragAndDropState} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobile, isMobileWebKit} from '@libs/Browser';
import {base64ToFile} from '@libs/fileDownload/FileUtils';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {cropImageToAspectRatio} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/NavigationAwareCamera/WebCamera';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import variables from '@styles/variables';
import {setMoneyRequestOdometerImage} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type IOURequestStepOdometerImageProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ODOMETER_IMAGE>;

function IOURequestStepOdometerImage({
    route: {
        params: {action, iouType, transactionID, reportID, backToReport, imageType, isEditingConfirmation},
    },
}: IOURequestStepOdometerImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isDraggingOver} = useDragAndDropState();
    const actionValue: IOUAction = action ?? CONST.IOU.ACTION.CREATE;
    const iouTypeValue: IOUType = iouType ?? CONST.IOU.TYPE.REQUEST;
    const isTransactionDraft = shouldUseTransactionDraft(actionValue, iouTypeValue);
    const dropBlobUrlsRef = useRef<string[]>([]);
    const shouldRevokeOnUnmountRef = useRef(true);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout because drag and drop is not supported on mobile.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [cameraPermissionState, setCameraPermissionState] = useState<PermissionState | undefined>('prompt');
    const [isFlashLightOn, toggleFlashlight] = useReducer((state) => !state, false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const cameraRef = useRef<Webcam>(null);
    const trackRef = useRef<MediaStreamTrack | null>(null);
    const [isQueriedPermissionState, setIsQueriedPermissionState] = useState(false);
    const getScreenshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints>();
    const isTabActive = useIsFocused();

    const lazyIcons = useMemoizedLazyExpensifyIcons(['OdometerStart', 'OdometerEnd', 'Bolt', 'Gallery']);
    const lazyIllustrations = useMemoizedLazyIllustrations(['Hand', 'Shutter']);
    const title = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    const message = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.startMessageWeb') : translate('distance.odometer.endMessageWeb');
    const snapPhotoText = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.snapPhotoStart') : translate('distance.odometer.snapPhotoEnd');
    const icon = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? lazyIcons.OdometerStart : lazyIcons.OdometerEnd;
    const messageHTML = `<centered-text><muted-text-label>${message}</muted-text-label></centered-text>`;

    const goBackRoute = isEditingConfirmation
        ? ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action, iouType, transactionID, reportID)
        : ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.getRoute(action, iouType, transactionID, reportID, backToReport);

    const navigateBack = () => {
        Navigation.goBack(goBackRoute);
    };

    const handleImageSelected = (file: FileObject) => {
        setMoneyRequestOdometerImage(transactionID, imageType, file as File, isTransactionDraft);
        shouldRevokeOnUnmountRef.current = false;
        navigateBack();
    };

    const {validateFiles, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }
        const file = files.at(0);
        if (!file) {
            return;
        }
        // For file selection, source is the blob URL
        handleImageSelected(file);
    });

    /**
     * On phones that have ultra-wide lens, react-webcam uses ultra-wide by default.
     * The last deviceId is of regular len camera.
     */
    const requestCameraPermission = useCallback(() => {
        if (!isMobile()) {
            return;
        }

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
                        setVideoConstraints({deviceId});
                        return;
                    }
                }
                if (!navigator.mediaDevices.enumerateDevices) {
                    setVideoConstraints(defaultConstraints);
                    return;
                }
                navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices) => {
                        let lastBackDeviceId = '';
                        for (let i = devices.length - 1; i >= 0; i--) {
                            const device = devices.at(i);
                            if (device?.kind === 'videoinput') {
                                lastBackDeviceId = device.deviceId;
                                break;
                            }
                        }
                        if (!lastBackDeviceId) {
                            setVideoConstraints(defaultConstraints);
                            return;
                        }
                        setVideoConstraints({deviceId: lastBackDeviceId});
                    })
                    .catch(() => {
                        setVideoConstraints(defaultConstraints);
                    });
            })
            .catch(() => {
                setVideoConstraints(defaultConstraints);
                setCameraPermissionState('denied');
            });
    }, []);

    useEffect(() => {
        if (!isMobile() || !isTabActive) {
            return;
        }
        navigator.permissions
            .query({
                name: 'camera',
            })
            .then((permissionState) => {
                setCameraPermissionState(permissionState.state);
                if (permissionState.state === 'granted') {
                    requestCameraPermission();
                }
            })
            .catch(() => {
                setCameraPermissionState('denied');
            })
            .finally(() => {
                setIsQueriedPermissionState(true);
            });
        return () => {
            setVideoConstraints(undefined);
        };
    }, [isTabActive, requestCameraPermission]);

    const setupCameraPermissionsAndCapabilities = (stream: MediaStream) => {
        setCameraPermissionState('granted');

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();

        if ('torch' in capabilities && capabilities.torch) {
            trackRef.current = track;
        }
        setIsTorchAvailable('torch' in capabilities && !!capabilities.torch);
    };

    const viewfinderLayout = useRef<LayoutRectangle>(null);

    const getScreenshot = () => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        const imageBase64 = cameraRef.current.getScreenshot();

        if (imageBase64 === null) {
            return;
        }

        const originalFileName = `receipt_${Date.now()}.png`;
        const originalFile = base64ToFile(imageBase64 ?? '', originalFileName);
        const imageObject: ImageObject = {file: originalFile, filename: originalFile.name, source: URL.createObjectURL(originalFile)};
        // Some browsers center-crop the viewfinder inside the video element (due to object-position: center),
        // while other browsers let the video element overflow and the container crops it from the top.
        // We crop and algin the result image the same way.
        const videoHeight = cameraRef.current.video?.getBoundingClientRect?.()?.height ?? NaN;
        const viewFinderHeight = viewfinderLayout.current?.height ?? NaN;
        const shouldAlignTop = videoHeight > viewFinderHeight;
        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, shouldAlignTop)
            .then(({source}) => {
                if (source !== imageObject.source) {
                    URL.revokeObjectURL(imageObject.source);
                }
                setMoneyRequestOdometerImage(transactionID, imageType, source, isTransactionDraft);
                navigateBack();
            })
            .catch((error: unknown) => {
                Log.warn('Error cropping photo', error instanceof Error ? error.message : String(error));
            });
    };

    const clearTorchConstraints = () => {
        if (!trackRef.current) {
            return;
        }
        trackRef.current.applyConstraints({
            advanced: [{torch: false}],
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

    useEffect(
        () => () => {
            if (!getScreenshotTimeoutRef.current) {
                return;
            }
            clearTimeout(getScreenshotTimeoutRef.current);
        },
        [],
    );

    const mobileCameraView = () => (
        <>
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
                            <Text style={[styles.subTextFileUpload]}>{translate('distance.odometer.cameraAccessRequired')}</Text>
                        )}
                        <Button
                            success
                            text={translate('common.continue')}
                            accessibilityLabel={translate('common.continue')}
                            style={[styles.p9, styles.pt5]}
                            onPress={capturePhoto}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.CONTINUE_BUTTON}
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
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.FLASH}
                            >
                                <Icon
                                    height={variables.iconSizeSmall}
                                    width={variables.iconSizeSmall}
                                    src={lazyIcons.Bolt}
                                    fill={isFlashLightOn ? theme.white : theme.icon}
                                />
                            </PressableWithFeedback>
                        </View>
                        <View style={[styles.odometerPhotoInformationContainer]}>
                            <Icon
                                height={variables.menuIconSize}
                                width={variables.menuIconSize}
                                src={icon}
                            />
                            <View style={[styles.flex1, styles.flexColumn]}>
                                <Text style={[styles.labelStrong, styles.mb1]}>{title}</Text>
                                <RenderHTML html={snapPhotoText} />
                            </View>
                        </View>
                    </View>
                )}
            </View>

            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                <AttachmentPicker type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}>
                    {({openPicker}) => (
                        <PressableWithFeedback
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.chooseFile')}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.CHOOSE_FILE}
                            onPress={() => {
                                openPicker({
                                    onPicked: (data) => validateFiles(data),
                                });
                            }}
                        >
                            <Icon
                                height={variables.iconSizeMenuItem}
                                width={variables.iconSizeMenuItem}
                                src={lazyIcons.Gallery}
                                fill={theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    )}
                </AttachmentPicker>
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.shutter')}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.SHUTTER}
                    style={[styles.alignItemsCenter]}
                    onPress={capturePhoto}
                >
                    <Icon
                        src={lazyIllustrations.Shutter}
                        width={CONST.RECEIPT.SHUTTER_SIZE}
                        height={CONST.RECEIPT.SHUTTER_SIZE}
                    />
                </PressableWithFeedback>
                {/* Empty View matching gallery size so justifyContentAround keeps the shutter exactly centered - it's the simplest solution */}
                <View style={{width: variables.iconSizeMenuItem, height: variables.iconSizeMenuItem}} />
            </View>
        </>
    );

    const revokeDropBlobUrls = useCallback(() => {
        for (const url of dropBlobUrlsRef.current) {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        }
        dropBlobUrlsRef.current = [];
    }, []);

    const handleDrop = (event: DragEvent) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => CONST.FILE_TYPE_REGEX.IMAGE.test(file.name));
        if (files.length === 0) {
            return;
        }
        revokeDropBlobUrls();
        const blobUrls: string[] = [];
        for (const file of files) {
            const blobUrl = URL.createObjectURL(file);
            blobUrls.push(blobUrl);
            // eslint-disable-next-line no-param-reassign
            file.uri = blobUrl;
        }
        dropBlobUrlsRef.current = blobUrls;
        validateFiles(files as FileObject[], Array.from(event.dataTransfer?.items ?? []));
    };

    useEffect(() => {
        return () => {
            if (!shouldRevokeOnUnmountRef.current) {
                return;
            }
            revokeDropBlobUrls();
        };
    }, [revokeDropBlobUrls]);

    const panResponder = useRef(
        PanResponder.create({
            onPanResponderTerminationRequest: () => false,
        }),
    ).current;

    const desktopUploadView = () => (
        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.flex1, styles.ph11]}>
            <Icon
                src={icon}
                width={variables.iconSection}
                height={variables.iconSection}
                additionalStyles={[styles.mb5]}
            />
            <View
                style={[styles.uploadFileViewTextContainer, styles.userSelectNone]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...panResponder.panHandlers}
            >
                <Text style={[styles.textFileUpload, styles.mb2]}>{title}</Text>
                <View style={styles.renderHTML}>
                    <RenderHTML html={messageHTML} />
                </View>
            </View>
            <AttachmentPicker type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}>
                {({openPicker}) => (
                    <Button
                        success
                        text={translate('common.chooseFile')}
                        accessibilityLabel={translate('common.chooseFile')}
                        style={[styles.p5, styles.mt4]}
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => validateFiles(data),
                            });
                        }}
                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.ODOMETER_CHOOSE_FILE_BUTTON}
                    />
                )}
            </AttachmentPicker>
        </View>
    );

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={title}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepOdometerImage"
        >
            {(isDraggingOverWrapper) => (
                <View style={[styles.flex1, !isMobile() && styles.chooseFilesView(isSmallScreenWidth)]}>
                    <View style={[styles.flex1, !isMobile() && styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!(isDraggingOver ?? isDraggingOverWrapper) && (isMobile() ? mobileCameraView() : desktopUploadView())}
                    </View>
                    <DragAndDropConsumer onDrop={handleDrop}>
                        <DropZoneUI
                            icon={icon}
                            iconWidth={variables.iconSection}
                            iconHeight={variables.iconSection}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTitle={title}
                            dropTextStyles={styles.receiptDropText}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                </View>
            )}
        </StepScreenDragAndDropWrapper>
    );
}

IOURequestStepOdometerImage.displayName = 'IOURequestStepOdometerImage';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepOdometerImageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepOdometerImage);

export default IOURequestStepOdometerImageWithFullTransactionOrNotFound;
