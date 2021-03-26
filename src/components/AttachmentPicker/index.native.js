/**
 * The react native image/document pickers work for iOS/Android, but we want to wrap them both within AttachmentPicker
 */
import React, {Component} from 'react';
import {Alert, Linking, View} from 'react-native';
import RNImagePicker from 'react-native-image-picker';
import RNDocumentPicker from 'react-native-document-picker';
import basePropTypes from './propTypes';
import styles from '../../styles/styles';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import {Paperclip} from '../Icon/Expensicons';
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
        'ExpensifyCash does not have access to your camera. To enable access, tap Settings and turn on Camera.',
        '',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Settings',
                onPress: () => Linking.openURL('app-settings:'),
            },
        ],
        {cancelable: false},
    );
}

/**
 * A generic handling when we don't know the exact reason for an error
 *
 * @param {String} message
 */
function showGeneralAlert(message) {
    Alert.alert(
        'An error is preventing us to use handle the attachment',
        message, // Todo: maybe we don't want to show this as it's probably not human friendly
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
                    case 'Camera permissions not granted': showPermissionsAlert(); break;
                    default: showGeneralAlert(response.error); break;
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

        this.state = {isVisible: false, onPicked: () => {}, result: null};

        this.menuItemData = [
            {
                icon: Paperclip,
                text: 'Take Photo',
                pickAttachment: () => showImagePicker(RNImagePicker.launchCamera),
            },
            {
                icon: Paperclip,
                text: 'Choose from Gallery',
                pickAttachment: () => showImagePicker(RNImagePicker.launchImageLibrary),
            },
            {
                icon: Paperclip,
                text: 'Choose Document',
                pickAttachment: showDocumentPicker,
            },
        ];

        this.setResult = this.setResult.bind(this);
        this.close = this.close.bind(this);
        this.onModalHide = this.onModalHide.bind(this);
    }

    /**
     * After the modal closes, if an attachment was selected delegate it to the `onPicked` callback
     */
    onModalHide() {
        if (this.state.result) {
            this.state.onPicked(this.state.result);
        }
    }

    /**
     * Store the selected attachment mapped to an appropriate file interface
     *
     * @param {ImagePickerResponse|DocumentPickerResponse} result
     */
    setResult(result) {
        if (result && !result.didCancel && !result.error) {
            this.setState({result: getDataForUpload(result)});
        }
    }

    open(onPicked) {
        if (typeof onPicked !== 'function') {
            throw new Error(
                `Invalid onPicked parameter. Check the children passed to: ${AttachmentPicker.displayName}`,
            );
        }

        this.setState({isVisible: true, onPicked, result: null});
    }

    close() {
        this.setState({isVisible: false});
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
                            this.menuItemData.map(({icon, text, pickAttachment}) => (
                                <MenuItem
                                    key={text}
                                    icon={icon}
                                    title={text}
                                    onPress={() => pickAttachment()
                                        .then(this.setResult)
                                        .then(this.close)
                                        .catch(console.error)}
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
