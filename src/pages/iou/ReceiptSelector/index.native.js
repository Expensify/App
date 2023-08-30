import {ActivityIndicator, Alert, AppState, Linking, Text, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {launchImageLibrary} from 'react-native-image-picker';
import {withOnyx} from 'react-native-onyx';
import {useIsFocused} from '@react-navigation/native';
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
import participantPropTypes from '../../../components/participantPropTypes';

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
    }).isRequired,

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        /** ID (iouType + reportID) of the request */
        id: PropTypes.string,

        /** Amount of the request */
        amount: PropTypes.number,

        /** Description of the request */
        comment: PropTypes.string,
        created: PropTypes.string,
        merchant: PropTypes.string,

        /** List of the participants */
        participants: PropTypes.arrayOf(participantPropTypes),
    }),
};

const defaultProps = {
    report: {},
    iou: {
        id: '',
        amount: 0,
        merchant: '',
        created: '',
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
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

function ReceiptSelector(props) {
    const devices = useCameraDevices();
    const device = devices.back;

    const camera = useRef(null);
    const [flash, setFlash] = useState(false);
    const [permissions, setPermissions] = useState('authorized');
    const appState = useRef(AppState.currentState);

    const iouType = lodashGet(props.route, 'params.iouType', '');
    const reportID = lodashGet(props.route, 'params.reportID', '');

    const {translate} = useLocalize();
    // Keep track of whether the camera is visible, when we navigate elsewhere, turn off the camera
    const isFocused = useIsFocused();

    // We want to listen to if the app has come back from background and refresh the permissions status to show camera when permissions were granted
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                Camera.getCameraPermissionStatus().then((permissionStatus) => {
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
        if (permissions === 'not-determined') {
            Camera.requestCameraPermission().then((permissionStatus) => {
                setPermissions(permissionStatus);
            });
        } else {
            Linking.openSettings();
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
                IOU.setMoneyRequestReceipt(`file://${photo.path}`, photo.path);
                IOU.navigateToNextPage(props.iou, iouType, reportID, props.report);
            })
            .catch(() => {
                showCameraAlert();
            });
    }, [flash, iouType, props.iou, props.report, reportID, translate]);

    Camera.getCameraPermissionStatus().then((permissionStatus) => {
        setPermissions(permissionStatus);
    });

    return (
        <View style={styles.flex1}>
            {permissions !== CONST.RECEIPT.PERMISSION_AUTHORIZED && (
                <View style={[styles.cameraView, styles.permissionView]}>
                    <Hand
                        width={CONST.RECEIPT.HAND_ICON_WIDTH}
                        height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                        style={[styles.pb5]}
                    />
                    <Text style={[styles.textReceiptUpload]}>{translate('receipt.takePhoto')}</Text>
                    <Text style={[styles.subTextReceiptUpload]}>{translate('receipt.cameraAccess')}</Text>
                    <PressableWithFeedback
                        accessibilityLabel={translate('receipt.givePermission')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    >
                        <Button
                            medium
                            success
                            text={translate('receipt.givePermission')}
                            style={[styles.p9, styles.pt5]}
                            onPress={askForPermissions}
                        />
                    </PressableWithFeedback>
                </View>
            )}
            {permissions === CONST.RECEIPT.PERMISSION_AUTHORIZED && device == null && (
                <View style={[styles.cameraView]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={themeColors.textSupporting}
                    />
                </View>
            )}
            {permissions === CONST.RECEIPT.PERMISSION_AUTHORIZED && device != null && (
                <Camera
                    ref={camera}
                    device={device}
                    style={[styles.cameraView]}
                    zoom={device.neutralZoom}
                    isActive={isFocused}
                    photo
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
                                IOU.setMoneyRequestReceipt(receiptImage[0].uri, receiptImage[0].fileName);
                                IOU.navigateToNextPage(props.iou, iouType, reportID, props.report);
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
