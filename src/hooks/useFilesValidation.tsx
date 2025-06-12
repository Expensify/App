import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import ConfirmModal from '@components/ConfirmModal';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {getFileValidationErrorText, resizeImageIfNeeded, splitExtensionFromFileName, validateAttachment, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

// TODO: merge with useFilesValidation later to prevent code duplication

function useFilesValidation(proceedWithFileAction: (file: FileObject) => void) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const [validFilesToUpload, setValidFilesToUpload] = useState([] as FileObject[]);
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);
    const [invalidFileExtension, setInvalidFileExtension] = useState('');

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);

    const resetValidationState = () => {
        setIsAttachmentInvalid(false);
        setPdfFilesToRender([]);
        setIsLoadingReceipt(false);
        setIsValidatingMultipleFiles(false);
        setFileError(null);
        setValidFilesToUpload([]);
        setInvalidFileExtension('');
        validatedPDFs.current = [];
        validFiles.current = [];
    };

    const hideModalAndReset = () => {
        setIsAttachmentInvalid(false);
        InteractionManager.runAfterInteractions(() => {
            setPdfFilesToRender([]);
            setIsLoadingReceipt(false);
            setIsValidatingMultipleFiles(false);
            setFileError(null);
            setValidFilesToUpload([]);
            setInvalidFileExtension('');
            validatedPDFs.current = [];
            validFiles.current = [];
        });
    };

    const onConfirm = () => {
        if (validFilesToUpload.length) {
            proceedWithFileAction(validFilesToUpload[0]);
        }
        hideModalAndReset();
    };

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
                    if (error === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE) {
                        setInvalidFileExtension(splitExtensionFromFileName(originalFile.name ?? '').fileExtension);
                    }
                    return false;
                }
                return true;
            })
            .catch(() => {
                setFileError(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
                return false;
            });
    };

    const checkIfAllValidatedAndProceed = (shouldProceed: boolean) => {
        if (!validatedPDFs.current || !validFiles.current) {
            return;
        }

        if (validatedPDFs.current.length !== pdfFilesToRender.length) {
            return;
        }

        if (!shouldProceed) {
            setValidFilesToUpload(validFiles.current);
        }
    };

    const validateFiles = (files: FileObject[]) => {
        if (files.length > 1) {
            setIsValidatingMultipleFiles(true);
        }
        Promise.all(files.map((file) => isValidFile(file, files.length > 1).then((isValid) => (isValid ? file : null))))
            .then((validationResults) => {
                const filteredResults = validationResults.filter((result): result is FileObject => result !== null);
                const validImages = filteredResults.filter((file) => !Str.isPDF(file.name ?? ''));
                const pdfsToLoad = filteredResults.filter((file) => Str.isPDF(file.name ?? ''));

                // Check if we need to resize images
                if (validImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                    // Only set loading when we actually need to resize
                    setIsLoadingReceipt(true);

                    // Resize images
                    return Promise.all(validImages.map((file) => resizeImageIfNeeded(file))).then((processedImages) => {
                        setIsLoadingReceipt(false);
                        return {processedImages, pdfsToLoad};
                    });
                }

                // No resizing needed, just return the valid images
                return Promise.resolve({processedImages: validImages, pdfsToLoad});
            })
            .then(({processedImages, pdfsToLoad}) => {
                if (pdfsToLoad.length) {
                    validFiles.current = processedImages;
                    setPdfFilesToRender(pdfsToLoad);
                } else {
                    setValidFilesToUpload(processedImages);
                }
            });
    };

    const PDFValidationComponent = pdfFilesToRender.length
        ? pdfFilesToRender.map((file) => (
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

    const getModalPrompt = () => {
        if (!fileError) {
            return '';
        }
        const prompt = getFileValidationErrorText(fileError, {fileType: invalidFileExtension}).reason;
        if (fileError === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE) {
            return (
                <Text>
                    {prompt}
                    <TextLink href={''}> {translate('attachmentPicker.learnMoreAboutSupportedFiles')}</TextLink>
                </Text>
            );
        }
        return prompt;
    };

    const ErrorModal = (
        <ConfirmModal
            title={getFileValidationErrorText(fileError, {fileType: invalidFileExtension}).title}
            onConfirm={onConfirm}
            onCancel={hideModalAndReset}
            isVisible={isAttachmentInvalid}
            prompt={getModalPrompt()}
            confirmText={translate(isValidatingMultipleFiles ? 'common.continue' : 'common.close')}
            cancelText={translate('common.cancel')}
            shouldShowCancelButton={isValidatingMultipleFiles}
        />
    );

    return {
        isAttachmentInvalid,
        isLoadingReceipt,
        PDFValidationComponent,
        validateFiles,
        ErrorModal,
    };
}

export default useFilesValidation;
