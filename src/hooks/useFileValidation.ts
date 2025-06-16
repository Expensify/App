import {Str} from 'expensify-common';
import {useState} from 'react';
import type {ValueOf} from 'type-fest';
import {resizeImageIfNeeded, validateAttachment, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';

function useFileValidation() {
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [pdfFile, setPdfFile] = useState<null | FileObject>(null);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>) => {
        setIsAttachmentInvalid(true);
        setFileError(error);
        setPdfFile(null);
    };

    const validateAndResizeFile = (originalFile: FileObject, setReceiptAndNavigate: (file: FileObject) => void, isPdfValidated?: boolean, isCheckingMultipleFiles?: boolean) => {
        validateImageForCorruption(originalFile)
            .then(() => {
                const error = validateAttachment(originalFile, isCheckingMultipleFiles, true);
                if (error) {
                    setIsAttachmentInvalid(true);
                    setFileError(error);
                    return false;
                }
                // If we have a pdf file and if it is not validated then set the pdf file for validation and return
                if (Str.isPDF(originalFile.name ?? '') && !isPdfValidated) {
                    setPdfFile(originalFile);
                    return;
                }

                // With the image size > 24MB, we use manipulateAsync to resize the image.
                // It takes a long time so we should display a loading indicator while the resize image progresses.
                if (Str.isImage(originalFile.name ?? '') && (originalFile?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                    setIsLoadingReceipt(true);
                }
                resizeImageIfNeeded(originalFile).then((resizedFile) => {
                    setIsLoadingReceipt(false);
                    setReceiptAndNavigate(resizedFile);
                });
            })
            .catch(() => {
                setFileError(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
                return false;
            });
    };

    return {
        validateAndResizeFile,
        isAttachmentInvalid,
        setIsAttachmentInvalid,
        pdfFile,
        setPdfFile,
        setUploadReceiptError,
        isLoadingReceipt,
        fileError,
    };
}

export default useFileValidation;
