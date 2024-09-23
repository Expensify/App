import React, {useCallback, useRef} from 'react';
import {Alert} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNDocumentPicker from 'react-native-document-picker';
import type {DocumentPickerResponse} from 'react-native-document-picker';
import type {FileObject} from '@components/AttachmentModal';
import useLocalize from '@hooks/useLocalize';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import type FilePickerProps from './types';

/**
 * Utility function to get the file name from DocumentPickerResponse
 */
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
 * The data returned from `show` is different on web and mobile,
 * use this function to ensure the data will be handled properly.
 */
const getDataForUpload = (fileData: DocumentPickerResponse): Promise<FileObject> => {
    const fileName = fileData.name ?? 'spreadsheet';
    const fileResult: FileObject = {
        name: FileUtils.cleanFileName(fileName),
        type: fileData.type ?? undefined,
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

function FilePicker({children}: FilePickerProps) {
    const completeFileSelection = useRef<(data: FileObject) => void>(() => {});
    const onCanceled = useRef<() => void>(() => {});

    const {translate} = useLocalize();

    /**
     * A generic handling for file picker errors
     */
    const showGeneralAlert = useCallback(
        (message = translate('filePicker.errorWhileSelectingFile')) => {
            Alert.alert(translate('filePicker.fileError'), message);
        },
        [translate],
    );

    /**
     * Launches the DocumentPicker
     *
     * @returns {Promise<DocumentPickerResponse[] | void>}
     */
    const showFilePicker = useCallback(
        (): Promise<DocumentPickerResponse[] | void> =>
            RNDocumentPicker.pick({
                type: [RNDocumentPicker.types.allFiles],
                copyTo: 'cachesDirectory',
            }).catch((error: Error) => {
                if (RNDocumentPicker.isCancel(error)) {
                    onCanceled.current();
                    return;
                }

                showGeneralAlert(error.message);
                throw error;
            }),
        [showGeneralAlert],
    );

    /**
     * Validates and completes file selection
     *
     * @param fileData The file data received from the picker
     */
    const validateAndCompleteFileSelection = useCallback(
        (fileData: DocumentPickerResponse) => {
            return getDataForUpload(fileData)
                .then((result) => {
                    completeFileSelection.current(result);
                })
                .catch((error: Error) => {
                    showGeneralAlert(error.message);
                    throw error;
                });
        },
        [showGeneralAlert],
    );

    /**
     * Handles the file picker result and sends the selected file to the caller
     *
     * @param files The array of DocumentPickerResponse
     */
    const pickFile = useCallback(
        (files: DocumentPickerResponse[] | void = []): Promise<void> | undefined => {
            if (!files || files.length === 0) {
                onCanceled.current();
                return Promise.resolve();
            }
            const fileData = files[0];

            if (!fileData) {
                onCanceled.current();
                return Promise.resolve();
            }

            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const fileDataUri = fileData.fileCopyUri ?? '';
            const fileDataName = getFileDataName(fileData);
            const fileDataObject: DocumentPickerResponse = {
                name: fileDataName,
                uri: fileDataUri,
                type: fileData.type ?? '',
                fileCopyUri: fileDataUri,
                size: fileData.size ?? 0,
            };
            /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
            validateAndCompleteFileSelection(fileDataObject);
        },
        [validateAndCompleteFileSelection],
    );

    /**
     * Opens the file picker
     *
     * @param onPickedHandler A callback that will be called with the selected file
     * @param onCanceledHandler A callback that will be called if the file is canceled
     */
    const open = (onPickedHandler: (file: FileObject) => void, onCanceledHandler: () => void = () => {}) => {
        completeFileSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;
        showFilePicker().then(pickFile).catch(console.error);
    };

    /**
     * Call the `children` render prop with the interface defined in propTypes
     */
    const renderChildren = (): React.ReactNode =>
        children({
            openPicker: ({onPicked, onCanceled: newOnCanceled}) => open(onPicked, newOnCanceled),
        });

    return <>{renderChildren()}</>;
}

FilePicker.displayName = 'FilePicker';

export default FilePicker;
