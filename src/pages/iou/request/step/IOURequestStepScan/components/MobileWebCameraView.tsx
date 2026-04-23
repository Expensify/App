import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWebCamera from '@hooks/useWebCamera';
import {base64ToFile} from '@libs/fileDownload/FileUtils';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {cropImageToAspectRatio} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import useMobileReceiptScan from '@pages/iou/request/step/IOURequestStepScan/hooks/useMobileReceiptScan';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import variables from '@styles/variables';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NavigationAwareCamera from './NavigationAwareCamera/WebCamera';
import ReceiptPreviews from './ReceiptPreviews';

type MobileWebCameraViewProps = {
    initialTransaction: OnyxEntry<Transaction>;
    initialTransactionID: string;
    iouType: IOUType;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    reportID: string;
    isMultiScanEnabled: boolean;
    isStartingScan: boolean;
    updateScanAndNavigate: (file: FileObject, source: string) => void;
    setIsMultiScanEnabled: (value: boolean) => void;
    PDFValidationComponent: React.ReactNode;
    shouldAcceptMultipleFiles: boolean;
    receiptFiles: ReceiptFile[];
    isEditing: boolean;
    validateFiles: (files: FileObject[], items?: DataTransferItem[]) => void;
    setReceiptFiles: React.Dispatch<React.SetStateAction<ReceiptFile[]>>;
    navigateToConfirmationStep: (files: ReceiptFile[], locationPermissionGranted?: boolean, isTestTransaction?: boolean) => void;
    shouldSkipConfirmation: boolean;
    setStartLocationPermissionFlow: (value: boolean) => void;
    onBackButtonPress: () => void;
    onLayout?: () => void;
    shouldShowWrapper: boolean;
};

