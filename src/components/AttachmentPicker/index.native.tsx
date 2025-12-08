import type {FileToCopy} from '@react-native-documents/picker';
import {keepLocalCopy, pick, types} from '@react-native-documents/picker';
import {Str} from 'expensify-common';
import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import {launchImageLibrary} from 'react-native-image-picker';
import type {Asset, Callback, CameraOptions, ImageLibraryOptions, ImagePickerResponse} from 'react-native-image-picker';
import ImageSize from 'react-native-image-size';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanFileName, resizeImageIfNeeded, showCameraPermissionsAlert, verifyFileFormat} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {FileObject, ImagePickerResponse as FileResponse} from '@src/types/utils/Attachment';
import type IconAsset from '@src/types/utils/IconAsset';
import launchCamera from './launchCamera/launchCamera';
import type AttachmentPickerProps from './types';

type LocalCopy = {
    name: string | null;
    uri: string;
    size: number | null;
    type: string | null;
};

type Item = {
    /** The icon associated with the item. */
    icon: IconAsset;
    /** The key in the translations file to use for the title */
    textTranslationKey: TranslationPaths;
    /** Function to call when the user clicks the item */
    pickAttachment: () => Promise<Asset[] | void | LocalCopy[]>;
};

/**
 * Ensures asset has proper fileName and type properties
 */
const processAssetWithFallbacks = (asset: Asset): Asset => {
    // Generate fallback name: extract from URI if available, otherwise use timestamped default
    const fallbackName = asset.uri
        ? asset.uri
              .substring(asset.uri.lastIndexOf('/') + 1)
              .split('?')
              .at(0)
        : `image_${Date.now()}.jpeg`;
    const fileName = asset.fileName ?? fallbackName;
    return {
        ...asset,
        fileName,
        // Default to JPEG if no type specified
        type: asset.type ?? 'image/jpeg',
    };
};

/**
 * Return imagePickerOptions based on the type
 */
const getImagePickerOptions = (type: string, fileLimit: number): CameraOptions | ImageLibraryOptions => {
    // mediaType property is one of the ImagePicker configuration to restrict types'
    const mediaType = type === CONST.ATTACHMENT_PICKER_TYPE.IMAGE ? 'photo' : 'mixed';

    /**
     * See https://github.com/react-native-image-picker/react-native-image-picker/#options
     * for ImagePicker configuration options
     */
    return {
        mediaType,
        includeBase64: false,
        saveToPhotos: false,
        includeExtra: false,
        assetRepresentationMode: 'current',
        selectionLimit: fileLimit,
    };
};

/**
 * The data returned from `show` is different on web and mobile, so use this function to ensure the data we
 * send to the xhr will be handled properly.
 */
