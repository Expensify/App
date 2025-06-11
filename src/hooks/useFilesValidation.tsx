import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import PDFThumbnail from '@components/PDFThumbnail';
import {resizeImageIfNeeded, validateAttachment, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import useThemeStyles from './useThemeStyles';

// TODO: merge with useFilesValidation later to prevent code duplication

function useFilesValidation(proceedWithFileAction: (file: FileObject) => void) {
    const styles = useThemeStyles();
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [pdfFiles, setPdfFiles] = useState<FileObject[]>([]);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);
    const [validFilesToUpload, setValidFilesToUpload] = useState([] as FileObject[]);

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);


    const resetValidationState = () => {
        setIsAttachmentInvalid(false);
        setPdfFiles([]);
        setIsLoadingReceipt(false);
        setFileError(null);
        setValidFilesToUpload([]);
        validatedPDFs.current = [];
        validFiles.current = [];
    }

    useEffect(() => {
        if (fileError) {
            return;
        }
        if (validFilesToUpload.length && !fileError) {
            // @ts-expect-error it won't be undefined
            proceedWithFileAction(validFilesToUpload.at(0));
            resetValidationState();
        }
    }, [fileError, proceedWithFileAction, validFilesToUpload]);
    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>) => {
        setIsAttachmentInvalid(true);
        setFileError(error);
    };

    const isValidFile = (originalFile: FileObject, isCheckingMultipleFiles?: boolean) => {
        return validateImageForCorruption(originalFile)
            .then(() => {
                const error = validateAttachment(originalFile, isCheckingMultipleFiles, true);
                if (error) {
                    setIsAttachmentInvalid(true);
                    setFileError(error);
                    return false;
                }
                return true;
            })
            .catch(() => {
                setFileError(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
                return false;
            });
    };

    const checkIfAllValidatedAndProceed = (error: boolean) => {
        if (!validatedPDFs.current || !validFiles.current) {
            return;
        }

        if (validatedPDFs.current.length !== pdfFiles.length) {
            return;
        }

        if (!error) {
            setValidFilesToUpload(validFiles.current);
        }
    };

    const validateFiles = (files: FileObject[]) => {
        if (!files.length) {
            return;
        }

        let validImages = [] as FileObject[];
        let pdfsToLoad = [] as FileObject[];
        Promise.all(files.map((file) => isValidFile(file, true).then((isValid) => (isValid ? file : null)))).then((results) => {
            const filteredResults = results.filter((result): result is FileObject => result !== null);
            validImages = filteredResults.filter((file) => !Str.isPDF(file.name ?? ''));
            pdfsToLoad = filteredResults.filter((file) => Str.isPDF(file.name ?? ''));

            if (validImages.length && validImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                setIsLoadingReceipt(true);
                Promise.all(validImages.map((file) => resizeImageIfNeeded(file))).then((resizedFiles) => {
                    validImages = resizedFiles;
                    setIsLoadingReceipt(false);
                });
            }

            if (validImages.length === 1 && !pdfsToLoad.length) {
                // eslint-disable-next-line
                proceedWithFileAction(validImages[0]);
                resetValidationState();
            }

            if (pdfsToLoad.length) {
                validFiles.current = validImages;
                setPdfFiles(pdfsToLoad);
            } else {
                setValidFilesToUpload(validImages);
            }
        });
    };

    const PDFValidationComponent = pdfFiles.length
        ? pdfFiles.map((file) => (
              <PDFThumbnail
                  key={file.uri}
                  style={styles.invisiblePDF}
                  previewSourceURL={file.uri ?? ''}
                  onLoadSuccess={() => {
                      validatedPDFs.current = [...(validatedPDFs.current ?? []), file];
                      validFiles.current = [...(validFiles.current ?? []), file];
                      checkIfAllValidatedAndProceed(false);
                  }}
                  onPassword={() => {
                      validatedPDFs.current = [...(validatedPDFs.current ?? []), file];
                      setUploadReceiptError(CONST.FILE_VALIDATION_ERRORS.PROTECTED_FILE);
                      checkIfAllValidatedAndProceed(true);
                  }}
                  onLoadError={() => {
                      validatedPDFs.current = [...(validatedPDFs.current ?? []), file];
                      setUploadReceiptError(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
                      checkIfAllValidatedAndProceed(true);
                  }}
              />
          ))
        : undefined;

    return {
        isAttachmentInvalid,
        setIsAttachmentInvalid,
        isLoadingReceipt,
        fileError,
        PDFValidationComponent,
        validateFiles,
    };
}

export default useFilesValidation;
