import {ActivityIndicator, Alert, AppState, Linking, Text, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useCameraDevices} from 'react-native-vision-camera';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {launchImageLibrary} from 'react-native-image-picker';
import {withOnyx} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import styles from '../../../styles/styles';
import Shutter from '../../../../assets/images/shutter.svg';
import Hand from '../../../../assets/images/hand.svg';
import * as IOU from '../../../libs/actions/IOU';
import themeColors from '../../../styles/themes/default';
import reportPropTypes from '../../reportPropTypes';
import CONST from '../../../CONST';
import Button from '../../../components/Button';
import useLocalize from '../../../hooks/useLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import Log from '../../../libs/Log';
import * as CameraPermission from './CameraPermission';
import {iouPropTypes, iouDefaultProps} from '../propTypes';
import NavigationAwareCamera from './NavigationAwareCamera';
import Navigation from '../../../libs/Navigation/Navigation';
import * as FileUtils from '../../../libs/fileDownload/FileUtils';
import TabNavigationAwareCamera from './TabNavigationAwareCamera';

const propTypes = {
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

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** The id of the transaction we're editing */
    transactionID: PropTypes.string,

    /** Whether or not the receipt selector is in a tab navigator for tab animations */
    isInTabNavigator: PropTypes.bool,
};

const defaultProps = {
    report: {},
    iou: iouDefaultProps,
    transactionID: '',
    isInTabNavigator: true,
};

/**
 * See https://github.com/react-native-image-picker/react-native-image-picker/#options
 * for ImagePicker configuration options
 */
const imagePickerOptions = {
    includeBase64: false,
    saveToPhotos: false,
    selectionLimit: 1,
    includeExtra: false,
};

/**
 * Return imagePickerOptions based on the type
 * @param {String} type
 * @returns {Object}
 */
function getImagePickerOptions(type) {
    // mediaType property is one of the ImagePicker configuration to restrict types'
    const mediaType = type === CONST.ATTACHMENT_PICKER_TYPE.IMAGE ? 'photo' : 'mixed';
    return {
        mediaType,
        ...imagePickerOptions,
    };
}

