import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {useCameraFormat} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import LocationPermissionModal from '@components/LocationPermissionModal';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNativeCamera from '@hooks/useNativeCamera';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU/MoneyRequest';
import {replaceReceipt} from '@userActions/IOU/Receipt';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';
import CameraPermissionPrompt from './components/CameraPermissionPrompt';
import CameraViewport from './components/CameraViewport';
import ReceiptPreviews from './components/ReceiptPreviews';
import ScannerControlsBar from './components/ScannerControlsBar';
import getCameraAspectRatio from './getCameraAspectRatio';
import useCameraInitTelemetry from './hooks/useCameraInitTelemetry';
import useCapturePhoto from './hooks/useCapturePhoto';
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
}: IOURequestStepScanProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();
    const {windowWidth, windowHeight} = useWindowDimensions();

    // Ref bridging resetCapturingState (from useCapturePhoto) into onFocusStart (used by useNativeCamera).
    // Both hooks depend on each other's outputs, so we use a ref to break the initialization cycle.
    const resetCapturingStateRef = useRef(() => {});

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
        context: 'IOURequestStepScan',
        onFocusStart: () => resetCapturingStateRef.current(),
        onFocusCleanup: () => {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        },
    });

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
    const lazyIllustrations = useMemoizedLazyIllustrations(['MultiScan', 'Hand']);
    const policy = usePolicy(report?.policyID);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);

    const {handleCameraInitialized} = useCameraInitTelemetry({cameraPermissionStatus, device});

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
            replaceReceipt({
                transactionID: initialTransactionID,
                file: file as File,
                source,
                transactionPolicy: policy,
                transactionPolicyCategories: policyCategories,
                transactionPolicyTagList: policyTagList,
            });
        },
        [initialTransactionID, policy, policyCategories, backTo, navigateBack, policyTagList],
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

    const {capturePhoto, resetCapturingState} = useCapturePhoto({
        cameraRef: camera,
        cameraPermissionStatus,
        flash,
        hasFlash,
        isPlatformMuted,
        isInLandscapeMode,
        askForPermissions,
        setDidCapturePhoto,
        isMultiScanEnabled,
        isEditing,
        initialTransaction,
        initialTransactionID,
        currentUserPersonalDetails,
        reportID,
        receiptFiles,
        setReceiptFiles,
        updateScanAndNavigate,
        submitReceipts,
        showBlink,
    });
    useEffect(() => {
        resetCapturingStateRef.current = resetCapturingState;
    }, [resetCapturingState]);

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
            <View style={styles.flex1}>
                {PDFValidationComponent}
                <View style={[styles.flex1, isInLandscapeMode && styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        {cameraPermissionStatus !== RESULTS.GRANTED && (
                            <CameraPermissionPrompt
                                isInLandscapeMode={isInLandscapeMode}
                                handIllustration={lazyIllustrations.Hand}
                                onPress={capturePhoto}
                            />
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
                            <CameraViewport
                                camera={camera}
                                device={device}
                                format={format}
                                fps={fps}
                                cameraAspectRatio={cameraAspectRatio}
                                isInLandscapeMode={isInLandscapeMode}
                                tapGesture={tapGesture}
                                cameraFocusIndicatorAnimatedStyle={cameraFocusIndicatorAnimatedStyle}
                                blinkStyle={blinkStyle}
                                isAttachmentPickerActive={isAttachmentPickerActive}
                                didCapturePhoto={didCapturePhoto}
                                onInitialized={handleCameraInitialized}
                                canUseMultiScan={canUseMultiScan}
                                flash={flash}
                                hasFlash={hasFlash}
                                setFlash={setFlash}
                            />
                        )}
                    </View>

                    <ScannerControlsBar
                        isInLandscapeMode={isInLandscapeMode}
                        isMultiScanEnabled={isMultiScanEnabled}
                        canUseMultiScan={canUseMultiScan}
                        shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                        cameraPermissionStatus={cameraPermissionStatus}
                        flash={flash}
                        hasFlash={hasFlash}
                        setFlash={setFlash}
                        setIsAttachmentPickerActive={setIsAttachmentPickerActive}
                        setIsLoaderVisible={setIsLoaderVisible}
                        validateFiles={validateFiles}
                        capturePhoto={capturePhoto}
                        toggleMultiScan={toggleMultiScan}
                    />

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

const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);

const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
