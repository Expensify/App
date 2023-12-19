import lodashGet from 'lodash/get';
import React, {useCallback, useContext, useReducer, useRef, useState} from 'react';
import {ActivityIndicator, PanResponder, PixelRatio, Text, View} from 'react-native';
import Hand from '@assets/images/hand.svg';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import Shutter from '@assets/images/shutter.svg';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import compose from '@libs/compose';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import IOURequestStepRoutePropTypes from '@pages/iou/request/step/IOURequestStepRoutePropTypes';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import NavigationAwareCamera from './NavigationAwareCamera';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The report that the transaction belongs to */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
};

function IOURequestStepScan({
    report,
    route: {
        params: {iouType, reportID, transactionID, backTo},
    },
}) {
    const theme = useTheme();
    const styles = useThemeStyles();

    // Grouping related states
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState('');
    const [attachmentInvalidReason, setAttachmentValidReason] = useState('');

    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isDraggingOver} = useContext(DragAndDropContext);

    const [cameraPermissionState, setCameraPermissionState] = useState('prompt');
    const [isFlashLightOn, toggleFlashlight] = useReducer((state) => !state, false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const cameraRef = useRef(null);

    const hideRecieptModal = () => {
        setIsAttachmentInvalid(false);
    };

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     * @param {*} isInvalid
     * @param {*} title
     * @param {*} reason
     */
    const setUploadReceiptError = (isInvalid, title, reason) => {
        setIsAttachmentInvalid(isInvalid);
        setAttachmentInvalidReasonTitle(title);
        setAttachmentValidReason(reason);
    };

    function validateReceipt(file) {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(file, 'name', ''));
        if (!CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(fileExtension.toLowerCase())) {
            setUploadReceiptError(true, 'attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension');
            return false;
        }

        if (lodashGet(file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooLarge', 'attachmentPicker.sizeExceeded');
            return false;
        }

        if (lodashGet(file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooSmall', 'attachmentPicker.sizeNotMet');
            return false;
        }

        return true;
    }

    const navigateBack = () => {
        Navigation.goBack(backTo || ROUTES.HOME);
    };

    /**
     * Sets the Receipt objects and navigates the user to the next page
     * @param {Object} file
     */
    const setReceiptAndNavigate = (file) => {
        if (!validateReceipt(file)) {
            return;
        }

        const fileSource = URL.createObjectURL(file);
        IOU.setMoneyRequestReceipt_temporaryForRefactor(transactionID, fileSource, file.name);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // When an existing transaction is being edited (eg. not the create transaction flow)
        if (transactionID !== CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
            IOU.replaceReceipt(transactionID, file, fileSource);
            Navigation.dismissModal();
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouType, transactionID, reportID));
            return;
        }

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };

    const capturePhoto = useCallback(() => {
        if (!cameraRef.current.getScreenshot) {
            return;
        }
        const imageBase64 = cameraRef.current.getScreenshot();
        const filename = `receipt_${Date.now()}.png`;
        const imageFile = FileUtils.base64ToFile(imageBase64, filename);
        const fileSource = URL.createObjectURL(imageFile);
        IOU.setMoneyRequestReceipt_temporaryForRefactor(transactionID, fileSource, imageFile.name);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // When an existing transaction is being edited (eg. not the create transaction flow)
        if (transactionID !== CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
            IOU.replaceReceipt(transactionID, imageFile, fileSource);
            Navigation.dismissModal();
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouType, transactionID, reportID));
            return;
        }

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    }, [cameraRef, report, iouType, transactionID, reportID, backTo]);

    const panResponder = useRef(
        PanResponder.create({
            onPanResponderTerminationRequest: () => false,
        }),
    ).current;

    const mobileCameraView = () => (
        <>
            <View style={[styles.cameraView]}>
                {(cameraPermissionState === 'prompt' || !cameraPermissionState) && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.textSupporting}
                    />
                )}
                {cameraPermissionState === 'denied' && (
                    <View style={[styles.flex1, styles.permissionView, styles.userSelectNone]}>
                        <Icon
                            src={Hand}
                            width={CONST.RECEIPT.HAND_ICON_WIDTH}
                            height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                            style={[styles.pb5]}
                        />
                        <Text style={[styles.textReceiptUpload]}>{translate('receipt.takePhoto')}</Text>
                        <Text style={[styles.subTextReceiptUpload]}>{translate('receipt.cameraAccess')}</Text>
                    </View>
                )}
                <NavigationAwareCamera
                    onUserMedia={() => setCameraPermissionState('granted')}
                    onUserMediaError={() => setCameraPermissionState('denied')}
                    style={{...styles.videoContainer, display: cameraPermissionState !== 'granted' ? 'none' : 'block'}}
                    ref={cameraRef}
                    screenshotFormat="image/png"
                    videoConstraints={{facingMode: {exact: 'environment'}}}
                    torchOn={isFlashLightOn}
                    onTorchAvailability={setIsTorchAvailable}
                    forceScreenshotSourceSize
                    cameraTabIndex={1}
                />
            </View>

            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                <AttachmentPicker>
                    {({openPicker}) => (
                        <PressableWithFeedback
                            accessibilityLabel={translate('receipt.chooseFile')}
                            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            onPress={() => {
                                openPicker({
                                    onPicked: setReceiptAndNavigate,
                                });
                            }}
                        >
                            <Icon
                                height={32}
                                width={32}
                                src={Expensicons.Gallery}
                                fill={theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    )}
                </AttachmentPicker>
                <PressableWithFeedback
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.shutter')}
                    style={[styles.alignItemsCenter]}
                    onPress={capturePhoto}
                >
                    <Shutter
                        width={CONST.RECEIPT.SHUTTER_SIZE}
                        height={CONST.RECEIPT.SHUTTER_SIZE}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.flash')}
                    style={[styles.alignItemsEnd, !isTorchAvailable && styles.opacity0]}
                    onPress={toggleFlashlight}
                    disabled={!isTorchAvailable}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={Expensicons.Bolt}
                        fill={isFlashLightOn ? theme.iconHovered : theme.textSupporting}
                    />
                </PressableWithFeedback>
            </View>
        </>
    );

    const desktopUploadView = () => (
        <>
            <View onLayout={({nativeEvent}) => setReceiptImageTopPosition(PixelRatio.roundToNearestPixel(nativeEvent.layout.top))}>
                <ReceiptUpload
                    width={CONST.RECEIPT.ICON_SIZE}
                    height={CONST.RECEIPT.ICON_SIZE}
                />
            </View>

            <View
                style={[styles.receiptViewTextContainer, styles.userSelectNone]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...panResponder.panHandlers}
            >
                <Text style={[styles.textReceiptUpload]}>{translate('receipt.upload')}</Text>
                <Text style={[styles.subTextReceiptUpload]}>
                    {isSmallScreenWidth ? translate('receipt.chooseReceipt') : translate('receipt.dragReceiptBeforeEmail')}
                    <CopyTextToClipboard
                        text={CONST.EMAIL.RECEIPTS}
                        textStyles={[styles.textBlue]}
                    />
                    {isSmallScreenWidth ? null : translate('receipt.dragReceiptAfterEmail')}
                </Text>
            </View>

            <AttachmentPicker>
                {({openPicker}) => (
                    <Button
                        medium
                        success
                        text={translate('receipt.chooseFile')}
                        accessibilityLabel={translate('receipt.chooseFile')}
                        style={[styles.p9]}
                        onPress={() => {
                            openPicker({
                                onPicked: setReceiptAndNavigate,
                            });
                        }}
                    />
                )}
            </AttachmentPicker>
        </>
    );

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={Boolean(backTo)}
            testID={IOURequestStepScan.displayName}
        >
            <View style={[styles.flex1, !Browser.isMobile() && styles.uploadReceiptView(isSmallScreenWidth)]}>
                {!isDraggingOver && (Browser.isMobile() ? mobileCameraView() : desktopUploadView())}
                <ReceiptDropUI
                    onDrop={(e) => {
                        const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                        setReceiptAndNavigate(file);
                    }}
                    receiptImageTopPosition={receiptImageTopPosition}
                />
                <ConfirmModal
                    title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                    onConfirm={hideRecieptModal}
                    onCancel={hideRecieptModal}
                    isVisible={isAttachmentInvalid}
                    prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                    confirmText={translate('common.close')}
                    shouldShowCancelButton={false}
                />
            </View>
        </StepScreenDragAndDropWrapper>
    );
}

IOURequestStepScan.defaultProps = defaultProps;
IOURequestStepScan.propTypes = propTypes;
IOURequestStepScan.displayName = 'IOURequestStepScan';

export default compose(withWritableReportOrNotFound, withFullTransactionOrNotFound)(IOURequestStepScan);
