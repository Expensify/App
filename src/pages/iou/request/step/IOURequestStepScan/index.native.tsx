import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated from 'react-native-reanimated';
import type {PhotoFile} from 'react-native-vision-camera';
import {useCameraFormat} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import LocationPermissionModal from '@components/LocationPermissionModal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {pregenerateThumbnail} from '@hooks/useLocalReceiptThumbnail';
import useNativeCamera from '@hooks/useNativeCamera';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import variables from '@styles/variables';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {replaceReceipt, setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';
import captureReceipt from './captureReceipt';
import NavigationAwareCamera from './components/NavigationAwareCamera/Camera';
import ReceiptPreviews from './components/ReceiptPreviews';
import getCameraAspectRatio from './getCameraAspectRatio';
import useMobileReceiptScan from './hooks/useMobileReceiptScan';
import useReceiptScan from './hooks/useReceiptScan';
import type IOURequestStepScanProps from './types';

function IOURequestStepScan({
    report,
    route: {
        name: routeName,
        params: {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport},
    },
    transaction: initialTransaction,
    currentUserPersonalDetails,
    onLayout,
}: IOURequestStepScanProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();

    // Ref for double-tap protection (doesn't trigger re-render)
    const isCapturingPhoto = useRef(false);

    const onFocusStart = () => {
        isCapturingPhoto.current = false;
    };

    const onFocusCleanup = () => {
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
    };

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
    } = useNativeCamera({context: 'IOURequestStepScan', onFocusStart, onFocusCleanup});
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const {windowWidth, windowHeight} = useWindowDimensions();

    // Prioritize photoResolution over videoResolution so the format selector picks a 4032x3024
    // format instead of the 5712x4284 (24.5MP) format that videoResolution:'max' would select.
    // This cuts capture time roughly in half while maintaining the same output photo resolution.
    // Use screen dimensions for video resolution since we only need enough for the preview.
    const format = useCameraFormat(device, [
        {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
        {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
        {videoResolution: {width: windowHeight, height: windowWidth}},
    ]);

    // Format dimensions are in landscape orientation, so height/width gives portrait aspect ratio
    const cameraAspectRatio = getCameraAspectRatio(format, isInLandscapeMode);
    const fps = useMemo(() => (format ? Math.min(Math.max(30, format.minFps), format.maxFps) : 30), [format]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };
    const lazyIllustrations = useMemoizedLazyIllustrations(['MultiScan', 'Hand', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'boltSlash']);
    const policy = usePolicy(report?.policyID);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);

    // Track camera init telemetry
    const cameraInitSpanStarted = useRef(false);
    const cameraInitialized = useRef(false);

    // Start camera init span when permission is granted and camera is ready
    useEffect(() => {
        if (cameraInitSpanStarted.current || cameraPermissionStatus !== RESULTS.GRANTED || device == null) {
            return;
        }
        startSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT, {
            name: CONST.TELEMETRY.SPAN_CAMERA_INIT,
            op: CONST.TELEMETRY.SPAN_CAMERA_INIT,
        });
        cameraInitSpanStarted.current = true;
    }, [cameraPermissionStatus, device]);

    // Cancel spans when permission is denied/blocked/unavailable
    useEffect(() => {
        if (cameraPermissionStatus !== RESULTS.BLOCKED && cameraPermissionStatus !== RESULTS.UNAVAILABLE && cameraPermissionStatus !== RESULTS.DENIED) {
            return;
        }
        cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, [cameraPermissionStatus]);

    // Cancel spans on unmount if camera never initialized
    useEffect(() => {
        return () => {
            // If camera initialized successfully, spans were already ended
            if (cameraInitialized.current) {
                return;
            }
            // Cancel camera init span if it was started
            if (cameraInitSpanStarted.current) {
                cancelSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT);
            }
            // Always cancel the create expense span if camera never initialized
            cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        };
    }, []);

    const handleCameraInitialized = useCallback(() => {
        // Prevent duplicate span endings if callback fires multiple times
        if (cameraInitialized.current) {
            return;
        }
        cameraInitialized.current = true;
        // Only end camera init span if it was actually started
        if (cameraInitSpanStarted.current) {
            endSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT);
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);

        // Preload the confirmation screen module so its JS is parsed and ready
        // when we navigate after capture — eliminates cold-start module load cost.
        require('../IOURequestStepConfirmation');

        // Pre-create upload directory to avoid latency during capture
        const path = getReceiptsUploadFolderPath();
        ReactNativeBlobUtil.fs
            .isDir(path)
            .then((isDir) => {
                if (isDir) {
                    return;
                }
                ReactNativeBlobUtil.fs.mkdir(path).catch((error: string) => {
                    Log.warn('Error creating the receipts upload directory', error);
                });
            })
            .catch((error: string) => {
                Log.warn('Error checking if the upload directory exists', error);
            });
    }, []);

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            // Fix for the issue where the navigation state is lost after returning from device settings https://github.com/Expensify/App/issues/65992
            const navigationState = navigationRef.current?.getState();
            const reportsSplitNavigator = navigationState?.routes?.findLast((route) => route.name === 'ReportsSplitNavigator');
            const hasLostNavigationsState = reportsSplitNavigator && !reportsSplitNavigator.state;
            if (hasLostNavigationsState) {
                if (backTo) {
                    Navigation.navigate(backTo as Route);
                } else {
                    Navigation.navigate(ROUTES.INBOX);
                }
            } else {
                navigateBack();
            }
            replaceReceipt({transactionID: initialTransactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
        },
        [initialTransactionID, policy, policyCategories, backTo, navigateBack],
    );

    const getSource = useCallback((file: FileObject) => file.uri ?? '', []);

    const {
        isEditing,
        isMultiScanEnabled,
        setIsMultiScanEnabled,
        isStartingScan,
        shouldAcceptMultipleFiles,
        shouldSkipConfirmation,
        startLocationPermissionFlow,
        setStartLocationPermissionFlow,
        receiptFiles,
        setReceiptFiles,
        navigateToConfirmationStep,
        validateFiles,
        PDFValidationComponent,
        ErrorModal,
        setTestReceiptAndNavigate,
    } = useReceiptScan({
        report,
        reportID,
        initialTransactionID,
        initialTransaction,
        iouType,
        action,
        currentUserPersonalDetails,
        backTo,
        backToReport,
        routeName,
        updateScanAndNavigate,
        getSource,
    });

    const {canUseMultiScan, shouldShowMultiScanEducationalPopup, submitReceipts, submitMultiScanReceipts, toggleMultiScan, dismissMultiScanEducationalPopup, blinkStyle, showBlink} =
        useMobileReceiptScan({
            initialTransaction,
            iouType,
            isMultiScanEnabled,
            isStartingScan,
            receiptFiles,
            navigateToConfirmationStep,
            shouldSkipConfirmation,
            setStartLocationPermissionFlow,
            setIsMultiScanEnabled,
            setReceiptFiles,
        });

    const maybeCancelShutterSpan = useCallback(() => {
        if (isMultiScanEnabled) {
            return;
        }

        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
    }, [isMultiScanEnabled]);

    const capturePhoto = () => {
        if (!isMultiScanEnabled) {
            startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
                name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native'},
            });
        }

        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            maybeCancelShutterSpan();
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            maybeCancelShutterSpan();
            showCameraAlert();
            return;
        }

        if (isCapturingPhoto.current) {
            maybeCancelShutterSpan();
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native'},
        });

        isCapturingPhoto.current = true;
        showBlink();

        const path = getReceiptsUploadFolderPath();

        captureReceipt(camera.current, {flash, hasFlash, isPlatformMuted, path, isInLandscapeMode})
            .then((photo: PhotoFile) => {
                setDidCapturePhoto(true);

                const transaction =
                    isMultiScanEnabled && initialTransaction?.receipt?.source
                        ? buildOptimisticTransactionAndCreateDraft({
                              initialTransaction,
                              currentUserPersonalDetails,
                              reportID,
                          })
                        : initialTransaction;
                const transactionID = transaction?.transactionID ?? initialTransactionID;
                const source = getPhotoSource(photo.path);
                const filename = photo.path;

                endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);

                const cameraFile = {
                    uri: source,
                    name: filename,
                    type: 'image/jpeg',
                    source,
                };

                if (isEditing) {
                    setMoneyRequestReceipt(transactionID, source, filename, !isEditing, 'image/jpeg');
                    updateScanAndNavigate(cameraFile as FileObject, source);
                    return;
                }

                const newReceiptFiles = [...receiptFiles, {file: cameraFile as FileObject, source, transactionID}];
                setReceiptFiles(newReceiptFiles);

                if (isMultiScanEnabled) {
                    setMoneyRequestReceipt(transactionID, source, filename, !isEditing, 'image/jpeg');
                    setDidCapturePhoto(false);
                    isCapturingPhoto.current = false;
                    return;
                }

                // Fire Onyx merge immediately (non-blocking) while we await thumbnail generation.
                // Both run in parallel — navigation proceeds once the thumbnail is cached.
                setMoneyRequestReceipt(transactionID, source, filename, !isEditing, 'image/jpeg');
                pregenerateThumbnail(source).then(() => {
                    submitReceipts(newReceiptFiles);
                });
            })
            .catch((error: string) => {
                isCapturingPhoto.current = false;
                cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
                maybeCancelShutterSpan();
                showCameraAlert();
                Log.warn('Error taking photo', error);
            });
    };

    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }

    return (
        <StepScreenWrapper
            includeSafeAreaPaddingBottom
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={!!backTo || isEditing}
            testID="IOURequestStepScan"
        >
            <View
                style={styles.flex1}
                onLayout={() => {
                    if (!onLayout) {
                        return;
                    }
                    onLayout(setTestReceiptAndNavigate);
                }}
            >
                {PDFValidationComponent}
                <View style={[styles.flex1, isInLandscapeMode && styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        {cameraPermissionStatus !== RESULTS.GRANTED && (
                            <ScrollView contentContainerStyle={styles.flexGrow1}>
                                <View style={[styles.cameraView, isInLandscapeMode ? styles.permissionViewLandscape : styles.permissionView, styles.userSelectNone]}>
                                    <ImageSVG
                                        contentFit="contain"
                                        src={lazyIllustrations.Hand}
                                        width={CONST.RECEIPT.HAND_ICON_WIDTH}
                                        height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                                        style={styles.pb5}
                                    />

                                    <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                                    <Text style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text>
                                    <Button
                                        success
                                        text={translate('common.continue')}
                                        accessibilityLabel={translate('common.continue')}
                                        style={[styles.p9, styles.pt5]}
                                        onPress={capturePhoto}
                                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_SUBMIT_BUTTON}
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
                                            onInitialized={handleCameraInitialized}
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
                        )}
                    </View>

                    <View style={[styles.justifyContentAround, styles.alignItemsCenter, styles.p3, !isInLandscapeMode && styles.flexRow]}>
                        <AttachmentPicker
                            onOpenPicker={() => {
                                setIsAttachmentPickerActive(true);
                                setIsLoaderVisible(true);
                            }}
                            fileLimit={shouldAcceptMultipleFiles ? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT : 1}
                            shouldValidateImage={false}
                        >
                            {({openPicker}) => (
                                <PressableWithFeedback
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={translate('receipt.gallery')}
                                    sentryLabel={shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE}
                                    style={[styles.alignItemsStart, isMultiScanEnabled && styles.opacity0]}
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
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.SHUTTER}
                            style={[styles.alignItemsCenter]}
                            onPress={capturePhoto}
                        >
                            <ImageSVG
                                contentFit="contain"
                                src={lazyIllustrations.Shutter}
                                width={CONST.RECEIPT.SHUTTER_SIZE}
                                height={CONST.RECEIPT.SHUTTER_SIZE}
                            />
                        </PressableWithFeedback>
                        {canUseMultiScan ? (
                            <PressableWithFeedback
                                accessibilityRole="button"
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.multiScan')}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.MULTI_SCAN}
                                style={styles.alignItemsEnd}
                                onPress={toggleMultiScan}
                            >
                                <Icon
                                    height={variables.iconSizeMenuItem}
                                    width={variables.iconSizeMenuItem}
                                    src={lazyIcons.ReceiptMultiple}
                                    fill={isMultiScanEnabled ? theme.iconMenu : theme.textSupporting}
                                />
                            </PressableWithFeedback>
                        ) : (
                            <PressableWithFeedback
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.flash')}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                                style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]}
                                disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                                onPress={() => setFlash((prevFlash) => !prevFlash)}
                            >
                                <Icon
                                    height={variables.iconSizeMenuItem}
                                    width={variables.iconSizeMenuItem}
                                    src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                                    fill={theme.textSupporting}
                                />
                            </PressableWithFeedback>
                        )}
                    </View>

                    {canUseMultiScan && isInLandscapeMode && (
                        <ReceiptPreviews
                            isMultiScanEnabled={isMultiScanEnabled}
                            submit={submitMultiScanReceipts}
                            isCapturingPhoto={didCapturePhoto}
                            isInLandscapeMode
                        />
                    )}
                </View>

                {canUseMultiScan && !isInLandscapeMode && (
                    <ReceiptPreviews
                        isMultiScanEnabled={isMultiScanEnabled}
                        submit={submitMultiScanReceipts}
                        isCapturingPhoto={didCapturePhoto}
                    />
                )}

                {startLocationPermissionFlow && !!receiptFiles.length && (
                    <LocationPermissionModal
                        startPermissionFlow={startLocationPermissionFlow}
                        resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                        onGrant={() => navigateToConfirmationStep(receiptFiles, true)}
                        onDeny={() => {
                            updateLastLocationPermissionPrompt();
                            navigateToConfirmationStep(receiptFiles, false);
                        }}
                    />
                )}

                {shouldShowMultiScanEducationalPopup && (
                    <FeatureTrainingModal
                        title={translate('iou.scanMultipleReceipts')}
                        image={lazyIllustrations.MultiScan}
                        shouldRenderSVG
                        imageHeight={220}
                        modalInnerContainerStyle={styles.pt0}
                        illustrationOuterContainerStyle={styles.multiScanEducationalPopupImage}
                        onConfirm={dismissMultiScanEducationalPopup}
                        titleStyles={styles.mb2}
                        confirmText={translate('common.buttonConfirm')}
                        description={translate('iou.scanMultipleReceiptsDescription')}
                        contentInnerContainerStyles={styles.mb6}
                        shouldGoBack={false}
                    />
                )}

                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScan);
// eslint-disable-next-line rulesdir/no-negated-variables -- withWritableReportOrNotFound HOC requires this pattern
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables -- withFullTransactionOrNotFound HOC requires this pattern
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
