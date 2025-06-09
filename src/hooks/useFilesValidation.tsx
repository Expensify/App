import {Str} from 'expensify-common';
import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import PDFThumbnail from '@components/PDFThumbnail';
import useThemeStyles from '@hooks/useThemeStyles';
import {resizeImageIfNeeded, validateAttachment, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';

// TODO: merge with useFilesValidation later to prevent code duplication

function useFilesValidation(proceedWithFileAction: (file: FileObject) => void) {
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [pdfFile, setPdfFile] = useState<null | FileObject>(null);
    const [pdfFiles, setPdfFiles] = useState<FileObject[]>([]);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);

    const styles = useThemeStyles();

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>) => {
        setIsAttachmentInvalid(true);
        setFileError(error);
        setPdfFile(null);
    };

    // TODO: make it accept several files
    const validateAndResizeFile = (originalFile: FileObject, isPdfValidated?: boolean, isCheckingMultipleFiles?: boolean) => {
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
                    proceedWithFileAction(resizedFile);
                });
            })
            .catch(() => {
                setFileError(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
                return false;
            });
    };

    const pdfFilesToRender = pdfFiles.length ? pdfFiles : ([pdfFile].filter(Boolean) as FileObject[]);

    const PDFValidationComponent = pdfFilesToRender.length
        ? pdfFilesToRender.map((file) => (
              <PDFThumbnail
                  key={file.uri}
                  style={styles.invisiblePDF}
                  previewSourceURL={file.uri ?? ''}
                  onLoadSuccess={() => {
                      setPdfFile(null);
                      validateAndResizeFile(file, true);
                  }}
                  onPassword={() => setUploadReceiptError(CONST.FILE_VALIDATION_ERRORS.PROTECTED_FILE)}
                  onLoadError={() => setUploadReceiptError(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED)}
              />
          ))
        : undefined;

    return {
        validateAndResizeFile,
        isAttachmentInvalid,
        setIsAttachmentInvalid,
        pdfFile,
        setPdfFile,
        setUploadReceiptError,
        isLoadingReceipt,
        fileError,
        PDFValidationComponent,
        setPdfFiles,
    };
}

export default useFilesValidation;
