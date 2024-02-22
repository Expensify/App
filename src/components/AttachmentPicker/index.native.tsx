import lodashCompact from 'lodash/compact';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNDocumentPicker from 'react-native-document-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import type {DocumentPickerOptions, DocumentPickerResponse} from 'react-native-document-picker'
import type {SupportedPlatforms} from 'react-native-document-picker/lib/typescript/fileTypes';
import type {Asset, Callback, CameraOptions, ImagePickerResponse} from 'react-native-image-picker';
import launchCamera from './launchCamera/launchCamera';
import type BaseAttachmentPickerProps from './types';

type AttachmentPickerProps = BaseAttachmentPickerProps & {
    /** If this value is true, then we exclude Camera option. */
    shouldHideCameraOption?: boolean;
};

type Item = {
    icon: IconAsset;
    textTranslationKey: string;
    pickAttachment: () => Promise<Asset[] | void | DocumentPickerResponse[]>;
};

type FileResult = {
    name: string;
    type: string;
    width: number | undefined;
    height: number | undefined;
    uri: string;
    size: number | null;
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
 */
const getImagePickerOptions = (type: string): CameraOptions => {
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
} satisfies DocumentPickerOptions<SupportedPlatforms>;

/**
 * The data returned from `show` is different on web and mobile, so use this function to ensure the data we
 * send to the xhr will be handled properly.
 */
const getDataForUpload = (fileData: Asset & DocumentPickerResponse): Promise<FileResult> => {
    const fileName = fileData.fileName ?? fileData.name ?? 'chat_attachment';
    const fileResult: FileResult = {
        name: FileUtils.cleanFileName(fileName),
        type: fileData.type,
        width: fileData.width,
        height: fileData.height,
        uri: fileData.fileCopyUri ?? fileData.uri,
        size: fileData.fileSize ?? fileData.size,
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
 */
function AttachmentPicker({type = CONST.ATTACHMENT_PICKER_TYPE.FILE, children, shouldHideCameraOption = false}: AttachmentPickerProps): React.JSX.Element {
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(false);

    const completeAttachmentSelection = useRef<(data: ImagePickerResponse & DocumentPickerResponse) => void>(() => {});
    const onModalHide = useRef<() => void>(() => {});
    const onCanceled = useRef<() => void>(() => {});

    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

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
     */
    const showImagePicker = useCallback(
        (imagePickerFunc: (options: CameraOptions, callback: Callback) => {}): Promise<ImagePickerResponse | Asset[] | void> =>
            new Promise((resolve, reject) => {
                imagePickerFunc(getImagePickerOptions(type), (response: ImagePickerResponse) => {
                    if (response.didCancel) {
                        // When the user cancelled resolve with no attachment
                        return resolve();
                    }
                    if (response.errorCode) {
                        switch (response.errorCode) {
                            case 'permission':
                                FileUtils.showCameraPermissionsAlert();
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
        [showGeneralAlert, type],
    );

    /**
     * Launch the DocumentPicker. Results are in the same format as ImagePicker
     *
     * @returns {Promise<DocumentPickerResponse[] | void>}
     */
    const showDocumentPicker = useCallback(
        (): Promise<DocumentPickerResponse[] | void> =>
            RNDocumentPicker.pick(documentPickerOptions).catch((error) => {
                if (RNDocumentPicker.isCancel(error)) {
                    return;
                }

                showGeneralAlert(error.message);
                throw error;
            }),
        [showGeneralAlert],
    );

    // convert this into type and use it solve others
    const menuItemData: Item[] = useMemo(() => {
        const data = lodashCompact([
            !shouldHideCameraOption && {
                icon: Expensicons.Camera,
                textTranslationKey: 'attachmentPicker.takePhoto',
                pickAttachment: () => showImagePicker(launchCamera),
            },
            {
                icon: Expensicons.Gallery,
                textTranslationKey: 'attachmentPicker.chooseFromGallery',
                pickAttachment: () => showImagePicker(launchImageLibrary),
            },
            type !== CONST.ATTACHMENT_PICKER_TYPE.IMAGE && {
                icon: Expensicons.Paperclip,
                textTranslationKey: 'attachmentPicker.chooseDocument',
                pickAttachment: showDocumentPicker,
            },
        ]);

        return data;
    }, [showDocumentPicker, showImagePicker, type, shouldHideCameraOption]);

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
     * @param onPickedHandler A callback that will be called with the selected attachment
     * @param onCanceledHandler A callback that will be called without a selected attachment
     */
    const open = (onPickedHandler: () => void, onCanceledHandler: () => void = () => {}) => {
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
     */
    const pickAttachment = useCallback(
        (attachments: Array<Asset & DocumentPickerResponse> = []): Promise<Asset[] | void | DocumentPickerResponse[]> => {
            if (attachments.length === 0) {
                onCanceled.current();
                return Promise.resolve();
            }

            const fileData = attachments[0];

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
        (item: Item) => {
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
     */
    const renderChildren = (): React.ReactNode =>
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
                    {menuItemData.map((item, menuIndex) => (
                        <MenuItem
                            key={item.textTranslationKey}
                            icon={item.icon}
                            title={translate(item.textTranslationKey as TranslationPaths)}
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

AttachmentPicker.displayName = 'AttachmentPicker';

export default AttachmentPicker;
