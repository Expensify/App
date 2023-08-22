import _ from 'underscore';
import React, {useState, useRef, useCallback, useMemo} from 'react';
import {View, Alert, Linking} from 'react-native';
import RNDocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'react-native-blob-util';
import {launchImageLibrary} from 'react-native-image-picker';
import {propTypes as basePropTypes, defaultProps} from './attachmentPickerPropTypes';
import CONST from '../../CONST';
import * as FileUtils from '../../libs/fileDownload/FileUtils';
import * as Expensicons from '../Icon/Expensicons';
import launchCamera from './launchCamera';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import styles from '../../styles/styles';
import useLocalize from '../../hooks/useLocalize';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import useArrowKeyFocusManager from '../../hooks/useArrowKeyFocusManager';

const propTypes = {
    ...basePropTypes,
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
const getImagePickerOptions = (type) => {
    // mediaType property is one of the ImagePicker configuration to restrict types'
    const mediaType = type === CONST.ATTACHMENT_PICKER_TYPE.IMAGE ? 'photo' : 'mixed';
    return {
        mediaType,
        ...imagePickerOptions,
    };
};

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
const getDataForUpload = (fileData) => {
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
};

/**
 * This component renders a function as a child and
 * returns a "show attachment picker" method that takes
 * a callback. This is the ios/android implementation
 * opening a modal with attachment options
 * @param {propTypes} props
 * @returns {JSX.Element}
 */
function AttachmentPicker({type, children}) {
    const [isVisible, setIsVisible] = useState(false);

    const completeAttachmentSelection = useRef();
    const onModalHide = useRef();
    const onCanceled = useRef();

    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    /**
     * Inform the users when they need to grant camera access and guide them to settings
     */
    const showPermissionsAlert = useCallback(() => {
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
    }, [translate]);

    /**
     * A generic handling when we don't know the exact reason for an error
     */
    const showGeneralAlert = useCallback(() => {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingAttachment'));
    }, [translate]);

    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
     * @returns {Promise<ImagePickerResponse>}
     */
    const showImagePicker = useCallback(
        (imagePickerFunc) =>
            new Promise((resolve, reject) => {
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
            }),
        [showGeneralAlert, showPermissionsAlert, type],
    );

    /**
     * Launch the DocumentPicker. Results are in the same format as ImagePicker
     *
     * @returns {Promise<DocumentPickerResponse[]>}
     */
    const showDocumentPicker = useCallback(
        () =>
            RNDocumentPicker.pick(documentPickerOptions).catch((error) => {
                if (RNDocumentPicker.isCancel(error)) {
                    return;
                }

                showGeneralAlert(error.message);
                throw error;
            }),
        [showGeneralAlert],
    );

    const menuItemData = useMemo(() => {
        const data = [
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
        ];

        if (type !== CONST.ATTACHMENT_PICKER_TYPE.IMAGE) {
            data.push({
                icon: Expensicons.Paperclip,
                textTranslationKey: 'attachmentPicker.chooseDocument',
                pickAttachment: showDocumentPicker,
            });
        }

        return data;
    }, [showDocumentPicker, showImagePicker, type]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: menuItemData.length - 1, isActive: isVisible});

    /**
     * An attachment error dialog when user selected malformed images
     */
    const showImageCorruptionAlert = useCallback(() => {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedImage'));
    }, [translate]);

    /**
     * Opens the attachment modal
     *
     * @param {function} onPickedHandler A callback that will be called with the selected attachment
     * @param {function} onCanceledHandler A callback that will be called without a selected attachment
     */
    const open = (onPickedHandler, onCanceledHandler = () => {}) => {
        completeAttachmentSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;
        setIsVisible(true);
    };

    /**
     * Closes the attachment modal
     */
    const close = () => {
        setIsVisible(false);
    };

    /**
     * Handles the image/document picker result and
     * sends the selected attachment to the caller (parent component)
     *
     * @param {Array<ImagePickerResponse|DocumentPickerResponse>} attachments
     * @returns {Promise}
     */
    const pickAttachment = useCallback(
        (attachments = []) => {
            if (attachments.length === 0) {
                onCanceled.current();
                return Promise.resolve();
            }

            const fileData = _.first(attachments);

            if (fileData.width === -1 || fileData.height === -1) {
                showImageCorruptionAlert();
                return Promise.resolve();
            }

            return getDataForUpload(fileData)
                .then((result) => {
                    completeAttachmentSelection.current(result);
                })
                .catch((error) => {
                    showGeneralAlert(error.message);
                    throw error;
                });
        },
        [showGeneralAlert, showImageCorruptionAlert],
    );

    /**
     * Setup native attachment selection to start after this popover closes
     *
     * @param {Object} item - an item from this.menuItemData
     * @param {Function} item.pickAttachment
     */
    const selectItem = useCallback(
        (item) => {
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
        },
        [pickAttachment],
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            if (focusedIndex === -1) {
                return;
            }
            selectItem(menuItemData[focusedIndex]);
            setFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
        },
        {
            isActive: isVisible,
        },
    );

    /**
     * Call the `children` renderProp with the interface defined in propTypes
     *
     * @returns {React.ReactNode}
     */
    const renderChildren = () =>
        children({
            openPicker: ({onPicked, onCanceled: newOnCanceled}) => open(onPicked, newOnCanceled),
        });

    return (
        <>
            <Popover
                onClose={() => {
                    close();
                    onCanceled.current();
                }}
                isVisible={isVisible}
                anchorPosition={styles.createMenuPosition}
                onModalHide={onModalHide.current}
            >
                <View style={!isSmallScreenWidth && styles.createMenuContainer}>
                    {_.map(menuItemData, (item, menuIndex) => (
                        <MenuItem
                            key={item.textTranslationKey}
                            icon={item.icon}
                            title={translate(item.textTranslationKey)}
                            onPress={() => selectItem(item)}
                            focused={focusedIndex === menuIndex}
                        />
                    ))}
                </View>
            </Popover>
            {renderChildren()}
        </>
    );
}

AttachmentPicker.propTypes = propTypes;
AttachmentPicker.defaultProps = defaultProps;
AttachmentPicker.displayName = 'AttachmentPicker';

export default AttachmentPicker;
