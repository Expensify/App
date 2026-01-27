import {keepLocalCopy, pick, types} from '@react-native-documents/picker';
import React, {useCallback, useRef} from 'react';
import {Alert} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import useLocalize from '@hooks/useLocalize';
import {cleanFileName} from '@libs/fileDownload/FileUtils';
import type {FileObject} from '@src/types/utils/Attachment';
import type FilePickerProps from './types';

type LocalCopy = {
    name: string | null;
    uri: string;
    size: number | null;
    type: string | null;
};

/**
 * The data returned from `show` is different on web and mobile,
 * use this function to ensure the data will be handled properly.
 */
const getDataForUpload = (fileData: LocalCopy): Promise<FileObject> => {
    const fileName = fileData.name ?? 'spreadsheet';
    const fileResult: FileObject = {
        name: cleanFileName(fileName),
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
     * Validates and completes file selection
     *
     * @param fileData The file data received from the picker
     */
    const validateAndCompleteFileSelection = useCallback(
        (fileData: LocalCopy | void) => {
            if (!fileData) {
                onCanceled.current();
                return;
            }
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
    const pickFile = async (): Promise<LocalCopy> => {
        const [file] = await pick({
            type: [types.allFiles],
        });

        const [localCopy] = await keepLocalCopy({
            files: [
                {
                    uri: file.uri,
                    fileName: file.name ?? 'spreadsheet',
                },
            ],
            destination: 'cachesDirectory',
        });

        if (localCopy.status !== 'success') {
            throw new Error("Couldn't create local file copy");
        }

        return {
            name: cleanFileName(file.name ?? 'spreadsheet'),
            type: file.type,
            uri: localCopy.localUri,
            size: file.size,
        };
    };

    /**
     * Opens the file picker
     *
     * @param onPickedHandler A callback that will be called with the selected file
     * @param onCanceledHandler A callback that will be called if the file is canceled
     */
    const open = (onPickedHandler: (file: FileObject) => void, onCanceledHandler: () => void = () => {}) => {
        completeFileSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;
        pickFile()
            .catch((error: Error) => {
                if (JSON.stringify(error).includes('OPERATION_CANCELED')) {
                    onCanceled.current();
                    return Promise.resolve();
                }

                showGeneralAlert(error.message);
                throw error;
            })
            .then(validateAndCompleteFileSelection)
            .catch(console.error);
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

export default FilePicker;
