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
    title: 'Select an Attachment',
    takePhotoButtonTitle: 'Take Photo',
    chooseFromLibraryButtonTitle: 'Choose from Gallery',
    customButtons: [{name: 'Document', title: 'Choose Document'}],
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
 * Launch the DocumentPicker. Results are in same format as ImagePicker, so we can pass the repsonse to the
 * callback as is.
 *
 * @param {Object} callback
 */
function showDocumentPicker(callback) {
    RNDocumentPicker.pick(documentPickerOptions).then((results) => {
        callback(results);
    }).catch((error) => {
        if (!RNDocumentPicker.isCancel(error)) {
            throw error;
        }
    });
}

/**
 * Launch the AttachmentPicker. We display the ImagePicker first, as the document option is displayed as a
 * custom ImagePicker list item.
 *
 * @param {Object} callback
 */
function show(callback) {
    RNImagePicker.showImagePicker(imagePickerOptions, (response) => {
        if (response.error) {
            if (response.error === 'Camera permissions not granted') {
                Alert.alert(
                    // eslint-disable-next-line max-len
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
            console.debug(`Error during attachment selection: ${response.error}`);
        } else if (response.customButton) {
            showDocumentPicker(callback);
        } else if (!response.didCancel) {
            callback(response);
        }
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

        this.state = {};
        this.resetState();
        this.handlePopoverClose = this.handlePopoverClose.bind(this);
    }

    handlePopoverClose() {
        // Todo: call `onPicked` with result
        this.state.onPicked(null);
        this.setState({isVisible: false});
    }

    resetState() {
        this.setState({isVisible: false, onPicked: () => {}});
    }

    renderMenuItems() {
        const menuItemData = [
            {
                icon: Paperclip,
                text: 'Take Photo',
            },
            {
                icon: Paperclip,
                text: 'Choose from Gallery',
            },
            {
                icon: Paperclip,
                text: 'Choose Document',
            },
        ];

        return menuItemData.map(({icon, text}) => (
            <MenuItem key={text} icon={icon} title={text} onPress={this.handlePopoverClose} />
        ));
    }

    renderChildren() {
        return this.props.children({
            openPicker: ({onPicked}) => {
                // Todo: perhaps we want some error handling here if onPicked is missing
                // As this is not a prop it won't be caught by prop types
                this.setState({isVisible: true, onPicked});
            },
        });
    }

    render() {
        return (
            <>
                <Popover
                    onClose={this.handlePopoverClose}
                    isVisible={this.state.isVisible}
                    anchorPosition={styles.createMenuPosition}
                >
                    <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                        {this.renderMenuItems()}
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
