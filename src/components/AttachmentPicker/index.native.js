/**
 * The react native image/document pickers work for iOS/Android, but we want to wrap them both within AttachmentPicker
 */
import React, {Component} from 'react';
import {Alert, Linking, View} from 'react-native';
import RNImagePicker from 'react-native-image-picker';
import RNDocumentPicker from 'react-native-document-picker';
import basePropTypes from './AttachmentPickerPropTypes';
import styles from '../../styles/styles';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import {Camera, Gallery, Paperclip} from '../Icon/Expensicons';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    ...basePropTypes,
    ...windowDimensionsPropTypes,
};

/**
 * See https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md#options
 * for ImagePicker configuration options
 */
const imagePickerOptions = {
    storageOptions: {
        skipBackup: true,
    },
};

/**
 * See https://github.com/rnmods/react-native-document-picker#options for DocumentPicker configuration options
 */
const documentPickerOptions = {
    type: [RNDocumentPicker.types.allFiles],
};

/**
 * Inform the users when they need to grant camera access and guide them to settings
 */
function showPermissionsAlert() {
    Alert.alert(
        'Camera Permission Required',
        'Expensify.cash does not have access to your camera, please enable the permission and try again.',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Settings',
                onPress: () => Linking.openSettings(),
            },
        ],
        {cancelable: false},
    );
}

/**
 * A generic handling when we don't know the exact reason for an error
 *
 */
function showGeneralAlert() {
    Alert.alert(
        'Attachment Error',
        'An error occurred while selecting an attachment, please try again',
    );
}

/**
 * Launch the DocumentPicker. Results are in the same format as ImagePicker
 *
 * @returns {Promise<DocumentPickerResponse>}
 */
function showDocumentPicker() {
    return RNDocumentPicker.pick(documentPickerOptions).catch((error) => {
        if (!RNDocumentPicker.isCancel(error)) {
            showGeneralAlert(error.message);
            throw error;
        }
    });
}

/**
 * Common image picker handling
 *
 * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
 * @returns {Promise<ImagePickerResponse>}
 */
function showImagePicker(imagePickerFunc) {
    return new Promise((resolve, reject) => {
        imagePickerFunc(imagePickerOptions, (response) => {
            if (response.error) {
                switch (response.error) {
                    case 'Camera permissions not granted':
                    case 'Permissions weren\'t granted':
                        showPermissionsAlert();
                        break;
                    default:
                        showGeneralAlert(response.error);
                        break;
                }

                reject(new Error(`Error during attachment selection: ${response.error}`));
            }

            resolve(response);
        });
    });
}

/**
 * The data returned from `show` is different on web and mobile, so use this function to ensure the data we
 * send to the xhr will be handled properly.
 *
 * @param {Object} fileData
 * @return {Object}
 */
function getDataForUpload(fileData) {
    return {
        name: fileData.fileName || 'chat_attachment',
        type: fileData.type,
        uri: fileData.uri,
    };
}

/**
 * This component renders a function as a child and
 * returns a "show attachment picker" method that takes
 * a callback. This is the ios/android implementation
 * opening a modal with attachment options
 */
class AttachmentPicker extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            isVisible: false,
            onPicked: () => {},
        };

        this.menuItemData = [
            {
                icon: Camera,
                text: 'Take Photo',
                pickAttachment: () => showImagePicker(RNImagePicker.launchCamera),
            },
            {
                icon: Gallery,
                text: 'Choose from Gallery',
                pickAttachment: () => showImagePicker(RNImagePicker.launchImageLibrary),
            },
            {
                icon: Paperclip,
                text: 'Choose Document',
                pickAttachment: showDocumentPicker,
            },
        ];

        this.close = this.close.bind(this);
        this.pickAttachment = this.pickAttachment.bind(this);
    }

    /**
     * Handles the image/document picker result and
     * sends the selected attachment to the caller (parent component)
     *
     * @param {ImagePickerResponse|DocumentPickerResponse} attachment
     */
    pickAttachment(attachment) {
        if (attachment && !attachment.didCancel && !attachment.error) {
            const result = getDataForUpload(attachment);
            this.state.onPicked(result);
        }
    }

    /**
     * Opens the attachment modal
     *
     * @param {function} onPicked A callback that will be called with the selected attachment
     */
    open(onPicked) {
        this.setState({
            isVisible: true,
            onPicked,
        });
    }

    /**
     * Closes the attachment modal
     */
    close() {
        this.setState({isVisible: false});
    }

    /**
     * Setup native attachment selection to start after this popover closes
     *
     * @param {{pickAttachment: function}} item - an item from this.menuItemData
     */
    selectItem(item) {
        /* setTimeout delays execution to the frame after the modal closes
        * without this on iOS closing the modal closes the gallery/camera as well */
        this.onModalHide = () => setTimeout(
            () => item.pickAttachment()
                .then(this.pickAttachment)
                .catch(console.error)
                .finally(() => delete this.onModalHide),
            10,
        );

        this.close();
    }

    /**
     * Call the `children` renderProp with the interface defined in propTypes
     *
     * @returns {React.ReactNode}
     */
    renderChildren() {
        return this.props.children({
            openPicker: ({onPicked}) => this.open(onPicked),
        });
    }

    render() {
        return (
            <>
                <Popover
                    onClose={this.close}
                    isVisible={this.state.isVisible}
                    anchorPosition={styles.createMenuPosition}
                    onModalHide={this.onModalHide}
                >
                    <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                        {
                            this.menuItemData.map(item => (
                                <MenuItem
                                    key={item.text}
                                    icon={item.icon}
                                    title={item.text}
                                    onPress={() => this.selectItem(item)}
                                />
                            ))
                        }
                    </View>
                </Popover>
                {this.renderChildren()}
            </>
        );
    }
}

AttachmentPicker.propTypes = propTypes;
AttachmentPicker.displayName = 'AttachmentPicker';
export default withWindowDimensions(AttachmentPicker);
