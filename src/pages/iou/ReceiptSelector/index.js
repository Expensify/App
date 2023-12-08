import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useReducer, useRef, useState} from 'react';
import {ActivityIndicator, PanResponder, PixelRatio, Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {iouDefaultProps, iouPropTypes} from '@pages/iou/propTypes';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import reportPropTypes from '@pages/reportPropTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import NavigationAwareCamera from './NavigationAwareCamera';

const propTypes = {
    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),

        /** The current route path */
        path: PropTypes.string,
    }).isRequired,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** The id of the transaction we're editing */
    transactionID: PropTypes.string,
};

const defaultProps = {
    report: {},
    iou: iouDefaultProps,
    transactionID: '',
};

function ReceiptSelector({route, transactionID, iou, report}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const iouType = lodashGet(route, 'params.iouType', '');
    const pageIndex = lodashGet(route, 'params.pageIndex', 1);

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

    const hideReciptModal = () => {
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

    /**
     * Sets the Receipt objects and navigates the user to the next page
     * @param {Object} file
     * @param {Object} iouObject
     * @param {Object} reportObject
     */
    const setReceiptAndNavigate = (file, iouObject, reportObject) => {
        if (!validateReceipt(file)) {
            return;
        }

        const filePath = URL.createObjectURL(file);
        IOU.setMoneyRequestReceipt(filePath, file.name);

        if (transactionID) {
            IOU.replaceReceipt(transactionID, file, filePath);
            Navigation.dismissModal();
            return;
        }

        IOU.navigateToNextPage(iouObject, iouType, reportObject, route.path);
    };

    const capturePhoto = useCallback(() => {
        if (!cameraRef.current.getScreenshot) {
            return;
        }
        const imageBase64 = cameraRef.current.getScreenshot();
        const filename = `receipt_${Date.now()}.png`;
        const imageFile = FileUtils.base64ToFile(imageBase64, filename);
        const filePath = URL.createObjectURL(imageFile);
        IOU.setMoneyRequestReceipt(filePath, imageFile.name);

        if (transactionID) {
            IOU.replaceReceipt(transactionID, imageFile, filePath);
            Navigation.dismissModal();
            return;
        }

        IOU.navigateToNextPage(iou, iouType, report, route.path);
    }, [cameraRef, iou, report, iouType, transactionID, route.path]);

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
                    cameraTabIndex={pageIndex}
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
                                    onPicked: (file) => {
                                        setReceiptAndNavigate(file, iou, report);
                                    },
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
                                onPicked: (file) => {
                                    setReceiptAndNavigate(file, iou, report);
                                },
                            });
                        }}
                    />
                )}
            </AttachmentPicker>
        </>
    );

    return (
        <View style={[styles.flex1, !Browser.isMobile() && styles.uploadReceiptView(isSmallScreenWidth)]}>
            {!isDraggingOver && (Browser.isMobile() ? mobileCameraView() : desktopUploadView())}
            <ReceiptDropUI
                onDrop={(e) => {
                    const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                    setReceiptAndNavigate(file, iou, report);
                }}
                receiptImageTopPosition={receiptImageTopPosition}
            />
            <ConfirmModal
                title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                onConfirm={hideReciptModal}
                onCancel={hideReciptModal}
                isVisible={isAttachmentInvalid}
                prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                confirmText={translate('common.close')}
                shouldShowCancelButton={false}
            />
        </View>
    );
}

ReceiptSelector.defaultProps = defaultProps;
ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(ReceiptSelector);
