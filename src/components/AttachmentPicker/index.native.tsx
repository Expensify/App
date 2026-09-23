import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';

import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {cleanFileName, isLabelledDng, showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import processPickedAssetsSequentially from '@libs/fileDownload/processPickedAssets';
import fileURIToPath from '@libs/fileURIToPath';
import ReceiptStorage from '@libs/ReceiptStorage';
import {getPickerCaptureSource, logReceiptAdoptFailed} from '@libs/telemetry/ReceiptObservability';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {FileObject, ImagePickerResponse as FileResponse} from '@src/types/utils/Attachment';
import type IconAsset from '@src/types/utils/IconAsset';

import type {FileToCopy} from '@react-native-documents/picker';
import type {Asset, Callback, CameraOptions, ImageLibraryOptions, ImagePickerResponse} from 'react-native-image-picker';

import {keepLocalCopy, pick, types} from '@react-native-documents/picker';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageSize from 'react-native-image-size';

import type {CapturedPhoto} from './AttachmentCamera';
import type AttachmentPickerProps from './types';

import AttachmentCamera from './AttachmentCamera';

/** Gives the popover a frame to finish dismissing on iOS. Launching immediately would close the gallery/camera along with it. */
const MODAL_DISMISS_DELAY_MS = 200;

const EXTENSION_TO_NATIVE_TYPE: Record<string, string> = {
    pdf: String(types.pdf),
    doc: String(types.doc),
    docx: String(types.docx),
    zip: String(types.zip),
    txt: String(types.plainText),
    json: String(types.json),
    xls: String(types.xls),
    xlsx: String(types.xlsx),
    jpg: String(types.images),
    jpeg: String(types.images),
    png: String(types.images),
    gif: String(types.images),
    heif: String(types.images),
    heic: String(types.images),
    tif: String(types.images),
    tiff: String(types.images),
};

type LocalCopy = {
    name: string | null;
    uri: string;
    size: number | null;
    type: string | null;
};

type Item = {
    icon: IconAsset;
    /** The key in the translations file to use for the title */
    textTranslationKey: TranslationPaths;
} & (
    | {
          pickAttachment: () => Promise<Asset[] | void | LocalCopy[]>;
      }
    | {
          /** Direct action that doesn't go through the promise-based selectItem flow */
          onPress: () => void;
      }
);
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
    const fileName = fileData.name || CONST.DEFAULT_ATTACHMENT_FILENAME;
    const fileResult: FileObject = {
        name: cleanFileName(fileName),
        type: fileData.type,
        width: fileData.width,
        height: fileData.height,
        uri: fileData.uri,
        size: fileData.size,
    };

    const fileWithSize = fileResult.size
        ? Promise.resolve(fileResult)
        : RNFetchBlob.fs.stat(fileURIToPath(fileData.uri)).then((stats) => {
              fileResult.size = stats.size;
              return fileResult;
          });

    // `source` is what prepareRequestPayload re-resolves on offline replay, so it must point into the
    // receipts folder too, not just `uri`.
    return fileWithSize.then((file) =>
        ReceiptStorage.adopt(file.uri ?? '', file.name ?? CONST.DEFAULT_ATTACHMENT_FILENAME)
            .then((durableName) => {
                const durableUri = ReceiptStorage.toLocalUri(durableName);
                return {...file, uri: durableUri, source: durableUri} as FileObject;
            })
            .catch((error: unknown) => {
                logReceiptAdoptFailed({error, captureSource: getPickerCaptureSource()});
                return file;
            }),
    );
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
    acceptedFileTypes,
    fileLimit = 1,
    onOpenPicker,
    shouldSkipAttachmentTypeModal = false,
}: AttachmentPickerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Camera', 'Gallery', 'Paperclip']);
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(false);
    // Mount and visibility are tracked separately so the camera stays mounted through its hide
    // animation. Unmounting on close cuts the animation off midway and the modal vanishes abruptly.
    const [isAttachmentCameraMounted, setIsAttachmentCameraMounted] = useState(false);
    const [isAttachmentCameraVisible, setIsAttachmentCameraVisible] = useState(false);
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const completeAttachmentSelection = useRef<(data: FileObject[]) => void>(() => {});
    const onModalHide = useRef<(() => void) | undefined>(undefined);
    const onCanceled = useRef<() => void>(() => {});
    const onClosed = useRef<() => void>(() => {});
    const popoverRef = useRef(null);
    const modalDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (!modalDismissTimeoutRef.current) {
                return;
            }
            clearTimeout(modalDismissTimeoutRef.current);
        };
    }, []);

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false});

    /**
     * A generic handling when we don't know the exact reason for an error
     */
    const showGeneralAlert = useCallback(
        (message = translate('attachmentPicker.errorWhileSelectingAttachment')) => {
            Alert.alert(translate('attachmentPicker.attachmentError'), message);
        },
        [translate],
    );

    const launchInAppCamera = useCallback(() => {
        setIsAttachmentCameraMounted(true);
        setIsAttachmentCameraVisible(true);
    }, []);

    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchImageLibrary
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
                                showCameraPermissionsAlert(translate);
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

                    processPickedAssetsSequentially(assets, showGeneralAlert, translate).then(resolve).catch(reject);
                });
            }),
        [fileLimit, showGeneralAlert, translate, type],
    );
    /**
     * Transcodes document-picked DNG files (e.g. an iPhone ProRAW browsed to via "Choose file") to JPEG, the same
     * way gallery picks are, so both entry points accept the same photos. Anything else is returned untouched: plain
     * TIFFs are an accepted receipt format, and `.heic` documents keep the existing HEIC-through-validation flow.
     *
     * Files are converted one at a time (see `processPickedAssetsSequentially`) and failures are collected so a
     * multi-selection produces at most one alert; a file that can't be decoded is dropped from the result.
     */
    const transcodeDngFiles = useCallback(
        async (files: LocalCopy[]): Promise<LocalCopy[]> => {
            if (!files.some((file) => isLabelledDng(file))) {
                return files;
            }

            const failureMessages = new Set<string>();
            const collectFailure = (message = translate('attachmentPicker.errorWhileSelectingAttachment')) => {
                failureMessages.add(message);
            };

            const results: LocalCopy[] = [];
            for (const file of files) {
                if (!isLabelledDng(file)) {
                    results.push(file);
                    continue;
                }

                // eslint-disable-next-line no-await-in-loop -- converting one image at a time keeps a single decoded bitmap in memory, see processPickedAssetsSequentially
                const convertedAssets = await processPickedAssetsSequentially(
                    [{uri: file.uri, fileName: file.name ?? undefined, type: file.type ?? undefined, fileSize: file.size ?? undefined}],
                    collectFailure,
                    translate,
                );
                const convertedAsset = convertedAssets?.at(0);
                if (!convertedAsset?.uri) {
                    continue;
                }

                results.push({
                    name: convertedAsset.fileName ?? file.name,
                    uri: convertedAsset.uri,
                    // The JPEG's size differs from the DNG's and isn't reported by the transcode; `getDataForUpload` reads it from disk.
                    size: null,
                    type: convertedAsset.type ?? file.type,
                });
            }

            if (failureMessages.size > 0) {
                showGeneralAlert([...failureMessages].join('\n'));
            }

            return results;
        },
        [showGeneralAlert, translate],
    );

    /**
     * Launch the DocumentPicker. Results are in the same format as ImagePicker
     */
    const showDocumentPicker = useCallback(async (): Promise<LocalCopy[]> => {
        let pickerTypes: string[];
        if (acceptedFileTypes && acceptedFileTypes.length > 0) {
            const mappedTypes = acceptedFileTypes.reduce<string[]>((result, extension) => {
                const nativeType = EXTENSION_TO_NATIVE_TYPE[String(extension)];
                if (nativeType !== undefined && !result.includes(nativeType)) {
                    result.push(nativeType);
                }
                return result;
            }, []);
            // If any extension has no native type mapping, fall back to allFiles so those
            // file types remain selectable. Downstream validation handles the type check.
            const hasUnmappedExtensions = acceptedFileTypes.some((ext) => EXTENSION_TO_NATIVE_TYPE[String(ext)] === undefined);
            pickerTypes = mappedTypes.length > 0 && !hasUnmappedExtensions ? mappedTypes : [types.allFiles];
        } else {
            pickerTypes = [type === CONST.ATTACHMENT_PICKER_TYPE.IMAGE ? types.images : types.allFiles];
        }

        const pickedFiles = await pick({
            type: pickerTypes,
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

        const localFiles: LocalCopy[] = pickedFiles.map((file) => {
            const localCopy = localCopies.find((copy) => copy.sourceUri === file.uri);

            if (localCopy?.status !== 'success') {
                throw new Error("Couldn't create local file copy");
            }

            return {
                name: file.name,
                uri: localCopy.localUri,
                size: file.size,
                type: file.type,
            };
        });

        return transcodeDngFiles(localFiles);
    }, [acceptedFileTypes, fileLimit, transcodeDngFiles, type]);

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
                icon: icons.Camera,
                textTranslationKey: 'attachmentPicker.takePhoto',
                onPress: launchInAppCamera,
            });
        }

        return data;
    }, [icons.Camera, icons.Paperclip, icons.Gallery, showDocumentPicker, shouldHideGalleryOption, shouldHideCameraOption, launchInAppCamera, showImagePicker]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: menuItemData.length - 1, isActive: isVisible});

    /**
     * An attachment error dialog when user selected malformed images
     */
    const showImageCorruptionAlert = useCallback(() => {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
    }, [translate]);

    /**
     * Handles errors during image processing (resize, dimension check, etc.)
     */
    const handleImageProcessingError = useCallback(
        (error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : undefined;

            if (errorMessage === CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE) {
                showGeneralAlert(translate('attachmentPicker.imageDimensionsTooLarge'));
            } else if (errorMessage) {
                showGeneralAlert(errorMessage);
            } else {
                showImageCorruptionAlert();
            }
            return null;
        },
        [showGeneralAlert, showImageCorruptionAlert, translate],
    );

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
                        .then((file) =>
                            ImageSize.getSize(file.uri ?? '').then(({width, height}) => ({
                                ...file,
                                width,
                                height,
                            })),
                        )
                        .catch(handleImageProcessingError);
                }

                if (fileDataName && Str.isImage(fileDataName)) {
                    return getDataForUpload(fileDataObject)
                        .then((file) =>
                            ImageSize.getSize(file.uri ?? '').then(({width, height}) => {
                                if (width <= 0 || height <= 0) {
                                    showImageCorruptionAlert();
                                    return null;
                                }

                                return {
                                    ...file,
                                    width,
                                    height,
                                };
                            }),
                        )
                        .catch(handleImageProcessingError);
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
        [handleImageProcessingError, shouldValidateImage, showGeneralAlert, showImageCorruptionAlert],
    );

    const handleCameraCapture = useCallback(
        (photos: CapturedPhoto[]) => {
            setIsAttachmentCameraVisible(false);
            if (modalDismissTimeoutRef.current) {
                clearTimeout(modalDismissTimeoutRef.current);
                modalDismissTimeoutRef.current = null;
            }
            const assets: Asset[] = photos.map((photo) => ({
                uri: photo.uri,
                fileName: photo.fileName,
                type: photo.type,
                width: photo.width,
                height: photo.height,
            }));
            Promise.resolve(pickAttachment(assets)).finally(() => {
                onClosed.current();
                delete onModalHide.current;
            });
        },
        [pickAttachment],
    );

    const handleCameraClose = useCallback(() => {
        setIsAttachmentCameraVisible(false);
        if (modalDismissTimeoutRef.current) {
            clearTimeout(modalDismissTimeoutRef.current);
            modalDismissTimeoutRef.current = null;
        }
        onCanceled.current();
        onClosed.current();
        delete onModalHide.current;
    }, []);

    /**
     * Opens the attachment modal, or directly launches the document picker when shouldSkipAttachmentTypeModal is true.
     */
    const open = (onPickedHandler: (files: FileObject[]) => void, onCanceledHandler: () => void = () => {}, onClosedHandler: () => void = () => {}) => {
        completeAttachmentSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;
        onClosed.current = onClosedHandler;

        if (shouldSkipAttachmentTypeModal) {
            onOpenPicker?.();
            showDocumentPicker()
                .catch((error: Error) => {
                    if (JSON.stringify(error).includes('OPERATION_CANCELED')) {
                        return;
                    }
                    showGeneralAlert(error.message);
                    throw error;
                })
                .then((result) => pickAttachment(result))
                .catch(console.error)
                .finally(() => onClosedHandler());
            return;
        }

        setIsVisible(true);
    };

    /**
     * Setup native attachment selection to start after this popover closes
     *
     * @param {Object} item - an item from this.menuItemData
     * @param {Function} item.pickAttachment
     */
    const selectItem = useCallback(
        (item: Item) => {
            if (modalDismissTimeoutRef.current) {
                clearTimeout(modalDismissTimeoutRef.current);
                modalDismissTimeoutRef.current = null;
            }

            /* Presenting a second modal while the first is still dismissing fails silently on iOS, so
             * defer the camera launch to onModalHide. onPress items report completion themselves and
             * skip the promise-based pickAttachment chain below. */
            if ('onPress' in item) {
                onModalHide.current = () => {
                    modalDismissTimeoutRef.current = setTimeout(() => {
                        modalDismissTimeoutRef.current = null;
                        item.onPress();
                        delete onModalHide.current;
                    }, MODAL_DISMISS_DELAY_MS);
                };
                close();
                return;
            }

            onOpenPicker?.();
            /* setTimeout delays execution to the frame after the modal closes
             * without this on iOS closing the modal closes the gallery/camera as well */
            onModalHide.current = () => {
                modalDismissTimeoutRef.current = setTimeout(() => {
                    modalDismissTimeoutRef.current = null;
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
                }, MODAL_DISMISS_DELAY_MS);
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
                    if (modalDismissTimeoutRef.current) {
                        clearTimeout(modalDismissTimeoutRef.current);
                        modalDismissTimeoutRef.current = null;
                    }
                    close();
                    onCanceled.current();
                }}
                isVisible={isVisible}
                anchorRef={popoverRef}
                onModalHide={() => onModalHide.current?.()}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <View style={[!shouldUseNarrowLayout && styles.createMenuContainer, bottomSafeAreaPaddingStyle]}>
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
            {isAttachmentCameraMounted && (
                <AttachmentCamera
                    isVisible={isAttachmentCameraVisible}
                    onCapture={handleCameraCapture}
                    onClose={handleCameraClose}
                    onModalHide={() => setIsAttachmentCameraMounted(false)}
                />
            )}
            {renderChildren()}
        </>
    );
}

export default AttachmentPicker;
