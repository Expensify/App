import _ from 'underscore';
import React, {useEffect, useState, useRef} from 'react';
import {View, Alert, Linking} from 'react-native';
import RNDocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'react-native-blob-util';
import {launchImageLibrary} from 'react-native-image-picker';
import {propTypes as basePropTypes, defaultProps} from './attachmentPickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import * as FileUtils from '../../libs/fileDownload/FileUtils';
import * as Expensicons from '../Icon/Expensicons';
import launchCamera from './launchCamera';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import styles from '../../styles/styles';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';

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
    const fileName = fileData.fileName || fileData.name || 'chat_attachment';
    const fileResult = {
        name: FileUtils.cleanFileName(fileName),
        type: fileData.type,
        width: fileData.width,
        height: fileData.height,
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

function AttachmentPicker({translate, type, children, isSmallScreenWidth}) {
    const completeAttachmentSelection = useRef();
    const onModalHide = useRef();
    const keyboardListener = useRef();

    /**
     * Inform the users when they need to grant camera access and guide them to settings
     */
    function showPermissionsAlert() {
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
    }

    /**
     * A generic handling when we don't know the exact reason for an error
     *
     */
    function showGeneralAlert() {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingAttachment'));
    }

    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
     * @returns {Promise<ImagePickerResponse>}
     */
    function showImagePicker(imagePickerFunc) {
        return new Promise((resolve, reject) => {
            imagePickerFunc(getImagePickerOptions(type), (response) => {
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
    }

    const [isVisible, setIsVisible] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [menuItemData, setMenuItemData] = useState([
        {
            icon: Expensicons.Camera,
            textTranslationKey: 'attachmentPicker.takePhoto',
            pickAttachment: () => showImagePicker(launchCamera),
        },
        {
            icon: Expensicons.Gallery,
            textTranslationKey: 'attachmentPicker.chooseFromGallery',
            pickAttachment: () => showImagePicker(launchImageLibrary),
        },
    ]);

    // const [result, setResult] = useState()

    /**
     * An attachment error dialog when user selected malformed images
     */
    function showImageCorruptionAlert() {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedImage'));
    }

    /**
     * Launch the DocumentPicker. Results are in the same format as ImagePicker
     *
     * @returns {Promise<DocumentPickerResponse[]>}
     */
    function showDocumentPicker() {
        return RNDocumentPicker.pick(documentPickerOptions).catch((error) => {
            if (RNDocumentPicker.isCancel(error)) {
                return;
            }

            showGeneralAlert(error.message);
            throw error;
        });
    }

    /**
     * Opens the attachment modal
     *
     * @param {function} onPickedHandler A callback that will be called with the selected attachment
     */
    function open(onPickedHandler) {
        completeAttachmentSelection.current = onPickedHandler;
        setIsVisible(true);
    }

    /**
     * Closes the attachment modal
     */
    function close() {
        setIsVisible(false);
    }

    /**
     * Handles the image/document picker result and
     * sends the selected attachment to the caller (parent component)
     *
     * @param {Array<ImagePickerResponse|DocumentPickerResponse>} attachments
     * @returns {Promise}
     */
    function pickAttachment(attachments = []) {
        if (attachments.length === 0) {
            return;
        }

        const fileData = _.first(attachments);

        if (fileData.width === -1 || fileData.height === -1) {
            showImageCorruptionAlert();
            return;
        }

        return getDataForUpload(fileData)
            .then((result) => {
                completeAttachmentSelection.current(result);
            })
            .catch((error) => {
                showGeneralAlert(error.message);
                throw error;
            });
    }

    /**
     * Setup native attachment selection to start after this popover closes
     *
     * @param {Object} item - an item from this.menuItemData
     * @param {Function} item.pickAttachment
     */
    function selectItem(item) {
        /* setTimeout delays execution to the frame after the modal closes
         * without this on iOS closing the modal closes the gallery/camera as well */
        onModalHide.current = () =>
            setTimeout(
                () =>
                    item
                        .pickAttachment()
                        .then(pickAttachment)
                        .catch(console.error)
                        .finally(() => delete onModalHide.current),
                200,
            );

        close();
    }

    function attachKeyboardListener() {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        keyboardListener.current = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (focusedIndex === -1) {
                    return;
                }
                selectItem(menuItemData[focusedIndex]);
                setFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
        );
    }

    function removeKeyboardListener() {
        if (!keyboardListener.current) {
            return;
        }
        keyboardListener.current();
    }

    useEffect(() => {
        // When selecting an image on a native device, it would be redundant to have a second option for choosing a document,
        // so it is excluded in this case.
        if (type === CONST.ATTACHMENT_PICKER_TYPE.IMAGE) {
            return;
        }

        setMenuItemData((oldMenuItemData) => [
            ...oldMenuItemData,
            {
                icon: Expensicons.Paperclip,
                textTranslationKey: 'attachmentPicker.chooseDocument',
                pickAttachment: () => showDocumentPicker(),
            },
        ]);

        return () => {
            removeKeyboardListener();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isVisible) {
            attachKeyboardListener();
        } else {
            removeKeyboardListener();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    /**
     * Call the `children` renderProp with the interface defined in propTypes
     *
     * @returns {React.ReactNode}
     */
    function renderChildren() {
        return children({
            openPicker: ({onPicked}) => open(onPicked),
        });
    }

    return (
        <>
            <Popover
                onClose={() => close()}
                isVisible={isVisible}
                anchorPosition={styles.createMenuPosition}
                onModalHide={onModalHide.current}
            >
                <View style={isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    <ArrowKeyFocusManager
                        focusedIndex={focusedIndex}
                        maxIndex={menuItemData.length - 1}
                        onFocusedIndexChanged={(index) => setFocusedIndex(index)}
                    >
                        {_.map(menuItemData, (item, menuIndex) => (
                            <MenuItem
                                key={item.textTranslationKey}
                                icon={item.icon}
                                title={translate(item.textTranslationKey)}
                                onPress={() => selectItem(item)}
                                focused={focusedIndex === menuIndex}
                            />
                        ))}
                    </ArrowKeyFocusManager>
                </View>
            </Popover>
            {renderChildren()}
        </>
    );
}

AttachmentPicker.propTypes = propTypes;
AttachmentPicker.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(AttachmentPicker);
