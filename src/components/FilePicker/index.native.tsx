import {keepLocalCopy, pick, types} from '@react-native-documents/picker';
import React, {useCallback, useRef} from 'react';
import {Alert} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import type {FileObject} from '@components/AttachmentModal';
import useLocalize from '@hooks/useLocalize';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import type FilePickerProps from './types';

/**
 * The data returned from `show` is different on web and mobile,
 * use this function to ensure the data will be handled properly.
 */
const getDataForUpload = (fileData: FileObject): Promise<FileObject> => {
    if (fileData.size) {
        return Promise.resolve(fileData);
    }

    return RNFetchBlob.fs.stat(fileData.uri!.replace('file://', '')).then((stats) => {
        fileData.size = stats.size;
        return fileData;
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
        (fileData: FileObject) => {
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
     * Opens the file picker
     *
     * @param onPickedHandler A callback that will be called with the selected file
     * @param onCanceledHandler A callback that will be called if the file is canceled
     */
    // eslint-disable-next-line @lwc/lwc/no-async-await
    const open = async (onPickedHandler: (file: FileObject) => void, onCanceledHandler: () => void = () => {}) => {
        completeFileSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;

        try {
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

            const fileResult: FileObject = {
                name: FileUtils.cleanFileName(file.name ?? 'spreadsheet'),
                type: file.type ?? undefined,
                uri: localCopy.sourceUri,
                size: file.size,
            };

            validateAndCompleteFileSelection(fileResult);
        } catch (error) {
            showGeneralAlert(error.message);
            throw error;
        }
    };

    /**
     * Call the `children` render prop with the interface defined in propTypes
     */
    const renderChildren = (): React.ReactNode =>
        children({
            openPicker: ({onPicked, onCanceled: newOnCanceled}) => open(onPicked, newOnCanceled),
        });

    // eslint-disable-next-line react-compiler/react-compiler
    return <>{renderChildren()}</>;
}

FilePicker.displayName = 'FilePicker';

export default FilePicker;
