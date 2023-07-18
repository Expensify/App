import {ActivityIndicator, Alert, Linking, View} from 'react-native';
import React, {useRef, useState} from 'react';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {launchImageLibrary} from 'react-native-image-picker';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import Colors from '../../../styles/colors';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import styles from '../../../styles/styles';
import Shutter from '../../../../assets/images/shutter.svg';
import * as IOU from '../../../libs/actions/IOU';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as ReportUtils from '../../../libs/ReportUtils';
import themeColors from '../../../styles/themes/default';
import reportPropTypes from '../../reportPropTypes';
import personalDetailsPropType from '../../personalDetailsPropType';
import CONST from '../../../CONST';
import {withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

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
    const devices = useCameraDevices();
    const device = devices.back;
    const camera = useRef(null);
    const [flash, setFlash] = useState(false);

    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const navigateToNextPage = () => {
        const moneyRequestID = `${iouType.current}${reportID.current}`;
        const shouldReset = props.iou.id !== moneyRequestID;
        // If the money request ID in Onyx does not match the ID from params, we want to start a new request
        // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
        if (shouldReset) {
            IOU.setMoneyRequestId(moneyRequestID);
            IOU.setMoneyRequestDescription('');
            IOU.setMoneyRequestParticipants([]);
            IOU.setMoneyRequestReceipt({});
        }

        // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
        if (props.report.reportID) {
            // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
            if (_.isEmpty(props.iou.participants) || shouldReset) {
                const currentUserAccountID = props.currentUserPersonalDetails.accountID;
                const participants = ReportUtils.isPolicyExpenseChat(props.report)
                    ? [{reportID: props.report.reportID, isPolicyExpenseChat: true, selected: true}]
                    : _.chain(props.report.participantAccountIDs)
                          .filter((accountID) => currentUserAccountID !== accountID)
                          .map((accountID) => ({accountID, selected: true}))
                          .value();
                IOU.setMoneyRequestParticipants(participants);
            }
            Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
            return;
        }
        Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(iouType.current));
    };

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

    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
     * @returns {Promise<ImagePickerResponse>}
     */
    const showImagePicker = (imagePickerFunc) => {
        return new Promise((resolve, reject) => {
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
    };

    const takePhoto = () => {
        camera.current
            .takePhoto({
                qualityPrioritization: 'speed',
                flash: flash ? 'on' : 'off',
            })
            .then((photo) => {
                IOU.setMoneyRequestReceipt(`file://${photo.path}`);
                navigateToNextPage();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    if (device == null) {
        return (
            <View style={[styles.flex1]}>
                <View
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        padding: 10,
                        borderRadius: 28,
                        borderStyle: 'solid',
                        borderWidth: 8,
                        borderColor: Colors.greenAppBackground,
                        backgroundColor: Colors.greenHighlightBackground,
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator
                        size="large"
                        style={{flex: 1}}
                        color={themeColors.textSupporting}
                    />
                </View>
                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter]}>
                    <PressableWithFeedback
                        accessibilityRole="button"
                        style={[styles.alignItemsStart]}
                        onPress={() => {
                            showImagePicker(launchImageLibrary).then((receiptImage) => {
                                IOU.setMoneyRequestReceipt(receiptImage[0].uri);
                                navigateToNextPage();
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
                        style={[styles.alignItemsCenter]}
                    >
                        <Shutter
                            width={90}
                            height={90}
                        />
                    </PressableWithFeedback>
                    <PressableWithFeedback
                        accessibilityRole="button"
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

    return (
        <View style={styles.flex1}>
            <Camera
                ref={camera}
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    padding: 10,
                    borderRadius: 28,
                    borderStyle: 'solid',
                    borderWidth: 8,
                    backgroundColor: Colors.greenHighlightBackground,
                    borderColor: Colors.greenAppBackground,
                }}
                device={device}
                isActive
                photo
            />
            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter]}>
                <PressableWithFeedback
                    accessibilityRole="button"
                    style={[styles.alignItemsStart]}
                    onPress={() => {
                        showImagePicker(launchImageLibrary).then((receiptImage) => {
                            IOU.setMoneyRequestReceipt(receiptImage[0].uri);
                            navigateToNextPage();
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