const getDataForUpload = (fileData: FileResponse): Promise<FileObject> => {
    const fileName = fileData.name || 'chat_attachment';
    const fileResult: FileObject = {
        name: cleanFileName(fileName),
        type: fileData.type,
        width: fileData.width,
        height: fileData.height,
        uri: fileData.uri,
        size: fileData.size,
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
function AttachmentPicker({
    type = CONST.ATTACHMENT_PICKER_TYPE.FILE,
    children,
    shouldHideCameraOption = false,
    shouldValidateImage = true,
    shouldHideGalleryOption = false,
    fileLimit = 1,
    onOpenPicker,
}: AttachmentPickerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Gallery', 'Paperclip'] as const);
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(false);
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const completeAttachmentSelection = useRef<(data: FileObject[]) => void>(() => {});
    const onModalHide = useRef<(() => void) | undefined>(undefined);
    const onCanceled = useRef<() => void>(() => {});
    const onClosed = useRef<() => void>(() => {});
    const popoverRef = useRef(null);

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    /**
     * A generic handling when we don't know the exact reason for an error
     */
    const showGeneralAlert = useCallback(
        (message = translate('attachmentPicker.errorWhileSelectingAttachment')) => {
            Alert.alert(translate('attachmentPicker.attachmentError'), message);
        },
        [translate],
    );

    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
     */
    const showImagePicker = useCallback(
        (imagePickerFunc: (options: CameraOptions, callback: Callback) => Promise<ImagePickerResponse>): Promise<Asset[] | void> =>
            new Promise((resolve, reject) => {
                imagePickerFunc(getImagePickerOptions(type, fileLimit), (response: ImagePickerResponse) => {
                    if (response.didCancel) {
                        // When the user cancelled resolve with no attachment
                        return resolve();
                    }
                    if (response.errorCode) {
                        switch (response.errorCode) {
                            case 'permission':
                                showCameraPermissionsAlert();
                                return resolve();
                            default:
                                showGeneralAlert();
                                break;
                        }

                        return reject(new Error(`Error during attachment selection: ${response.errorMessage}`));
                    }

                    const assets = response.assets;
                    if (!assets || assets.length === 0) {
                        return resolve();
                    }

                    const processedAssets: Asset[] = [];
                    let processedCount = 0;

                    const checkAllProcessed = () => {
                        processedCount++;
                        if (processedCount === assets.length) {
                            resolve(processedAssets.length > 0 ? processedAssets : undefined);
                        }
                    };

                    for (const asset of assets) {
                        if (!asset.uri) {
                            checkAllProcessed();
                            continue;
                        }

                        if (asset.type?.startsWith('image')) {
                            verifyFileFormat({fileUri: asset.uri, formatSignatures: CONST.HEIC_SIGNATURES})
                                .then((isHEIC) => {
                                    // react-native-image-picker incorrectly changes file extension without transcoding the HEIC file, so we are doing it manually if we detect HEIC signature
                                    if (isHEIC && asset.uri) {
                                        ImageManipulator.manipulate(asset.uri)
                                            .renderAsync()
                                            .then((manipulatedImage) => manipulatedImage.saveAsync({format: SaveFormat.JPEG}))
                                            .then((manipulationResult) => {
                                                const uri = manipulationResult.uri;
                                                const convertedAsset = {
                                                    uri,
                                                    name: uri
                                                        .substring(uri.lastIndexOf('/') + 1)
                                                        .split('?')
                                                        .at(0),
                                                    type: 'image/jpeg',
                                                    width: manipulationResult.width,
                                                    height: manipulationResult.height,
                                                };
                                                processedAssets.push(convertedAsset);
                                                checkAllProcessed();
                                            })
                                            .catch((error: Error) => {
                                                showGeneralAlert(error.message ?? 'An unknown error occurred');
                                                checkAllProcessed();
                                            });
                                    } else {
                                        // Ensure the asset has proper fileName and type for non-HEIC images
                                        const processedAsset = processAssetWithFallbacks(asset);
                                        processedAssets.push(processedAsset);
                                        checkAllProcessed();
                                    }
                                })
                                .catch((error: Error) => {
                                    showGeneralAlert(error.message ?? 'An unknown error occurred');
                                    checkAllProcessed();
                                });
                        } else {
                            // Ensure the asset has proper fileName and type
                            const processedAsset = processAssetWithFallbacks(asset);
                            processedAssets.push(processedAsset);
                            checkAllProcessed();
                        }
                    }
                });
            }),
        [fileLimit, showGeneralAlert, type],
    );
    /**
     * Launch the DocumentPicker. Results are in the same format as ImagePicker
     */
    const showDocumentPicker = useCallback(async (): Promise<LocalCopy[]> => {
        const pickedFiles = await pick({
            type: [type === CONST.ATTACHMENT_PICKER_TYPE.IMAGE ? types.images : types.allFiles],
            allowMultiSelection: fileLimit !== 1,
        });

        const localCopies = await keepLocalCopy({
            files: pickedFiles.map((file) => {
                return {
                    uri: file.uri,
                    fileName: file.name ?? '',
                };
            }) as [FileToCopy, ...FileToCopy[]],
            destination: 'cachesDirectory',
        });

        return pickedFiles.map((file) => {
            const localCopy = localCopies.find((copy) => copy.sourceUri === file.uri);

            if (!localCopy || localCopy.status !== 'success') {
                throw new Error("Couldn't create local file copy");
            }

            return {
                name: file.name,
                uri: localCopy.localUri,
                size: file.size,
                type: file.type,
            };
        });
    }, [fileLimit, type]);

    const menuItemData: Item[] = useMemo(() => {
        const data: Item[] = [
            {
                icon: icons.Paperclip,
                textTranslationKey: 'attachmentPicker.chooseDocument',
                pickAttachment: showDocumentPicker,
            },
        ];
        if (!shouldHideGalleryOption) {
            data.unshift({
                icon: icons.Gallery,
                textTranslationKey: 'attachmentPicker.chooseFromGallery',
                pickAttachment: () => showImagePicker(launchImageLibrary),
            });
        }
        if (!shouldHideCameraOption) {
            data.unshift({
                icon: Expensicons.Camera,
                textTranslationKey: 'attachmentPicker.takePhoto',
                pickAttachment: () => showImagePicker(launchCamera),
            });
        }

        return data;
    }, [icons.Paperclip, icons.Gallery, showDocumentPicker, shouldHideGalleryOption, shouldHideCameraOption, showImagePicker]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: menuItemData.length - 1, isActive: isVisible});

    /**
     * An attachment error dialog when user selected malformed images
     */
    const showImageCorruptionAlert = useCallback(() => {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
    }, [translate]);

    /**
     * Opens the attachment modal
     *
     * @param onPickedHandler A callback that will be called with the selected attachment
     * @param onCanceledHandler A callback that will be called without a selected attachment
     */
    const open = (onPickedHandler: (files: FileObject[]) => void, onCanceledHandler: () => void = () => {}, onClosedHandler: () => void = () => {}) => {
        // eslint-disable-next-line react-compiler/react-compiler
        completeAttachmentSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;
        onClosed.current = onClosedHandler;
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
        (attachments: Asset[] | LocalCopy[] | void = []): Promise<void> | undefined => {
            if (!attachments || attachments.length === 0) {
                onCanceled.current();
                return Promise.resolve();
            }

            const filesToProcess = attachments.map((fileData) => {
                if (!fileData) {
                    return Promise.resolve(null);
                }

                /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
                const fileDataName = ('fileName' in fileData && fileData.fileName) || ('name' in fileData && fileData.name) || '';
                const fileDataUri = ('uri' in fileData && fileData.uri) || '';

                const fileDataObject: FileResponse = {
                    name: fileDataName ?? '',
                    uri: fileDataUri,
                    size: ('size' in fileData && fileData.size) || ('fileSize' in fileData && fileData.fileSize) || null,
                    type: fileData.type ?? '',
                    width: ('width' in fileData && fileData.width) || undefined,
                    height: ('height' in fileData && fileData.height) || undefined,
                };

                if (!shouldValidateImage && fileDataName && Str.isImage(fileDataName)) {
                    return getDataForUpload(fileDataObject)
                        .then((file) => resizeImageIfNeeded(file))
                        .then((resizedFile) =>
                            ImageSize.getSize(resizedFile.uri ?? '').then(({width, height}) => ({
                                ...resizedFile,
                                width,
                                height,
                            })),
                        )
                        .catch(() => {
                            showImageCorruptionAlert();
                            return null;
                        });
                }

                if (fileDataName && Str.isImage(fileDataName)) {
                    return getDataForUpload(fileDataObject)
                        .then((file) => resizeImageIfNeeded(file))
                        .then((resizedFile) =>
                            ImageSize.getSize(resizedFile.uri ?? '').then(({width, height}) => {
                                if (width <= 0 || height <= 0) {
                                    showImageCorruptionAlert();
                                    return null;
                                }

                                return {
                                    ...resizedFile,
                                    width,
                                    height,
                                };
                            }),
                        )
                        .catch(() => {
                            showImageCorruptionAlert();
                            return null;
                        });
                }

                return getDataForUpload(fileDataObject).catch((error: Error) => {
                    showGeneralAlert(error.message);
                    return null;
                });
            });

            return Promise.all(filesToProcess)
                .then((results) => {
                    const validResults = results.filter((result): result is FileObject => result !== null);
                    if (validResults.length > 0) {
                        completeAttachmentSelection.current(validResults);
                    } else {
                        onCanceled.current();
                    }
                })
                .catch((error) => {
                    if (error instanceof Error) {
                        showGeneralAlert(error.message);
                    } else {
                        showGeneralAlert('An unknown error occurred');
                    }
                });
        },
        [shouldValidateImage, showGeneralAlert, showImageCorruptionAlert],
    );

    /**
     * Setup native attachment selection to start after this popover closes
     *
     * @param {Object} item - an item from this.menuItemData
     * @param {Function} item.pickAttachment
     */
    const selectItem = useCallback(
        (item: Item) => {
            onOpenPicker?.();
            /* setTimeout delays execution to the frame after the modal closes
             * without this on iOS closing the modal closes the gallery/camera as well */
            onModalHide.current = () => {
                setTimeout(() => {
                    item.pickAttachment()
                        .catch((error: Error) => {
                            if (JSON.stringify(error).includes('OPERATION_CANCELED')) {
                                return;
                            }

                            showGeneralAlert(error.message);
                            throw error;
                        })
                        .then((result) => pickAttachment(result))
                        .catch(console.error)
                        .finally(() => {
                            onClosed.current();
                            delete onModalHide.current;
                        });
                }, 200);
            };
            close();
        },
        [onOpenPicker, pickAttachment, showGeneralAlert],
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            if (focusedIndex === -1) {
                return;
            }
            const item = menuItemData.at(focusedIndex);
            if (item) {
                selectItem(item);
                setFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
            }
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
            openPicker: ({onPicked, onCanceled: newOnCanceled, onClosed: newOnClosed}) => open(onPicked, newOnCanceled, newOnClosed),
        });

    return (
        <>
            <Popover
                onClose={() => {
                    close();
                    onCanceled.current();
                }}
                isVisible={isVisible}
                anchorRef={popoverRef}
                // eslint-disable-next-line react-compiler/react-compiler
                onModalHide={() => onModalHide.current?.()}
            >
                <View style={!shouldUseNarrowLayout && styles.createMenuContainer}>
                    {menuItemData.map((item, menuIndex) => (
                        <MenuItem
                            key={item.textTranslationKey}
                            icon={item.icon}
                            title={translate(item.textTranslationKey)}
                            onPress={() => selectItem(item)}
                            focused={focusedIndex === menuIndex}
                            wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === menuIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
                        />
                    ))}
                </View>
            </Popover>
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            {renderChildren()}
        </>
    );
}

AttachmentPicker.displayName = 'AttachmentPicker';

export default AttachmentPicker;
