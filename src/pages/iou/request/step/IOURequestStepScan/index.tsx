import React, {useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {ActivityIndicator, PanResponder, PixelRatio, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type Webcam from 'react-webcam';
import Hand from '@assets/images/hand.svg';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import Shutter from '@assets/images/shutter.svg';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NavigationAwareCamera from './NavigationAwareCamera';
import type {IOURequestStepOnyxProps, IOURequestStepScanProps} from './types';

function IOURequestStepScan({
    report,
    policy,
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
    },
    transaction,
    personalDetails,
    currentUserPersonalDetails,
    skipConfirmation,
}: Omit<IOURequestStepScanProps, 'user'>) {
    const theme = useTheme();
    const styles = useThemeStyles();

    // Grouping related states
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths>();
    const [attachmentInvalidReason, setAttachmentValidReason] = useState<TranslationPaths>();

    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isDraggingOver} = useContext(DragAndDropContext);

    const [cameraPermissionState, setCameraPermissionState] = useState<PermissionState | undefined>('prompt');
    const [isFlashLightOn, toggleFlashlight] = useReducer((state) => !state, false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const cameraRef = useRef<Webcam>(null);
    const trackRef = useRef<MediaStreamTrack | null>(null);
    const [isQueriedPermissionState, setIsQueriedPermissionState] = useState(false);

    const getScreenshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints>();
    const tabIndex = 1;
    const isTabActive = useTabNavigatorFocus({tabIndex});

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID || iouType === CONST.IOU.TYPE.TRACK_EXPENSE) {
            return false;
        }

        return !ReportUtils.isArchivedRoom(report) && !(ReportUtils.isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));
    }, [report, skipConfirmation, policy, iouType]);

    /**
     * On phones that have ultra-wide lens, react-webcam uses ultra-wide by default.
     * The last deviceId is of regular len camera.
     */
    const requestCameraPermission = useCallback(() => {
        if (!isEmptyObject(videoConstraints) || !Browser.isMobile()) {
            return;
        }

        const defaultConstraints = {facingMode: {exact: 'environment'}};
        navigator.mediaDevices
            // @ts-expect-error there is a type mismatch in typescipt types for MediaStreamTrack microsoft/TypeScript#39010
            .getUserMedia({video: {facingMode: {exact: 'environment'}, zoom: {ideal: 1}}})
            .then((stream) => {
                setCameraPermissionState('granted');
                stream.getTracks().forEach((track) => track.stop());
                // Only Safari 17+ supports zoom constraint
                if (Browser.isMobileSafari() && stream.getTracks().length > 0) {
                    let deviceId;
                    for (const track of stream.getTracks()) {
                        const setting = track.getSettings();
                        // @ts-expect-error there is a type mismatch in typescipt types for MediaStreamTrack microsoft/TypeScript#39010
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
                navigator.mediaDevices.enumerateDevices().then((devices) => {
                    let lastBackDeviceId = '';
                    for (let i = devices.length - 1; i >= 0; i--) {
                        const device = devices[i];
                        if (device.kind === 'videoinput') {
                            lastBackDeviceId = device.deviceId;
                            break;
                        }
                    }
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
            .query({
                // @ts-expect-error camera does exist in PermissionName
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
        // We only want to get the camera permission status when the component is mounted
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTabActive]);

    const hideRecieptModal = () => {
        setIsAttachmentInvalid(false);
    };

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (isInvalid: boolean, title: TranslationPaths, reason: TranslationPaths) => {
        setIsAttachmentInvalid(isInvalid);
        setAttachmentInvalidReasonTitle(title);
        setAttachmentValidReason(reason);
    };

    function validateReceipt(file: FileObject) {
        return FileUtils.validateImageForCorruption(file)
            .then(() => {
                const {fileExtension} = FileUtils.splitExtensionFromFileName(file?.name ?? '');
                if (
                    !CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(
                        fileExtension.toLowerCase() as (typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS)[number],
                    )
                ) {
                    setUploadReceiptError(true, 'attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension');
                    return false;
                }

                if ((file?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                    setUploadReceiptError(true, 'attachmentPicker.attachmentTooLarge', 'attachmentPicker.sizeExceeded');
                    return false;
                }

                if ((file?.size ?? 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                    setUploadReceiptError(true, 'attachmentPicker.attachmentTooSmall', 'attachmentPicker.sizeNotMet');
                    return false;
                }

                return true;
            })
            .catch(() => {
                setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.errorWhileSelectingCorruptedImage');
                return false;
            });
    }

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const navigateToConfirmationStep = useCallback(
        (file: FileObject, source: string) => {
            if (backTo) {
                Navigation.goBack(backTo);
                return;
            }

            // If the transaction was created from the global create, the person needs to select participants, so take them there.
            if (transaction?.isFromGlobalCreate && iouType !== CONST.IOU.TYPE.TRACK_EXPENSE && !report?.reportID) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
                return;
            }

            // If the transaction was created from the + menu from the composer inside of a chat, the participants can automatically
            // be added to the transaction (taken from the chat report participants) and then the person is taken to the confirmation step.
            const selectedParticipants = IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? 0;
                return participantAccountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
            });

            if (shouldSkipConfirmation) {
                const receipt: Receipt = file;
                receipt.source = source;
                receipt.state = CONST.IOU.RECEIPT_STATE.SCANREADY;
                if (iouType === CONST.IOU.TYPE.SPLIT) {
                    IOU.startSplitBill({
                        participants,
                        currentUserLogin: currentUserPersonalDetails?.login ?? '',
                        currentUserAccountID: currentUserPersonalDetails?.accountID ?? 0,
                        comment: '',
                        receipt,
                        existingSplitChatReportID: reportID ?? 0,
                        billable: false,
                        category: '',
                        tag: '',
                        currency: transaction?.currency ?? 'USD',
                    });
                    return;
                }
                IOU.requestMoney(
                    report,
                    0,
                    transaction?.currency ?? 'USD',
                    transaction?.created ?? '',
                    '',
                    currentUserPersonalDetails.login,
                    currentUserPersonalDetails.accountID,
                    participants[0],
                    '',
                    receipt,
                );
                return;
            }
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
        },
        [iouType, report, reportID, transactionID, backTo, currentUserPersonalDetails, personalDetails, shouldSkipConfirmation, transaction],
    );

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            IOU.replaceReceipt(transactionID, file as File, source);
            Navigation.dismissModal();
        },
        [transactionID],
    );

    /**
     * Sets the Receipt objects and navigates the user to the next page
     */
    const setReceiptAndNavigate = (file: FileObject) => {
        validateReceipt(file).then((isFileValid) => {
            if (!isFileValid) {
                return;
            }
            // Store the receipt on the transaction object in Onyx
            const source = URL.createObjectURL(file as Blob);
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            IOU.setMoneyRequestReceipt(transactionID, source, file.name || '', action !== CONST.IOU.ACTION.EDIT);

            if (action === CONST.IOU.ACTION.EDIT) {
                updateScanAndNavigate(file, source);
                return;
            }
            navigateToConfirmationStep(file, source);
        });
    };

    const setupCameraPermissionsAndCapabilities = (stream: MediaStream) => {
        setCameraPermissionState('granted');

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();

        if ('torch' in capabilities && capabilities.torch) {
            trackRef.current = track;
        }
        setIsTorchAvailable('torch' in capabilities && !!capabilities.torch);
    };

    const getScreenshot = useCallback(() => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        const imageBase64 = cameraRef.current.getScreenshot();

        const filename = `receipt_${Date.now()}.png`;
        const file = FileUtils.base64ToFile(imageBase64 ?? '', filename);
        const source = URL.createObjectURL(file);
        IOU.setMoneyRequestReceipt(transactionID, source, file.name, action !== CONST.IOU.ACTION.EDIT);

        if (action === CONST.IOU.ACTION.EDIT) {
            updateScanAndNavigate(file, source);
            return;
        }

        navigateToConfirmationStep(file, source);
    }, [action, transactionID, updateScanAndNavigate, navigateToConfirmationStep, requestCameraPermission]);

    const clearTorchConstraints = useCallback(() => {
        if (!trackRef.current) {
            return;
        }
        trackRef.current.applyConstraints({
            // @ts-expect-error there is a type mismatch in typescipt types for MediaStreamTrack microsoft/TypeScript#39010
            advanced: [{torch: false}],
        });
    }, []);

    const capturePhoto = useCallback(() => {
        if (trackRef.current && isFlashLightOn) {
            trackRef.current
                .applyConstraints({
                    // @ts-expect-error there is a type mismatch in typescipt types for MediaStreamTrack microsoft/TypeScript#39010
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
                            src={Hand}
                            width={CONST.RECEIPT.HAND_ICON_WIDTH}
                            height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                            additionalStyles={[styles.pb5]}
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
                {cameraPermissionState === 'granted' && !isEmptyObject(videoConstraints) && (
                    <NavigationAwareCamera
                        onUserMedia={setupCameraPermissionsAndCapabilities}
                        onUserMediaError={() => setCameraPermissionState('denied')}
                        style={{...styles.videoContainer, display: cameraPermissionState !== 'granted' ? 'none' : 'block'}}
                        ref={cameraRef}
                        screenshotFormat="image/png"
                        videoConstraints={videoConstraints}
                        forceScreenshotSourceSize
                        cameraTabIndex={tabIndex}
                        audio={false}
                        disablePictureInPicture={false}
                        imageSmoothing={false}
                        mirrored={false}
                        screenshotQuality={0}
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
            <View onLayout={({nativeEvent}) => setReceiptImageTopPosition(PixelRatio.roundToNearestPixel(nativeEvent.layout.y))}>
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
                        const file = e?.dataTransfer?.files[0];
                        if (file) {
                            setReceiptAndNavigate(file);
                        }
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

IOURequestStepScan.displayName = 'IOURequestStepScan';

const IOURequestStepScanWithOnyx = withOnyx<Omit<IOURequestStepScanProps, 'user'>, Omit<IOURequestStepOnyxProps, 'user'>>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    skipConfirmation: {
        key: ({route}) => {
            const transactionID = route.params.transactionID ?? 0;
            return `${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`;
        },
    },
})(IOURequestStepScan);

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScanWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
