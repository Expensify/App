import {useFocusEffect} from '@react-navigation/core';
import lodashGet from 'lodash/get';
import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, Alert, AppState, InteractionManager, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import {useCameraDevices} from 'react-native-vision-camera';
import Hand from '@assets/images/hand.svg';
import Shutter from '@assets/images/shutter.svg';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import IOURequestStepRoutePropTypes from '@pages/iou/request/step/IOURequestStepRoutePropTypes';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import * as CameraPermission from './CameraPermission';
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
    const devices = useCameraDevices('wide-angle-camera');
    const device = devices.back;

    const camera = useRef(null);
    const [flash, setFlash] = useState(false);
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState(undefined);

    const {translate} = useLocalize();

    const askForPermissions = () => {
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
        CameraPermission.requestCameraPermission()
            .then((status) => {
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

    const focusCamera = (point) => {
        if (!camera.current) {
            return;
        }

        camera.current.focus(point).catch((ex) => {
            if (ex.message === '[unknown/unknown] Cancelled by another startFocusAndMetering()') {
                return;
            }
            Log.warn('Error focusing camera', ex);
        });
    };

    const tapGesture = Gesture.Tap()
        .enabled(device && device.supportsFocus)
        .onStart((ev) => {
            const point = {x: ev.x, y: ev.y};

            focusIndicatorOpacity.value = withSequence(withTiming(0.8, {duration: 250}), withDelay(1000, withTiming(0, {duration: 250})));
            focusIndicatorScale.value = 2;
            focusIndicatorScale.value = withSpring(1, {damping: 10, stiffness: 200});
            focusIndicatorPosition.value = point;

            runOnJS(focusCamera)(point);
        });

    useFocusEffect(
        useCallback(() => {
            const refreshCameraPermissionStatus = () => {
                CameraPermission.getCameraPermissionStatus()
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

    const validateReceipt = (file) => {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(file, 'name', ''));
        if (!CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(fileExtension.toLowerCase())) {
            Alert.alert(translate('attachmentPicker.wrongFileType'), translate('attachmentPicker.notAllowedExtension'));
            return false;
        }

        if (lodashGet(file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            Alert.alert(translate('attachmentPicker.attachmentTooLarge'), translate('attachmentPicker.sizeExceeded'));
            return false;
        }

        if (lodashGet(file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            Alert.alert(translate('attachmentPicker.attachmentTooSmall'), translate('attachmentPicker.sizeNotMet'));
            return false;
        }
        return true;
    };

    const navigateBack = () => {
        Navigation.goBack();
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
            Navigation.dismissModal();
            IOU.replaceReceipt(transactionID, file, source);
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
        // On Android devices, fetching blob for a file with name containing spaces fails to retrieve the type of file.
        // So, let us also save the file type in receipt for later use during blob fetch
        IOU.setMoneyRequestReceipt(transactionID, file.uri, file.name, action !== CONST.IOU.ACTION.EDIT, file.type);

        if (action === CONST.IOU.ACTION.EDIT) {
            updateScanAndNavigate(file, file.uri);
            return;
        }

        navigateToConfirmationStep();
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
            return;
        }

        return camera.current
            .takePhoto({
                qualityPrioritization: 'speed',
                flash: flash ? 'on' : 'off',
            })
            .then((photo) => {
                // Store the receipt on the transaction object in Onyx
                const source = `file://${photo.path}`;
                IOU.setMoneyRequestReceipt(transactionID, source, photo.path, action !== CONST.IOU.ACTION.EDIT);

                if (action === CONST.IOU.ACTION.EDIT) {
                    FileUtils.readFileAsync(source, photo.path, (file) => {
                        updateScanAndNavigate(file, source);
                    });
                    return;
                }

                navigateToConfirmationStep();
            })
            .catch((error) => {
                showCameraAlert();
                Log.warn('Error taking photo', error);
            });
    }, [flash, action, translate, transactionID, updateScanAndNavigate, navigateToConfirmationStep, cameraPermissionStatus]);

    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }

    return (
        <StepScreenWrapper
            includeSafeAreaPaddingBottom
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={Boolean(backTo)}
            testID={IOURequestStepScan.displayName}
        >
            {cameraPermissionStatus !== RESULTS.GRANTED && (
                <View style={[styles.cameraView, styles.permissionView, styles.userSelectNone]}>
                    <ImageSVG
                        contentFit="contain"
                        src={Hand}
                        width={CONST.RECEIPT.HAND_ICON_WIDTH}
                        height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                        style={styles.pb5}
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
                                style={[styles.flex1]}
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
                <AttachmentPicker shouldHideCameraOption>
                    {({openPicker}) => (
                        <PressableWithFeedback
                            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                <PressableWithFeedback
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
            </View>
        </StepScreenWrapper>
    );
}

IOURequestStepScan.defaultProps = defaultProps;
IOURequestStepScan.propTypes = propTypes;
IOURequestStepScan.displayName = 'IOURequestStepScan';

export default compose(withWritableReportOrNotFound, withFullTransactionOrNotFound)(IOURequestStepScan);
