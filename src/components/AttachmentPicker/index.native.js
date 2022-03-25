/**
 * The react native image/document pickers work for iOS/Android, but we want to wrap them both within AttachmentPicker
 */
import _ from 'underscore';
import React, {Component} from 'react';
import {Alert, Linking, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import RNDocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {propTypes as basePropTypes, defaultProps} from './attachmentPickerPropTypes';
import styles from '../../styles/styles';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import * as Expensicons from '../Icon/Expensicons';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import launchCamera from './launchCamera';
import CONST from '../../CONST';

const propTypes = {
    ...basePropTypes,
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
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

/**
  * See https://github.com/rnmods/react-native-document-picker#options for DocumentPicker configuration options
  */
const documentPickerOptions = {
    type: [RNDocumentPicker.types.allFiles],
    copyTo: 'cachesDirectory',
};

/**
  * The data returned from `show` is different on web and mobile, so use this function to ensure the data we
  * send to the xhr will be handled properly.
  *
  * @param {Object} fileData
  * @return {Promise}
  */
function getDataForUpload(fileData) {
    const fileResult = {
        name: fileData.fileName || fileData.name || 'chat_attachment',
        type: fileData.type,
        uri: fileData.fileCopyUri || fileData.uri,
        size: fileData.fileSize || fileData.size,
    };

    if (fileResult.size) {
        return Promise.resolve(fileResult);
    }

    return RNFetchBlob.fs.stat(fileData.uri.replace('file://', '')).then((stats) => {
        fileResult.size = stats.size;
        return fileResult;
    });
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
                icon: Expensicons.Camera,
                textTranslationKey: 'attachmentPicker.takePhoto',
                pickAttachment: () => this.showImagePicker(launchCamera),
            },
            {
                icon: Expensicons.Gallery,
                textTranslationKey: 'attachmentPicker.chooseFromGallery',
                pickAttachment: () => this.showImagePicker(launchImageLibrary),
            },
        ];

        // When selecting an image on a native device, it would be redundant to have a second option for choosing a document,
        // so it is excluded in this case.
        if (this.props.type !== CONST.ATTACHMENT_PICKER_TYPE.IMAGE) {
            this.menuItemData.push(
                {
                    icon: Expensicons.Paperclip,
                    textTranslationKey: 'attachmentPicker.chooseDocument',
                    pickAttachment: () => this.showDocumentPicker(),
                },
            );
        }

        this.close = this.close.bind(this);
        this.pickAttachment = this.pickAttachment.bind(this);
    }

    /**
      * Handles the image/document picker result and
      * sends the selected attachment to the caller (parent component)
      *
      * @param {Array<ImagePickerResponse|DocumentPickerResponse>} attachments
      * @returns {Promise}
      */
    pickAttachment(attachments = []) {
        if (attachments.length === 0) {
            return;
        }

        const fileData = _.first(attachments);

        if (fileData.width === -1 || fileData.height === -1) {
            this.showImageCorruptionAlert();
            return;
        }

        return getDataForUpload(fileData).then((result) => {
            this.completeAttachmentSelection(result);
        }).catch((error) => {
            this.showGeneralAlert(error.message);
            throw error;
        });
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
            imagePickerFunc(getImagePickerOptions(this.props.type), (response) => {
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

                return resolve(response.assets);
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
      * @returns {Promise<DocumentPickerResponse[]>}
      */
    showDocumentPicker() {
        return RNDocumentPicker.pick(documentPickerOptions).catch((error) => {
            if (RNDocumentPicker.isCancel(error)) {
                return;
            }

            this.showGeneralAlert(error.message);
            throw error;
        });
    }

    /**
      * Triggers the `onPicked` callback with the selected attachment
      */
    completeAttachmentSelection() {
        if (!this.state.result) {
            return;
        }

        this.state.onPicked(this.state.result);
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
            200,
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
                             _.map(this.menuItemData, item => (
                                 <MenuItem
                                     key={item.textTranslationKey}
                                     icon={item.icon}
                                     title={this.props.translate(item.textTranslationKey)}
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
AttachmentPicker.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
)(AttachmentPicker);