function MobileWebCameraView({
    initialTransaction,
    initialTransactionID,
    iouType,
    currentUserPersonalDetails,
    reportID,
    isMultiScanEnabled,
    isStartingScan,
    updateScanAndNavigate,
    setIsMultiScanEnabled,
    PDFValidationComponent,
    shouldAcceptMultipleFiles,
    receiptFiles,
    isEditing,
    validateFiles,
    setReceiptFiles,
    navigateToConfirmationStep,
    shouldSkipConfirmation,
    setStartLocationPermissionFlow,
    onBackButtonPress,
    onLayout,
    shouldShowWrapper,
}: MobileWebCameraViewProps) {
    const {blinkStyle, canUseMultiScan, shouldShowMultiScanEducationalPopup, showBlink, toggleMultiScan, dismissMultiScanEducationalPopup, submitReceipts, submitMultiScanReceipts} =
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
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['MultiScan', 'Hand', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'boltSlash']);

    const onUnmount = useCallback(() => {
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
    }, []);

    const {
        cameraRef,
        viewfinderLayout,
        cameraPermissionState,
        setCameraPermissionState,
        isFlashLightOn,
        toggleFlashlight,
        isTorchAvailable,
        isQueriedPermissionState,
        videoConstraints,
        requestCameraPermission,
        setupCameraPermissionsAndCapabilities,
        capturePhotoWithFlash,
    } = useWebCamera({onUnmount});

    const onCapture = (file: FileObject, filename: string, source: string) => {
        const transaction =
            isMultiScanEnabled && initialTransaction?.receipt?.source
                ? buildOptimisticTransactionAndCreateDraft({
                      initialTransaction,
                      currentUserPersonalDetails,
                      reportID,
                  })
                : initialTransaction;
        const transactionID = transaction?.transactionID ?? initialTransactionID;
        const newReceiptFiles = [...receiptFiles, {file, source, transactionID}];

        setMoneyRequestReceipt(transactionID, source, filename, !isEditing, file.type);
        setReceiptFiles(newReceiptFiles);

        if (isMultiScanEnabled) {
            return;
        }

        if (isEditing) {
            updateScanAndNavigate(file, source);
            return;
        }

        submitReceipts(newReceiptFiles);
    };

    const getScreenshot = () => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        if (!isMultiScanEnabled) {
            startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
                name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'web'},
            });
        }
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

        if (isMultiScanEnabled) {
            showBlink();
        }

        const originalFileName = `receipt_${Date.now()}.png`;
        const originalFile = base64ToFile(imageBase64 ?? '', originalFileName);

        if (originalFile.size === 0) {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            return;
        }

        const imageObject: ImageObject = {file: originalFile, filename: originalFile.name, source: URL.createObjectURL(originalFile)};
        // Some browsers center-crop the viewfinder inside the video element (due to object-position: center),
        // while other browsers let the video element overflow and the container crops it from the top.
        // We crop and align the result image the same way.
        const videoHeight = cameraRef.current.video?.getBoundingClientRect?.()?.height ?? NaN;
        const viewFinderHeight = viewfinderLayout.current?.height ?? NaN;
        const shouldAlignTop = videoHeight > viewFinderHeight;
        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, shouldAlignTop).then(({file, filename, source}) => {
            endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            onCapture(file, filename, source);
        });
    };

    const capturePhoto = () => {
        capturePhotoWithFlash(getScreenshot);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={onBackButtonPress}
            shouldShowWrapper={shouldShowWrapper}
            testID="IOURequestStepScan"
        >
            <View
                onLayout={onLayout}
                style={[styles.flex1]}
            >
                <View style={[styles.flex1, styles.justifyContentCenter]}>
                    <View style={[styles.cameraView]}>
                        {PDFValidationComponent}
                        {((cameraPermissionState === 'prompt' && !isQueriedPermissionState) || (cameraPermissionState === 'granted' && isEmptyObject(videoConstraints))) && (
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                style={[styles.flex1]}
                                color={theme.textSupporting}
                                reasonAttributes={
                                    {
                                        context: 'MobileWebCameraView',
                                        cameraPermissionState,
                                        isQueriedPermissionState,
                                    } satisfies SkeletonSpanReasonAttributes
                                }
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
                                {canUseMultiScan ? (
                                    <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, isFlashLightOn && styles.bgGreenSuccess, !isTorchAvailable && styles.opacity0]}>
                                        <PressableWithFeedback
                                            role={CONST.ROLE.BUTTON}
                                            accessibilityLabel={translate('receipt.flash')}
                                            disabled={!isTorchAvailable}
                                            onPress={toggleFlashlight}
                                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                                        >
                                            <Icon
                                                height={variables.iconSizeSmall}
                                                width={variables.iconSizeSmall}
                                                src={lazyIcons.Bolt}
                                                fill={isFlashLightOn ? theme.white : theme.icon}
                                            />
                                        </PressableWithFeedback>
                                    </View>
                                ) : null}
                                <Animated.View
                                    pointerEvents="none"
                                    style={[StyleSheet.absoluteFill, styles.backgroundWhite, blinkStyle, styles.zIndex10]}
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
                                    style={isMultiScanEnabled && styles.opacity0}
                                    onPress={() => {
                                        openPicker({
                                            onPicked: (data) => validateFiles(data),
                                        });
                                    }}
                                    sentryLabel={shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE}
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
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.SHUTTER}
                        >
                            <Icon
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
                                style={styles.alignItemsEnd}
                                onPress={toggleMultiScan}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.MULTI_SCAN}
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
                                style={[styles.alignItemsEnd, !isTorchAvailable && styles.opacity0]}
                                onPress={toggleFlashlight}
                                disabled={!isTorchAvailable}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                            >
                                <Icon
                                    height={variables.iconSizeMenuItem}
                                    width={variables.iconSizeMenuItem}
                                    src={isFlashLightOn ? lazyIcons.Bolt : lazyIcons.boltSlash}
                                    fill={theme.textSupporting}
                                />
                            </PressableWithFeedback>
                        )}
                    </View>
                    {canUseMultiScan && shouldShowMultiScanEducationalPopup && (
                        <FeatureTrainingModal
                            title={translate('iou.scanMultipleReceipts')}
                            image={lazyIllustrations.MultiScan}
                            shouldRenderSVG
                            imageHeight="auto"
                            imageWidth="auto"
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
                </View>

                {canUseMultiScan && (
                    <ReceiptPreviews
                        isMultiScanEnabled={isMultiScanEnabled}
                        submit={submitMultiScanReceipts}
                    />
                )}
            </View>
        </StepScreenWrapper>
    );
}

export default MobileWebCameraView;
export type {MobileWebCameraViewProps};
