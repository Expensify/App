import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import type UploadFileProps from '@components/UploadFile/types';

import useLocalize from '@hooks/useLocalize';

import {splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ReactNode} from 'react';

import React from 'react';

type UploadFilePickerProps = Pick<
    UploadFileProps,
    'buttonText' | 'acceptedFileTypes' | 'setError' | 'onInputChange' | 'totalFilesSizeLimit' | 'fileLimit' | 'maxFileSize' | 'accessibilityLabel'
> & {
    /** Files uploaded so far, which the file limit and the check for a file with the same name count */
    existingFiles: FileObject[];

    /** Gets the files that pass the checks when the button opens the picker */
    onUpload?: UploadFileProps['onUpload'];

    /** Draws the control that opens the picker in place of the button. The files that pass the checks go to the `onUpload` given to `openPicker`. */
    children?: (openPicker: (onUpload: (files: FileObject[]) => void) => void) => ReactNode;
};

/** The name the server stores a file under: lowercased, with every byte outside a-z, 0-9 and `-` replaced by `_`, and the extension kept */
function getServerFileName(fileName: string): {name: string; extension: string} {
    const extensionStart = fileName.lastIndexOf('.');
    const name = extensionStart > 0 ? fileName.slice(0, extensionStart) : fileName;
    const storedName = Array.from(new TextEncoder().encode(name.toLowerCase()), (byte) => {
        const character = String.fromCharCode(byte);
        return /[a-z0-9-]/.test(character) ? character : '_';
    }).join('');
    return {name: storedName, extension: extensionStart > 0 ? fileName.slice(extensionStart).toLowerCase() : ''};
}

/**
 * A picked file is the same as an uploaded one with the same name, or with the name the server gives the picked file once it saves it.
 * A server name with no letter or digit left, such as one written in Japanese, says nothing about the file, so it is not compared.
 */
function isSameFile(pickedFile: FileObject, uploadedFile: FileObject): boolean {
    const pickedName = pickedFile.name ?? '';
    if (pickedName === uploadedFile.name) {
        return true;
    }
    const serverName = getServerFileName(pickedName);
    return /[a-z0-9]/.test(serverName.name) && `${serverName.name}${serverName.extension}` === uploadedFile.name?.toLowerCase();
}

/** The button, or the control drawn by `children`, that opens the file picker and checks the picked files against the limits before reporting them */
function UploadFilePicker({
    buttonText,
    existingFiles,
    onUpload,
    acceptedFileTypes,
    setError,
    onInputChange = () => {},
    totalFilesSizeLimit = 0,
    fileLimit = 0,
    maxFileSize = 0,
    accessibilityLabel,
    children,
}: UploadFilePickerProps) {
    const {translate} = useLocalize();
    const handleFileUpload = (files: FileObject[], upload: (newFiles: FileObject[]) => void) => {
        const resultedFiles = [...existingFiles, ...files];

        const totalSize = resultedFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);

        if (maxFileSize) {
            const oversizedFile = files.find((file) => (file.size ?? 0) > maxFileSize);
            if (oversizedFile) {
                setError(translate('attachmentPicker.sizeExceededWithLimit', maxFileSize / (1024 * 1024)));
                return;
            }
        }

        if (totalFilesSizeLimit) {
            if (totalSize > totalFilesSizeLimit) {
                setError(translate('attachmentPicker.sizeExceededWithValue', totalFilesSizeLimit / (1024 * 1024)));
                return;
            }
        }

        if (fileLimit && resultedFiles.length > 0 && resultedFiles.length > fileLimit) {
            setError(translate('attachmentPicker.tooManyFiles', fileLimit));
            return;
        }

        if (acceptedFileTypes.length > 0) {
            const filesExtensions = new Set(files.map((file) => splitExtensionFromFileName(file?.name ?? '').fileExtension.toLowerCase()));

            if (acceptedFileTypes.every((element) => !filesExtensions.has(element))) {
                setError(translate('attachmentPicker.notAllowedExtension'));
                return;
            }
        }

        const newFilesToUpload = files.filter((file) => !existingFiles.some((uploadedFile) => isSameFile(file, uploadedFile)));

        // The error is set before the files go on, so a check of the receiver can replace it
        setError(newFilesToUpload.length < files.length ? translate('attachmentPicker.fileAlreadyAdded') : '');
        onInputChange(newFilesToUpload);
        upload(newFilesToUpload);
    };

    return (
        <AttachmentPicker
            acceptedFileTypes={acceptedFileTypes}
            fileLimit={fileLimit}
            allowMultiple={fileLimit > 1}
        >
            {({openPicker}) => {
                const openPickerFor = (upload: (files: FileObject[]) => void) => openPicker({onPicked: (files) => handleFileUpload(files, upload)});
                if (children) {
                    return children(openPickerFor);
                }
                return (
                    <Button
                        sentryLabel={CONST.SENTRY_LABEL.UPLOAD_FILE.UPLOAD_BUTTON}
                        accessibilityLabel={accessibilityLabel ?? buttonText}
                        onPress={() => openPickerFor(onUpload ?? (() => {}))}
                    >
                        <Button.Text>{buttonText}</Button.Text>
                    </Button>
                );
            }}
        </AttachmentPicker>
    );
}

export default UploadFilePicker;
