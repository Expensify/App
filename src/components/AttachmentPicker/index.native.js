/**
 * The react native image/document pickers work for iOS/Android, but we want to wrap them both within AttachmentPicker
 */
import React, {Component} from 'react';
import {Alert, Linking, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import RNDocumentPicker from 'react-native-document-picker';
import basePropTypes from './AttachmentPickerPropTypes';
import styles from '../../styles/styles';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import {Camera, Gallery, Paperclip} from '../Icon/Expensicons';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import launchCamera from './launchCamera';

const propTypes = {
    ...basePropTypes,
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

/**
  * See https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md#options
  * for ImagePicker configuration options
  */
const imagePickerOptions = {
    includeBase64: false,
    saveToPhotos: false,
    selectionLimit: 1,
};

/**
  * See https://github.com/rnmods/react-native-document-picker#options for DocumentPicker configuration options
  */
const documentPickerOptions = {
    type: [RNDocumentPicker.types.allFiles],
};

/**
  * The data returned from `show` is different on web and mobile, so use this function to ensure the data we
  * send to the xhr will be handled properly.
  *
  * @param {Object} fileData
  * @return {Object}
  */
function getDataForUpload(fileData) {
    return {
        name: fileData.fileName || fileData.name || 'chat_attachment',
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
        };

        this.menuItemData = [
            {
                icon: Camera,
                text: this.props.translate('attachmentPicker.takePhoto'),
                pickAttachment: () => this.showImagePicker(launchCamera),
            },
            {
                icon: Gallery,
                text: this.props.translate('attachmentPicker.chooseFromGallery'),
                pickAttachment: () => this.showImagePicker(launchImageLibrary),
            },
            {
                icon: Paperclip,
                text: this.props.translate('attachmentPicker.chooseDocument'),
                pickAttachment: () => this.showDocumentPicker(),
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
        if (attachment) {
            if (attachment.width === -1 || attachment.height === -1) {
                this.showImageCorruptionAlert();
                return;
            }
            const result = getDataForUpload(attachment);
            this.completeAttachmentSelection(result);
        }
    }

    /**
      * Inform the users when they need to grant camera access and guide them to settings
      */
    showPermissionsAlert() {
        Alert.alert(
            this.props.translate('attachmentPicker.cameraPermissionRequired'),
            this.props.translate('attachmentPicker.expensifyDoesntHaveAccessToCamera'),
            [
                {
                    text: this.props.translate('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: this.props.translate('common.settings'),
                    onPress: () => Linking.openSettings(),
                },
            ],
            {cancelable: false},
        );
    }

    /**
      * Common image picker handling
      *
      * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
      * @returns {Promise<ImagePickerResponse>}
      */
    showImagePicker(imagePickerFunc) {
        return new Promise((resolve, reject) => {
            imagePickerFunc(imagePickerOptions, (response) => {
                if (response.didCancel) {
                    // When the user cancelled resolve with no attachment
                    return resolve();
                }
                if (response.errorCode) {
                    switch (response.errorCode) {
                        case 'permission':
                            this.showPermissionsAlert();
                            break;
                        default:
                            this.showGeneralAlert();
                            break;
                    }

                    return reject(new Error(`Error during attachment selection: ${response.errorMessage}`));
                }

                // Resolve with the first (and only) selected file
                return resolve(response.assets[0]);
            });
        });
    }

    /**
      * A generic handling when we don't know the exact reason for an error
      *
      */
    showGeneralAlert() {
        Alert.alert(
            this.props.translate('attachmentPicker.attachmentError'),
            this.props.translate('attachmentPicker.errorWhileSelectingAttachment'),
        );
    }

    /**
     * An attachment error dialog when user selected malformed images
     */
    showImageCorruptionAlert() {
        Alert.alert(
            this.props.translate('attachmentPicker.attachmentError'),
            this.props.translate('attachmentPicker.errorWhileSelectingCorruptedImage'),
        );
    }

    /**
      * Launch the DocumentPicker. Results are in the same format as ImagePicker
      *
      * @returns {Promise<DocumentPickerResponse>}
      */
    showDocumentPicker() {
        return RNDocumentPicker.pick(documentPickerOptions).catch((error) => {
            if (!RNDocumentPicker.isCancel(error)) {
                this.showGeneralAlert(error.message);
                throw error;
            }
        });
    }

    /**
      * Triggers the `onPicked` callback with the selected attachment
      */
    completeAttachmentSelection() {
        if (this.state.result) {
            this.state.onPicked(this.state.result);
        }
    }

    /**
      * Opens the attachment modal
      *
      * @param {function} onPicked A callback that will be called with the selected attachment
      */
    open(onPicked) {
        this.completeAttachmentSelection = onPicked;
        this.setState({isVisible: true});
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
export default compose(
    withWindowDimensions,
    withLocalize,
)(AttachmentPicker);
