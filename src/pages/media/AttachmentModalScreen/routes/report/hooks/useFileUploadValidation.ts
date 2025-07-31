import {useCallback, useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {
    MultipleAttachmentsInvalidResult,
    MultipleAttachmentsValidationError,
    MultipleAttachmentsValidResult,
    SingleAttachmentInvalidResult,
    SingleAttachmentValidationError,
    SingleAttachmentValidResult,
} from '@libs/AttachmentValidation';
import {validateAttachmentFile, validateMultipleAttachmentFiles} from '@libs/AttachmentValidation';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';

type UseFileUploadValidationProps = {
    files: FileObject | FileObject[] | undefined;
    onValid?: (result: SingleAttachmentValidResult | MultipleAttachmentsValidResult) => void;
    onInvalid?: (result: SingleAttachmentInvalidResult | MultipleAttachmentsInvalidResult) => void;
};

function useFileUploadValidation({files, onValid, onInvalid}: UseFileUploadValidationProps) {
    const [validFilesToUpload, setValidFilesToUpload] = useState<FileObject | FileObject[]>();
    const [fileError, setFileError] = useState<SingleAttachmentValidationError | MultipleAttachmentsValidationError>();
    const [isFileErrorModalVisible, setIsFileErrorModalVisible] = useState(false);

    // Validates the attachment file and renders the appropriate modal type or errors
    const validateFile = useCallback(
        (file: FileObject | FileObject[]) => {
            if (!file) {
                return;
            }

            if (Array.isArray(file)) {
                validateMultipleAttachmentFiles(file).then((result) => {
                    if (result.isValid) {
                        const validFiles = result.validatedFiles.map((f) => f.file);
                        setValidFilesToUpload(validFiles);
                        onValid?.(result);
                        return;
                    }

                    setFileError(result.error);
                    setIsFileErrorModalVisible(true);

                    if (result.error === CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
                        const validFiles = file.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                        setValidFilesToUpload(validFiles);
                    }

                    onInvalid?.(result);
                });
                return;
            }

            validateAttachmentFile(file).then((result) => {
                if (result.isValid) {
                    const {validatedFile} = result;
                    setValidFilesToUpload(validatedFile.file);

                    onValid?.(result);
                    return;
                }

                const {error} = result;
                setFileError(error);

                onInvalid?.(result);
            });
        },
        [onInvalid, onValid],
    );

    useEffect(() => {
        if (!files) {
            return;
        }

        setIsFileErrorModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            setFileError(undefined);
        });

        validateFile(files);
    }, [files, validateFile]);

    return {validFilesToUpload, fileError, isFileErrorModalVisible};
}

export default useFileUploadValidation;
