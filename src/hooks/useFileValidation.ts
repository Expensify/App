import {Str} from 'expensify-common';
import {useState} from 'react';
import {resizeImageIfNeeded, validateReceipt} from '@libs/fileDownload/FileUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

function useFileValidation() {
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths>();
    const [attachmentInvalidReason, setAttachmentValidReason] = useState<TranslationPaths>();
    const [pdfFile, setPdfFile] = useState<null | FileObject>(null);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (isInvalid: boolean, title: TranslationPaths, reason: TranslationPaths) => {
        setIsAttachmentInvalid(isInvalid);
        setAttachmentInvalidReasonTitle(title);
        setAttachmentValidReason(reason);
        setPdfFile(null);
    };

    const validateAndResizeFile = (originalFile: FileObject, setReceiptAndNavigate: (file: FileObject) => void, isPdfValidated?: boolean) => {
        validateReceipt(originalFile, setUploadReceiptError).then((isFileValid) => {
            if (!isFileValid) {
                return;
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
        });
    };

    return {
        validateAndResizeFile,
        isAttachmentInvalid,
        setIsAttachmentInvalid,
        attachmentInvalidReason,
        attachmentInvalidReasonTitle,
        setUploadReceiptError,
        pdfFile,
        setPdfFile,
        isLoadingReceipt,
    };
}

export default useFileValidation;
