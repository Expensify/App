import {ActivityIndicator, Alert, Linking, View, Text} from 'react-native';
import React, {useRef, useState} from 'react';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {launchImageLibrary} from 'react-native-image-picker';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import Colors from '../../../styles/colors';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import styles from '../../../styles/styles';
import Shutter from '../../../../assets/images/shutter.svg';
import Hand from '../../../../assets/images/hand.svg';
import * as IOU from '../../../libs/actions/IOU';
import themeColors from '../../../styles/themes/default';
import reportPropTypes from '../../reportPropTypes';
import personalDetailsPropType from '../../personalDetailsPropType';
import CONST from '../../../CONST';
import {withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Button from '../../../components/Button';
import NavigateToNextIOUPage from '../NavigateToNextIOUPage';

const propTypes = {
    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                accountID: PropTypes.number,
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
    }),

    /**
     * Current user personal details
     */
    currentUserPersonalDetails: personalDetailsPropType,

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    report: {},
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
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
    const devices = useCameraDevices('wide-angle-camera');
    const device = devices.back;

    const camera = useRef(null);
    const [flash, setFlash] = useState(false);

    const [permissions, setPermissions] = useState('authorized');

    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    /**
     * Inform the users when they need to grant camera access and guide them to settings
     */
    const showPermissionsAlert = () => {
        Alert.alert(
            props.translate('attachmentPicker.cameraPermissionRequired'),
            props.translate('attachmentPicker.expensifyDoesntHaveAccessToCamera'),
            [
                {
                    text: props.translate('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: props.translate('common.settings'),
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
        Alert.alert(props.translate('attachmentPicker.attachmentError'), props.translate('attachmentPicker.errorWhileSelectingAttachment'));
    };

    const showCameraAlert = () => {
        Alert.alert(props.translate('receipt.cameraErrorTitle'), props.translate('receipt.cameraErrorMessage'));
    };

    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
     * @returns {Promise<ImagePickerResponse>}
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

    const takePhoto = () => {
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
                NavigateToNextIOUPage(props.iou, iouType, reportID, props.report, props.currentUserPersonalDetails);
            })
            .catch(() => {
                showCameraAlert();
            });
    };

    Camera.getCameraPermissionStatus().then((permissionStatus) => {
        setPermissions(permissionStatus);
    });

    const cameraComponent = () => (
        <Camera
            ref={camera}
            device={device}
            style={[styles.cameraView]}
            isActive
            photo
        />
    );

    const loadingComponent = () => (
        <View style={[styles.cameraView]}>
            <ActivityIndicator
                size="large"
                style={{flex: 1}}
                color={themeColors.textSupporting}
            />
        </View>
    );

    const permissionComponent = () => (
        <View style={[styles.cameraView, styles.permissionView]}>
            <Hand
                width={152}
                height={200}
                style={{paddingBottom: 20}}
            />
            <Text style={[styles.textReceiptUpload]}>{props.translate('receipt.takePhoto')}</Text>
            <Text style={[styles.subTextReceiptUpload]}>{props.translate('receipt.cameraAccess')}</Text>
            <PressableWithFeedback
                accessibilityLabel={props.translate('receipt.givePermission')}
                accessibilityRole="button"
            >
                <Button
                    medium
                    success
                    text={props.translate('receipt.givePermission')}
                    style={[styles.buttonReceiptUpload, {paddingTop: 20}]}
                    onPress={() => {
                        if (permissions === 'not-determined') {
                            Camera.requestCameraPermission().then((permissionStatus) => {
                                setPermissions(permissionStatus);
                            });
                        } else {
                            Linking.openSettings();
                        }
                    }}
                />
            </PressableWithFeedback>
        </View>
    );

    const getCameraView = () => {
        if (permissions !== CONST.RECEIPT.PERMISSION_AUTHORIZED) {
            return permissionComponent();
        }
        return device == null ? loadingComponent() : cameraComponent();
    };

    return (
        <View style={styles.flex1}>
            {getCameraView()}
            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter]}>
                <PressableWithFeedback
                    accessibilityRole="button"
                    accessibilityLabel={CONST.RECEIPT.GALLERY}
                    style={[styles.alignItemsStart]}
                    onPress={() => {
                        showImagePicker(launchImageLibrary).then((receiptImage) => {
                            IOU.setMoneyRequestReceipt(receiptImage[0].uri, receiptImage[0].fileName);
                            NavigateToNextIOUPage(props.iou, iouType, reportID, props.report, props.currentUserPersonalDetails);
                        });
                    }}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={Expensicons.Gallery}
                        fill={Colors.colorMuted}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    accessibilityRole="button"
                    accessibilityLabel={CONST.RECEIPT.SHUTTER}
                    style={[styles.alignItemsCenter]}
                    onPress={() => takePhoto()}
                >
                    <Shutter
                        width={90}
                        height={90}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    accessibilityRole="button"
                    accessibilityLabel={CONST.RECEIPT.FLASH}
                    style={[styles.alignItemsEnd]}
                    onPress={() => setFlash(!flash)}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={Expensicons.Bolt}
                        fill={flash ? Colors.white : Colors.colorMuted}
                    />
                </PressableWithFeedback>
            </View>
        </View>
    );
}

ReceiptSelector.defaultProps = defaultProps;
ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default withLocalize(ReceiptSelector);
