import lodashGet from 'lodash/get';
import React, {useCallback, useContext, useEffect, useReducer, useRef, useState} from 'react';
import {ActivityIndicator, PanResponder, PixelRatio, View} from 'react-native';
import _ from 'underscore';
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
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';
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

    /** The transaction (or draft transaction) being changed */
    transaction: transactionPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
};

function IOURequestStepScan({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
    },
    transaction: {isFromGlobalCreate},
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
    const trackRef = useRef(null);
    const [isQueriedPermissionState, setIsQueriedPermissionState] = useState(false);

    const getScreenshotTimeoutRef = useRef(null);

    const [videoConstraints, setVideoConstraints] = useState(null);
    const tabIndex = 1;
    const isTabActive = useTabNavigatorFocus({tabIndex});

    /**
     * On phones that have ultra-wide lens, react-webcam uses ultra-wide by default.
     * The last deviceId is of regular len camera.
     */
    const requestCameraPermission = useCallback(() => {
        if (!_.isEmpty(videoConstraints) || !Browser.isMobile()) {
            return;
        }

        const defaultConstraints = {facingMode: {exact: 'environment'}};
        navigator.mediaDevices
            .getUserMedia({video: {facingMode: {exact: 'environment'}, zoom: {ideal: 1}}})
            .then((stream) => {
                setCameraPermissionState('granted');
                _.forEach(stream.getTracks(), (track) => track.stop());
                // Only Safari 17+ supports zoom constraint
                if (Browser.isMobileSafari() && stream.getTracks().length > 0) {
                    const deviceId = _.chain(stream.getTracks())
                        .map((track) => track.getSettings())
                        .find((setting) => setting.zoom === 1)
                        .get('deviceId')
                        .value();
                    if (deviceId) {
                        setVideoConstraints({deviceId});
                        return;
                    }
                }
                if (!navigator.mediaDevices.enumerateDevices) {
                    setVideoConstraints(defaultConstraints);
                    return;
                }
                navigator.mediaDevices.enumerateDevices().then((devices) => {
                    const lastBackDeviceId = _.chain(devices)
                        .filter((item) => item.kind === 'videoinput')
                        .last()
                        .get('deviceId', '')
                        .value();

                    if (!lastBackDeviceId) {
                        setVideoConstraints(defaultConstraints);
                        return;
                    }
                    setVideoConstraints({deviceId: lastBackDeviceId});
                });
            })
            .catch(() => {
                setVideoConstraints(defaultConstraints);
                setCameraPermissionState('denied');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!Browser.isMobile() || !isTabActive) {
            return;
        }
        navigator.permissions
            .query({name: 'camera'})
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
        // We only want to get the camera permission status when the component is mounted
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTabActive]);

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
        Navigation.goBack(backTo);
    };

    const navigateToConfirmationStep = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If the transaction was created from the global create, the person needs to select participants, so take them there.
        if (isFromGlobalCreate && iouType !== CONST.IOU.TYPE.TRACK_EXPENSE) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
            return;
        }

        // If the transaction was created from the + menu from the composer inside of a chat, the participants can automatically
        // be added to the transaction (taken from the chat report participants) and then the person is taken to the confirmation step.
        IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouType, transactionID, reportID));
    }, [iouType, report, reportID, transactionID, isFromGlobalCreate, backTo]);

    const updateScanAndNavigate = useCallback(
        (file, source) => {
            IOU.replaceReceipt(transactionID, file, source);
            Navigation.dismissModal();
        },
        [transactionID],
    );

    /**
     * Sets the Receipt objects and navigates the user to the next page
     * @param {Object} file
     */
    const setReceiptAndNavigate = (file) => {
        if (!validateReceipt(file)) {
            return;
        }

        // Store the receipt on the transaction object in Onyx
        const source = URL.createObjectURL(file);
        IOU.setMoneyRequestReceipt(transactionID, source, file.name, action !== CONST.IOU.ACTION.EDIT);

        if (action === CONST.IOU.ACTION.EDIT) {
            updateScanAndNavigate(file, source);
            return;
        }

        navigateToConfirmationStep();
    };

    const setupCameraPermissionsAndCapabilities = (stream) => {
        setCameraPermissionState('granted');

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
            trackRef.current = track;
        }
        setIsTorchAvailable(!!capabilities.torch);
    };

    const getScreenshot = useCallback(() => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        const imageBase64 = cameraRef.current.getScreenshot();

        const filename = `receipt_${Date.now()}.png`;
        const file = FileUtils.base64ToFile(imageBase64, filename);
        const source = URL.createObjectURL(file);
        IOU.setMoneyRequestReceipt(transactionID, source, file.name, action !== CONST.IOU.ACTION.EDIT);

        if (action === CONST.IOU.ACTION.EDIT) {
            updateScanAndNavigate(file, source);
            return;
        }

        navigateToConfirmationStep();
    }, [action, transactionID, updateScanAndNavigate, navigateToConfirmationStep, requestCameraPermission]);

    const clearTorchConstraints = useCallback(() => {
        if (!trackRef.current) {
            return;
        }
        trackRef.current.applyConstraints({
            advanced: [{torch: false}],
        });
    }, []);

    const capturePhoto = useCallback(() => {
        if (trackRef.current && isFlashLightOn) {
            trackRef.current
                .applyConstraints({
                    advanced: [{torch: true}],
                })
                .then(() => {
                    getScreenshotTimeoutRef.current = setTimeout(() => {
                        getScreenshot();
                        clearTorchConstraints();
                    }, 2000);
                });
            return;
        }

        getScreenshot();
    }, [isFlashLightOn, getScreenshot, clearTorchConstraints]);

    const panResponder = useRef(
        PanResponder.create({
            onPanResponderTerminationRequest: () => false,
        }),
    ).current;

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
                {((cameraPermissionState === 'prompt' && !isQueriedPermissionState) || (cameraPermissionState === 'granted' && _.isEmpty(videoConstraints))) && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.textSupporting}
                    />
                )}
                {cameraPermissionState !== 'granted' && isQueriedPermissionState && (
                    <View style={[styles.flex1, styles.permissionView, styles.userSelectNone]}>
                        <Icon
                            src={Hand}
                            width={CONST.RECEIPT.HAND_ICON_WIDTH}
                            height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                            style={[styles.pb5]}
                        />
                        <Text style={[styles.textReceiptUpload]}>{translate('receipt.takePhoto')}</Text>
                        <Text style={[styles.subTextReceiptUpload]}>{translate('receipt.cameraAccess')}</Text>
                        <Button
                            medium
                            success
                            text={translate('common.continue')}
                            accessibilityLabel={translate('common.continue')}
                            style={[styles.p9, styles.pt5]}
                            onPress={capturePhoto}
                        />
                    </View>
                )}
                {cameraPermissionState === 'granted' && !_.isEmpty(videoConstraints) && (
                    <NavigationAwareCamera
                        onUserMedia={setupCameraPermissionsAndCapabilities}
                        onUserMediaError={() => setCameraPermissionState('denied')}
                        style={{...styles.videoContainer, display: cameraPermissionState !== 'granted' ? 'none' : 'block'}}
                        ref={cameraRef}
                        screenshotFormat="image/png"
                        videoConstraints={videoConstraints}
                        forceScreenshotSourceSize
                        cameraTabIndex={tabIndex}
                    />
                )}
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