function ReceiptSelector({route, report, iou, transactionID, isInTabNavigator}) {
    const devices = useCameraDevices('wide-angle-camera');
    const device = devices.back;

    const camera = useRef(null);
    const [flash, setFlash] = useState(false);
    const [permissions, setPermissions] = useState('granted');
    const isAndroidBlockedPermissionRef = useRef(false);
    const appState = useRef(AppState.currentState);

    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const pageIndex = lodashGet(route, 'params.pageIndex', 1);

    const {translate} = useLocalize();

    const CameraComponent = isInTabNavigator ? TabNavigationAwareCamera : NavigationAwareCamera;

    // We want to listen to if the app has come back from background and refresh the permissions status to show camera when permissions were granted
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                CameraPermission.getCameraPermissionStatus().then((permissionStatus) => {
                    setPermissions(permissionStatus);
                });
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    /**
     * Inform the users when they need to grant camera access and guide them to settings
     */
    const showPermissionsAlert = () => {
        Alert.alert(
            translate('attachmentPicker.cameraPermissionRequired'),
            translate('attachmentPicker.expensifyDoesntHaveAccessToCamera'),
            [
                {
                    text: translate('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: translate('common.settings'),
                    onPress: () => Linking.openSettings(),
                },
            ],
            {cancelable: false},
        );
    };

    /**
     * A generic handling when we don't know the exact reason for an error
     *
     */
    const showGeneralAlert = () => {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingAttachment'));
    };

    const askForPermissions = () => {
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
        if (permissions === RESULTS.BLOCKED || isAndroidBlockedPermissionRef.current) {
            Linking.openSettings();
        } else if (permissions === RESULTS.DENIED) {
            CameraPermission.requestCameraPermission().then((permissionStatus) => {
                setPermissions(permissionStatus);
                isAndroidBlockedPermissionRef.current = permissionStatus === RESULTS.BLOCKED;
            });
        }
    };

    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
     * @returns {Promise}
     */
    const showImagePicker = (imagePickerFunc) =>
        new Promise((resolve, reject) => {
            imagePickerFunc(getImagePickerOptions(CONST.ATTACHMENT_PICKER_TYPE.IMAGE), (response) => {
                if (response.didCancel) {
                    // When the user cancelled resolve with no attachment
                    return resolve();
                }
                if (response.errorCode) {
                    switch (response.errorCode) {
                        case 'permission':
                            showPermissionsAlert();
                            return resolve();
                        default:
                            showGeneralAlert();
                            break;
                    }

                    return reject(new Error(`Error during attachment selection: ${response.errorMessage}`));
                }

                return resolve(response.assets);
            });
        });

    const takePhoto = useCallback(() => {
        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            showCameraAlert();
            return;
        }

        camera.current
            .takePhoto({
                qualityPrioritization: 'speed',
                flash: flash ? 'on' : 'off',
            })
            .then((photo) => {
                const filePath = `file://${photo.path}`;
                IOU.setMoneyRequestReceipt(filePath, photo.path);

                if (transactionID) {
                    FileUtils.readFileAsync(filePath, photo.path).then((receipt) => {
                        IOU.replaceReceipt(transactionID, receipt, filePath);
                    });

                    Navigation.dismissModal();
                    return;
                }

                IOU.navigateToNextPage(iou, iouType, reportID, report, route.path);
            })
            .catch((error) => {
                showCameraAlert();
                Log.warn('Error taking photo', error);
            });
    }, [flash, iouType, iou, report, reportID, translate, transactionID, route.path]);

    CameraPermission.getCameraPermissionStatus().then((permissionStatus) => {
        setPermissions(permissionStatus);
    });

    return (
        <View style={styles.flex1}>
            {permissions !== RESULTS.GRANTED && (
                <View style={[styles.cameraView, styles.permissionView]}>
                    <Hand
                        width={CONST.RECEIPT.HAND_ICON_WIDTH}
                        height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                        style={[styles.pb5]}
                    />
                    <Text style={[styles.textReceiptUpload]}>{translate('receipt.takePhoto')}</Text>
                    <Text style={[styles.subTextReceiptUpload]}>{translate('receipt.cameraAccess')}</Text>
                    <Button
                        medium
                        success
                        text={translate('receipt.givePermission')}
                        accessibilityLabel={translate('receipt.givePermission')}
                        style={[styles.p9, styles.pt5]}
                        onPress={askForPermissions}
                    />
                </View>
            )}
            {permissions === RESULTS.GRANTED && device == null && (
                <View style={[styles.cameraView]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={themeColors.textSupporting}
                    />
                </View>
            )}
            {permissions === RESULTS.GRANTED && device != null && (
                <CameraComponent
                    ref={camera}
                    device={device}
                    style={[styles.cameraView]}
                    zoom={device.neutralZoom}
                    photo
                    cameraTabIndex={pageIndex}
                />
            )}
            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                <PressableWithFeedback
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.gallery')}
                    style={[styles.alignItemsStart]}
                    onPress={() => {
                        showImagePicker(launchImageLibrary)
                            .then((receiptImage) => {
                                const filePath = receiptImage[0].uri;
                                IOU.setMoneyRequestReceipt(filePath, receiptImage[0].fileName);

                                if (transactionID) {
                                    FileUtils.readFileAsync(filePath, receiptImage[0].fileName).then((receipt) => {
                                        IOU.replaceReceipt(transactionID, receipt, filePath);
                                    });
                                    Navigation.dismissModal();
                                    return;
                                }

                                IOU.navigateToNextPage(iou, iouType, report, route.path);
                            })
                            .catch(() => {
                                Log.info('User did not select an image from gallery');
                            });
                    }}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={Expensicons.Gallery}
                        fill={themeColors.textSupporting}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.shutter')}
                    style={[styles.alignItemsCenter]}
                    onPress={takePhoto}
                >
                    <Shutter
                        width={CONST.RECEIPT.SHUTTER_SIZE}
                        height={CONST.RECEIPT.SHUTTER_SIZE}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.flash')}
                    style={[styles.alignItemsEnd]}
                    onPress={() => setFlash((prevFlash) => !prevFlash)}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={Expensicons.Bolt}
                        fill={flash ? themeColors.iconHovered : themeColors.textSupporting}
                    />
                </PressableWithFeedback>
            </View>
        </View>
    );
}

ReceiptSelector.defaultProps = defaultProps;
ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(ReceiptSelector);
