import React, {useRef} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import type {LayoutRectangle} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import type {PhotoFile} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useFilesValidation from '@hooks/useFilesValidation';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNativeCamera from '@hooks/useNativeCamera';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestOdometerImage} from '@libs/actions/OdometerTransactionUtils';
import {getMimeTypeFromUri} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import moveReceiptToDurableStorage from '@libs/moveReceiptToDurableStorage';
import Navigation from '@libs/Navigation/Navigation';
import {getOdometerImageUri} from '@libs/OdometerImageUtils';
import {cancelSpan, endSpan, startSpan} from '@libs/telemetry/activeSpans';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/components/NavigationAwareCamera/Camera';
import {cropImageToAspectRatio} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';

type IOURequestStepOdometerImageProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ODOMETER_IMAGE>;

function IOURequestStepOdometerImage({
    route: {
        params: {action, iouType, transactionID, reportID, backToReport, imageType, isEditingConfirmation},
    },
    transaction,
}: IOURequestStepOdometerImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'boltSlash', 'OdometerStart', 'OdometerEnd']);
    const lazyIllustrationsOnly = useMemoizedLazyIllustrations(['Hand', 'Shutter']);

    const viewfinderLayout = useRef<LayoutRectangle>(null);
    const isTransactionDraft = shouldUseTransactionDraft(action ?? CONST.IOU.ACTION.CREATE, iouType ?? CONST.IOU.TYPE.REQUEST);

    const isInLandscapeMode = useIsInLandscapeMode();

    const {
        camera,
        device,
        cameraPermissionStatus,
        flash,
        setFlash,
        hasFlash,
        didCapturePhoto,
        setDidCapturePhoto,
        isAttachmentPickerActive,
        setIsAttachmentPickerActive,
        isPlatformMuted,
        askForPermissions,
        tapGesture,
        cameraFocusIndicatorAnimatedStyle,
        cameraLoadingReasonAttributes,
    } = useNativeCamera({
        context: 'IOURequestStepOdometerImage',
        onFocusCleanup: () => {
            cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
        },
    });
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const title = imageType === 'start' ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    const snapPhotoText = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.snapPhotoStart') : translate('distance.odometer.snapPhotoEnd');
    const icon = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? lazyIcons.OdometerStart : lazyIcons.OdometerEnd;

    const goBackRoute =
        isEditingConfirmation === 'true'
            ? ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action, iouType, transactionID, reportID)
            : ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.getRoute(action, iouType, transactionID, reportID, backToReport);

    const navigateBack = () => {
        Navigation.goBack(goBackRoute);
    };

    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const handleImageSelected = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }

        const file = files.at(0);
        if (!file) {
            return;
        }
        setMoneyRequestOdometerImage(transaction, imageType, getOdometerImageUri(file), isTransactionDraft, false);
        navigateBack();
    };

    const {validateFiles, ErrorModal} = useFilesValidation(handleImageSelected);

    const capturePhoto = () => {
        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            showCameraAlert();
            return;
        }

        if (didCapturePhoto) {
            return;
        }

        setDidCapturePhoto(true);

        startSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE,
            op: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_ODOMETER_IMAGE_TYPE]: imageType,
                [CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native',
            },
        });

        const path = getReceiptsUploadFolderPath();

        ReactNativeBlobUtil.fs
            .isDir(path)
            .then((isDir) => {
                if (isDir) {
                    return;
                }

                ReactNativeBlobUtil.fs.mkdir(path).catch((error: string) => {
                    Log.warn('Error creating the directory', error);
                });
            })
            .catch((error: string) => {
                Log.warn('Error checking if the directory exists', error);
            })
            .then(() => {
                camera?.current
                    ?.takePhoto({
                        flash: flash && hasFlash ? 'on' : 'off',
                        enableShutterSound: !isPlatformMuted,
                        path,
                    })
                    .then((photo: PhotoFile) => {
                        const imageObject: ImageObject = {file: photo, filename: photo.path, source: getPhotoSource(photo.path)};
                        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, undefined, photo.orientation)
                            .then(({file, filename, source}) => moveReceiptToDurableStorage(source, filename).then((durableSource) => ({file, filename, source: durableSource})))
                            .then(({file, filename, source}) => {
                                setMoneyRequestOdometerImage(
                                    transaction,
                                    imageType,
                                    {
                                        uri: source,
                                        name: filename,
                                        type: (file as FileObject | undefined)?.type ?? getMimeTypeFromUri(source) ?? 'image/jpeg',
                                        size: (file as FileObject | undefined)?.size,
                                    },
                                    isTransactionDraft,
                                    false,
                                );
                                endSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
                                navigateBack();
                            })
                            .catch((error: unknown) => {
                                cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
                                setDidCapturePhoto(false);
                                showCameraAlert();
                                Log.warn('Error cropping photo', error instanceof Error ? error.message : String(error));
                            });
                    })
                    .catch((error: unknown) => {
                        cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
                        setDidCapturePhoto(false);
                        showCameraAlert();
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        Log.warn('Error taking photo', errorMessage);
                    });
            });
    };

    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }

    return (
        <StepScreenWrapper
            includeSafeAreaPaddingBottom
            headerTitle={title}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepOdometerImage"
        >
            <View style={styles.flex1}>
                {cameraPermissionStatus !== RESULTS.GRANTED && (
                    <ScrollView contentContainerStyle={styles.flexGrow1}>
                        <View style={[styles.cameraView, isInLandscapeMode ? styles.permissionViewLandscape : styles.permissionView, styles.userSelectNone]}>
                            <ImageSVG
                                contentFit="contain"
                                src={lazyIllustrationsOnly.Hand}
                                width={CONST.RECEIPT.HAND_ICON_WIDTH}
                                height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                                style={styles.pb5}
                            />

                            <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                            <Text style={[styles.subTextFileUpload]}>{translate('distance.odometer.cameraAccessRequired')}</Text>
                            <Button
                                success
                                text={translate('common.continue')}
                                accessibilityLabel={translate('common.continue')}
                                style={[styles.p9, styles.pt5]}
                                onPress={capturePhoto}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.CONTINUE_BUTTON}
                            />
                        </View>
                    </ScrollView>
                )}
                {cameraPermissionStatus === RESULTS.GRANTED && device == null && (
                    <View style={[styles.cameraView]}>
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            color={theme.textSupporting}
                            reasonAttributes={cameraLoadingReasonAttributes}
                        />
                    </View>
                )}
                {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                    <View style={[styles.cameraView]}>
                        <GestureDetector gesture={tapGesture}>
                            <View style={styles.flex1}>
                                <NavigationAwareCamera
                                    ref={camera}
                                    device={device}
                                    style={styles.flex1}
                                    zoom={device.neutralZoom}
                                    photo
                                    cameraTabIndex={1}
                                    onLayout={(e) => (viewfinderLayout.current = e.nativeEvent.layout)}
                                    forceInactive={isAttachmentPickerActive}
                                />
                                <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                                    <PressableWithFeedback
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={translate('receipt.flash')}
                                        disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.FLASH}
                                    >
                                        <Icon
                                            height={variables.iconSizeSmall}
                                            width={variables.iconSizeSmall}
                                            src={lazyIcons.Bolt}
                                            fill={flash ? theme.white : theme.icon}
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
                                <Animated.View
                                    pointerEvents="none"
                                    style={[StyleSheet.absoluteFill, styles.backgroundWhite, blinkStyle, styles.zIndex10]}
                                />
                                <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                            </View>
                        </GestureDetector>
                    </View>
                )}
                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    <AttachmentPicker
                        onOpenPicker={() => {
                            setIsAttachmentPickerActive(true);
                            setIsLoaderVisible(true);
                        }}
                        fileLimit={1}
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => (
                            <PressableWithFeedback
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.gallery')}
                                style={[styles.alignItemsStart]}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.GALLERY}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => validateFiles(data),
                                        onCanceled: () => setIsLoaderVisible(false),
                                        // makes sure the loader is not visible anymore e.g. when there is an error while uploading a file
                                        onClosed: () => {
                                            setIsAttachmentPickerActive(false);
                                            setIsLoaderVisible(false);
                                        },
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
                        style={[styles.alignItemsCenter]}
                        onPress={capturePhoto}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.SHUTTER}
                    >
                        <ImageSVG
                            contentFit="contain"
                            src={lazyIllustrationsOnly.Shutter}
                            width={CONST.RECEIPT.SHUTTER_SIZE}
                            height={CONST.RECEIPT.SHUTTER_SIZE}
                        />
                    </PressableWithFeedback>
                    {/* Empty View matching gallery size so justifyContentAround keeps the shutter exactly centered - it's the simplest solution */}
                    <View style={{width: variables.iconSizeMenuItem, height: variables.iconSizeMenuItem}} />
                </View>
                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

IOURequestStepOdometerImage.displayName = 'IOURequestStepOdometerImage';

// eslint-disable-next-line rulesdir/no-negated-variables -- withFullTransactionOrNotFound HOC requires this pattern
const IOURequestStepOdometerImageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepOdometerImage);

export default IOURequestStepOdometerImageWithFullTransactionOrNotFound;
