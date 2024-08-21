import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNDocumentPicker from 'react-native-document-picker';
import type {DocumentPickerOptions, DocumentPickerResponse} from 'react-native-document-picker';
import type {FileObject, ImagePickerResponse as FileResponse} from '@components/AttachmentModal';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import type AttachmentPickerProps from './types';

type Item = {
    /** The icon associated with the item. */
    icon: IconAsset;
    /** The key in the translations file to use for the title */
    textTranslationKey: TranslationPaths;
    /** Function to call when the user clicks the item */
    pickAttachment: () => Promise<void | DocumentPickerResponse[]>;
};

const getDocumentPickerOptions = (): DocumentPickerOptions<'ios' | 'android'> => {
    return {
        type: [RNDocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
    };
};

const getFileDataName = (fileData: DocumentPickerResponse): string => {
    if ('fileName' in fileData) {
        return fileData.fileName as string;
    }
    if ('name' in fileData && fileData.name) {
        return fileData.name;
    }
    return '';
};

/**
 * The data returned from `show` is different on web and mobile, so use this function to ensure the data we
 * send to the xhr will be handled properly.
 */
const getDataForUpload = (fileData: FileResponse): Promise<FileObject> => {
    const fileName = fileData.name || 'spreadsheet';
    const fileResult: FileObject = {
        name: FileUtils.cleanFileName(fileName),
        type: fileData.type,
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

function FilePicker({children}: AttachmentPickerProps) {
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(false);

    const completeAttachmentSelection = useRef<(data: FileObject) => void>(() => {});
    const onModalHide = useRef<() => void>();
    const onCanceled = useRef<() => void>(() => {});
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
     * Launch the DocumentPicker. Results are in the same format as ImagePicker
     *
     * @returns {Promise<DocumentPickerResponse[] | void>}
     */
    const showDocumentPicker = useCallback(
        (): Promise<DocumentPickerResponse[] | void> =>
            RNDocumentPicker.pick(getDocumentPickerOptions()).catch((error: Error) => {
                if (RNDocumentPicker.isCancel(error)) {
                    return;
                }

                showGeneralAlert(error.message);
                throw error;
            }),
        [showGeneralAlert],
    );

    const menuItemData: Item[] = useMemo(() => {
        const data: Item[] = [
            {
                icon: Expensicons.Paperclip,
                textTranslationKey: 'attachmentPicker.chooseDocument',
                pickAttachment: showDocumentPicker,
            },
        ];

        return data;
    }, [showDocumentPicker]);

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
    const open = (onPickedHandler: (file: FileObject) => void, onCanceledHandler: () => void = () => {}) => {
        // eslint-disable-next-line react-compiler/react-compiler
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

    const validateAndCompleteAttachmentSelection = useCallback(
        (fileData: FileResponse) => {
            // Check if the file dimensions indicate corruption
            // The width/height for a corrupted file is -1 on android native and 0 on ios native
            // We must check only numeric values because the width/height can be undefined for non-image files
            if ((typeof fileData.width === 'number' && fileData.width <= 0) || (typeof fileData.height === 'number' && fileData.height <= 0)) {
                showImageCorruptionAlert();
                return Promise.resolve();
            }
            return getDataForUpload(fileData)
                .then((result) => {
                    completeAttachmentSelection.current(result);
                })
                .catch((error: Error) => {
                    showGeneralAlert(error.message);
                    throw error;
                });
        },
        [showGeneralAlert, showImageCorruptionAlert],
    );

    /**
     * Handles the image/document picker result and
     * sends the selected attachment to the caller (parent component)
     */
    const pickAttachment = useCallback(
        (attachments: DocumentPickerResponse[] | void = []): Promise<void> | undefined => {
            if (!attachments || attachments.length === 0) {
                onCanceled.current();
                return Promise.resolve();
            }
            const fileData = attachments[0];

            if (!fileData) {
                onCanceled.current();
                return Promise.resolve();
            }

            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const fileDataUri = fileData.fileCopyUri ?? '';
            const fileDataName = getFileDataName(fileData);
            const fileDataObject: FileResponse = {
                name: fileDataName,
                uri: fileDataUri,
                type: fileData.type ?? '',
            };
            /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
            validateAndCompleteAttachmentSelection(fileDataObject);
        },
        [validateAndCompleteAttachmentSelection],
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
            onModalHide.current = () => {
                setTimeout(() => {
                    item.pickAttachment()
                        .then((result) => pickAttachment(result))
                        .catch(console.error)
                        .finally(() => delete onModalHide.current);
                }, 200);
            };
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
                anchorRef={popoverRef}
                onModalHide={onModalHide.current}
            >
                <View style={!shouldUseNarrowLayout && styles.createMenuContainer}>
                    {menuItemData.map((item, menuIndex) => (
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

FilePicker.displayName = 'FilePicker';

export default FilePicker;
