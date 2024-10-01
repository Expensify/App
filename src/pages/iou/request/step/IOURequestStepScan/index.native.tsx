import {useFocusEffect} from '@react-navigation/core';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Alert, AppState, InteractionManager, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useOnyx, withOnyx} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import type {Camera, PhotoFile, Point} from 'react-native-vision-camera';
import {useCameraDevice} from 'react-native-vision-camera';
import type {TupleToUnion} from 'type-fest';
import Hand from '@assets/images/hand.svg';
import Shutter from '@assets/images/shutter.svg';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import PDFThumbnail from '@components/PDFThumbnail';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getCurrentPosition from '@libs/getCurrentPosition';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Receipt} from '@src/types/onyx/Transaction';
import CameraPermission from './CameraPermission';
import NavigationAwareCamera from './NavigationAwareCamera/Camera';
import type {IOURequestStepOnyxProps, IOURequestStepScanProps} from './types';

function IOURequestStepScan({
    report,
    policy,
    user,
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
    },
    transaction,
    personalDetails,
    currentUserPersonalDetails,
    skipConfirmation,
}: IOURequestStepScanProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const device = useCameraDevice('back', {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const hasFlash = !!device?.hasFlash;
    const camera = useRef<Camera>(null);
    const [flash, setFlash] = useState(false);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID ?? -1}`);
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const [didCapturePhoto, setDidCapturePhoto] = useState(false);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

    const [pdfFile, setPdfFile] = useState<null | FileObject>(null);

    const defaultTaxCode = TransactionUtils.getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return (
            !ReportUtils.isArchivedRoom(report, reportNameValuePairs) && !(ReportUtils.isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)))
        );
    }, [report, skipConfirmation, policy, reportNameValuePairs]);

    const {translate} = useLocalize();

    const askForPermissions = () => {
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
        CameraPermission.requestCameraPermission?.()
            .then((status: string) => {
                setCameraPermissionStatus(status);

                if (status === RESULTS.BLOCKED) {
                    FileUtils.showCameraPermissionsAlert();
                }
            })
            .catch(() => {
                setCameraPermissionStatus(RESULTS.UNAVAILABLE);
            });
    };

    const focusIndicatorOpacity = useSharedValue(0);
    const focusIndicatorScale = useSharedValue(2);
    const focusIndicatorPosition = useSharedValue({x: 0, y: 0});

    const cameraFocusIndicatorAnimatedStyle = useAnimatedStyle(() => ({
        opacity: focusIndicatorOpacity.value,
        transform: [{translateX: focusIndicatorPosition.value.x}, {translateY: focusIndicatorPosition.value.y}, {scale: focusIndicatorScale.value}],
    }));

    const focusCamera = (point: Point) => {
        if (!camera.current) {
            return;
        }

        camera.current.focus(point).catch((error: Record<string, unknown>) => {
            if (error.message === '[unknown/unknown] Cancelled by another startFocusAndMetering()') {
                return;
            }
            Log.warn('Error focusing camera', error);
        });
    };

    const tapGesture = Gesture.Tap()
        .enabled(device?.supportsFocus ?? false)
        .onStart((ev: {x: number; y: number}) => {
            const point = {x: ev.x, y: ev.y};

            // eslint-disable-next-line react-compiler/react-compiler
            focusIndicatorOpacity.value = withSequence(withTiming(0.8, {duration: 250}), withDelay(1000, withTiming(0, {duration: 250})));
            focusIndicatorScale.value = 2;
            focusIndicatorScale.value = withSpring(1, {damping: 10, stiffness: 200});
            focusIndicatorPosition.value = point;

            runOnJS(focusCamera)(point);
        });

    useFocusEffect(
        useCallback(() => {
            setDidCapturePhoto(false);
            const refreshCameraPermissionStatus = () => {
                CameraPermission?.getCameraPermissionStatus?.()
                    .then(setCameraPermissionStatus)
                    .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));
            };

            InteractionManager.runAfterInteractions(() => {
                // Check initial camera permission status
                refreshCameraPermissionStatus();
            });

            // Refresh permission status when app gain focus
            const subscription = AppState.addEventListener('change', (appState) => {
                if (appState !== 'active') {
                    return;
                }

                refreshCameraPermissionStatus();
            });

            return () => {
                subscription.remove();
            };
        }, []),
    );

    const validateReceipt = (file: FileObject) => {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(file?.name ?? '');
        if (
            !CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(
                fileExtension.toLowerCase() as TupleToUnion<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>,
            )
        ) {
            Alert.alert(translate('attachmentPicker.wrongFileType'), translate('attachmentPicker.notAllowedExtension'));
            return false;
        }

        if (!Str.isImage(file.name ?? '') && (file?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            Alert.alert(translate('attachmentPicker.attachmentTooLarge'), translate('attachmentPicker.sizeExceeded'));
            return false;
        }

        if ((file?.size ?? 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            Alert.alert(translate('attachmentPicker.attachmentTooSmall'), translate('attachmentPicker.sizeNotMet'));
            return false;
        }
        return true;
    };

    const navigateBack = () => {
        Navigation.goBack();
    };

    const navigateToParticipantPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
        }
    }, [iouType, reportID, transactionID]);

    const navigateToConfirmationPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
        }
    }, [iouType, reportID, transactionID]);

    const navigateToConfirmationStep = useCallback(
        (file: FileObject, source: string) => {
            if (backTo) {
                Navigation.goBack(backTo);
                return;
            }

            // If the transaction was created from the global create, the person needs to select participants, so take them there.
            if (transaction?.isFromGlobalCreate && iouType !== CONST.IOU.TYPE.TRACK && !report?.reportID) {
                navigateToParticipantPage();
                return;
            }

            // If the transaction was created from the + menu from the composer inside of a chat, the participants can automatically
            // be added to the transaction (taken from the chat report participants) and then the person is taken to the confirmation step.
            const selectedParticipants = IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? -1;
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
                        currentUserAccountID: currentUserPersonalDetails?.accountID ?? -1,
                        comment: '',
                        receipt,
                        existingSplitChatReportID: reportID ?? -1,
                        billable: false,
                        category: '',
                        tag: '',
                        currency: transaction?.currency ?? 'USD',
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                    return;
                }
                getCurrentPosition(
                    (successData) => {
                        if (iouType === CONST.IOU.TYPE.TRACK && report) {
                            IOU.trackExpense(
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
                                '',
                                '',
                                '',
                                0,
                                false,
                                policy,
                                {},
                                {},
                                {
                                    lat: successData.coords.latitude,
                                    long: successData.coords.longitude,
                                },
                            );
                        } else {
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
                                '',
                                '',
                                '',
                                0,
                                false,
                                policy,
                                {},
                                {},
                                {
                                    lat: successData.coords.latitude,
                                    long: successData.coords.longitude,
                                },
                            );
                        }
                    },
                    (errorData) => {
                        Log.info('[IOURequestStepScan] getCurrentPosition failed', false, errorData);
                        // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                        if (iouType === CONST.IOU.TYPE.TRACK && report) {
                            IOU.trackExpense(
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
                        } else {
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
                        }
                    },
                    {
                        maximumAge: CONST.GPS.MAX_AGE,
                        timeout: CONST.GPS.TIMEOUT,
                    },
                );
                return;
            }
            navigateToConfirmationPage();
        },
        [
            iouType,
            report,
            reportID,
            transactionID,
            backTo,
            currentUserPersonalDetails,
            personalDetails,
            shouldSkipConfirmation,
            transaction,
            navigateToConfirmationPage,
            navigateToParticipantPage,
            policy,
            transactionTaxCode,
            transactionTaxAmount,
        ],
    );

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            navigateBack();
            IOU.replaceReceipt(transactionID, file as File, source);
        },
        [transactionID],
    );

    /**
     * Sets the Receipt objects and navigates the user to the next page
     */
    const setReceiptAndNavigate = (originalFile: FileObject, isPdfValidated?: boolean) => {
        if (!validateReceipt(originalFile)) {
            return;
        }

        // If we have a pdf file and if it is not validated then set the pdf file for validation and return
        if (Str.isPDF(originalFile.name ?? '') && !isPdfValidated) {
            setPdfFile(originalFile);
            return;
        }

        // With the image size > 24MB, we use manipulateAsync to resize the image.
        // It takes a long time so we should display a loading indicator while the resize image progresses.
        if (Str.isImage(originalFile.name ?? '') && (originalFile?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            setIsLoadingReceipt(true);
        }
        FileUtils.resizeImageIfNeeded(originalFile).then((file) => {
            setIsLoadingReceipt(false);
            // Store the receipt on the transaction object in Onyx
            // On Android devices, fetching blob for a file with name containing spaces fails to retrieve the type of file.
            // So, let us also save the file type in receipt for later use during blob fetch
            IOU.setMoneyRequestReceipt(transactionID, file?.uri ?? '', file.name ?? '', !isEditing, file.type);

            if (isEditing) {
                updateScanAndNavigate(file, file?.uri ?? '');
                return;
            }

            navigateToConfirmationStep(file, file.uri ?? '');
        });
    };

    const capturePhoto = useCallback(() => {
        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            showCameraAlert();
        }

        if (didCapturePhoto) {
            return;
        }

        camera?.current
            ?.takePhoto({
                flash: flash && hasFlash ? 'on' : 'off',
                enableShutterSound: !user?.isMutedAllSounds,
            })
            .then((photo: PhotoFile) => {
                // Store the receipt on the transaction object in Onyx
                const source = getPhotoSource(photo.path);
                IOU.setMoneyRequestReceipt(transactionID, source, photo.path, !isEditing);

                FileUtils.readFileAsync(source, photo.path, (file) => {
                    if (isEditing) {
                        updateScanAndNavigate(file, source);
                        return;
                    }
                    setDidCapturePhoto(true);
                    navigateToConfirmationStep(file, source);
                });
            })
            .catch((error: string) => {
                setDidCapturePhoto(false);
                showCameraAlert();
                Log.warn('Error taking photo', error);
            });
    }, [isEditing, cameraPermissionStatus, didCapturePhoto, flash, hasFlash, user?.isMutedAllSounds, translate, transactionID, navigateToConfirmationStep, updateScanAndNavigate]);

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
            testID={IOURequestStepScan.displayName}
        >
            {isLoadingReceipt && <FullScreenLoadingIndicator />}
            {pdfFile && (
                <PDFThumbnail
                    style={styles.invisiblePDF}
                    previewSourceURL={pdfFile?.uri ?? ''}
                    onLoadSuccess={() => {
                        setPdfFile(null);
                        if (pdfFile) {
                            setReceiptAndNavigate(pdfFile, true);
                        }
                    }}
                    onPassword={() => {
                        setPdfFile(null);
                        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.protectedPDFNotSupported'));
                    }}
                    onLoadError={() => {
                        setPdfFile(null);
                        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                    }}
                />
            )}
            {cameraPermissionStatus !== RESULTS.GRANTED && (
                <View style={[styles.cameraView, styles.permissionView, styles.userSelectNone]}>
                    <ImageSVG
                        contentFit="contain"
                        src={Hand}
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
                    />
                </View>
            )}
            {cameraPermissionStatus === RESULTS.GRANTED && device == null && (
                <View style={[styles.cameraView]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.textSupporting}
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
                                orientation="portrait"
                            />
                            <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                        </View>
                    </GestureDetector>
                </View>
            )}
            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                <AttachmentPicker>
                    {({openPicker}) => (
                        <PressableWithFeedback
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('receipt.gallery')}
                            style={[styles.alignItemsStart]}
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
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.shutter')}
                    style={[styles.alignItemsCenter]}
                    onPress={capturePhoto}
                >
                    <ImageSVG
                        contentFit="contain"
                        src={Shutter}
                        width={CONST.RECEIPT.SHUTTER_SIZE}
                        height={CONST.RECEIPT.SHUTTER_SIZE}
                    />
                </PressableWithFeedback>
                {hasFlash && (
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        style={[styles.alignItemsEnd]}
                        disabled={cameraPermissionStatus !== RESULTS.GRANTED}
                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                    >
                        <Icon
                            height={32}
                            width={32}
                            src={Expensicons.Bolt}
                            fill={flash ? theme.iconHovered : theme.textSupporting}
                        />
                    </PressableWithFeedback>
                )}
            </View>
        </StepScreenWrapper>
    );
}

IOURequestStepScan.displayName = 'IOURequestStepScan';

const IOURequestStepScanWithOnyx = withOnyx<IOURequestStepScanProps, IOURequestStepOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '-1'}`,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    skipConfirmation: {
        key: ({route}) => {
            const transactionID = route.params.transactionID ?? -1;
            return `${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`;
        },
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(IOURequestStepScan);

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScanWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
