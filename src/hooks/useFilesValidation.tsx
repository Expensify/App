import {Str} from 'expensify-common';
import React, {useCallback, useRef, useState} from 'react';
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

type ErrorObject = {
    error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>;
    fileExtension?: string;
};

function useFilesValidation(proceedWithFileAction: (file: FileObject) => void) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const [validFilesToUpload, setValidFilesToUpload] = useState([] as FileObject[]);
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);
    const [invalidFileExtension, setInvalidFileExtension] = useState('');
    const [errorQueue, setErrorQueue] = useState<ErrorObject[]>([]);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const collectedErrors = useRef<ErrorObject[]>([]);

    const resetValidationState = useCallback(() => {
        setIsErrorModalVisible(false);
        setPdfFilesToRender([]);
        setIsLoadingReceipt(false);
        setIsValidatingMultipleFiles(false);
        setFileError(null);
        setValidFilesToUpload([]);
        setInvalidFileExtension('');
        setErrorQueue([]);
        setCurrentErrorIndex(0);
        validatedPDFs.current = [];
        validFiles.current = [];
        filesToValidate.current = [];
        collectedErrors.current = [];
    }, []);

    const hideModalAndReset = useCallback(() => {
        setIsErrorModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            resetValidationState();
        });
    }, [resetValidationState]);


    const setErrorAndOpenModal = (error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>) => {
        setFileError(error);
        setIsErrorModalVisible(true);
    };

    const isValidFile = (originalFile: FileObject, isCheckingMultipleFiles?: boolean) => {
        return validateImageForCorruption(originalFile)
            .then(() => {
                const error = validateAttachment(originalFile, isCheckingMultipleFiles, true);
                if (error) {
                    const errorData = {
                        error,
                        fileExtension: error === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE ? splitExtensionFromFileName(originalFile.name ?? '').fileExtension : undefined,
                    };
                    collectedErrors.current.push(errorData);
                    return false;
                }
                return true;
            })
            .catch(() => {
                collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED});
                return false;
            });
    };

    const checkIfAllValidatedAndProceed = useCallback(() => {
        if (!validatedPDFs.current || !validFiles.current) {
            return;
        }

        if (validatedPDFs.current.length !== pdfFilesToRender.length) {
            return;
        }

        if (validFiles.current.length > 0) {
            setValidFilesToUpload(validFiles.current);
        }

        if (collectedErrors.current.length > 0) {
            setErrorQueue(collectedErrors.current);
            setCurrentErrorIndex(0);
            const firstError = collectedErrors.current.at(0);
            if (firstError) {
                setFileError(firstError.error);
                if (firstError.fileExtension) {
                    setInvalidFileExtension(firstError.fileExtension);
                }
                setIsErrorModalVisible(true);
            }
        } else if (validFiles.current.length > 0) {
            // No errors, proceed with valid files
            const firstValidFile = validFiles.current.at(0);
            if (firstValidFile) {
                proceedWithFileAction(firstValidFile);
                resetValidationState();
            }
        }
    }, [pdfFilesToRender.length, proceedWithFileAction, resetValidationState]);

    const validateAndResizeFiles = (files: FileObject[]) => {
        // Reset collected errors for new validation
        collectedErrors.current = [];

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
                    if (processedImages.length > 0) {
                        setValidFilesToUpload(processedImages);
                    }

                    if (collectedErrors.current.length > 0) {
                        setErrorQueue(collectedErrors.current);
                        setCurrentErrorIndex(0);
                        const firstError = collectedErrors.current.at(0);
                        if (firstError) {
                            setFileError(firstError.error);
                            if (firstError.fileExtension) {
                                setInvalidFileExtension(firstError.fileExtension);
                            }
                            setIsErrorModalVisible(true);
                        }
                    } else if (processedImages.length > 0) {
                        // No errors, proceed with valid files immediately
                        const firstValidFile = processedImages.at(0);
                        if (firstValidFile) {
                            proceedWithFileAction(firstValidFile);
                            resetValidationState();
                        }
                    }
                }
            });
    };

    const validateFiles = (files: FileObject[]) => {
        if (files.length > 1) {
            setIsValidatingMultipleFiles(true);
        }
        if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
            filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            setErrorAndOpenModal(CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED);
        } else {
            validateAndResizeFiles(files);
        }
    };

    const onConfirm = () => {
        if (fileError === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            setIsErrorModalVisible(false);
            validateAndResizeFiles(filesToValidate.current);
            return;
        }

        if (currentErrorIndex < errorQueue.length - 1) {
            const nextIndex = currentErrorIndex + 1;
            const nextError = errorQueue.at(nextIndex);
            if (nextError) {
                setCurrentErrorIndex(nextIndex);
                setFileError(nextError.error);
                setInvalidFileExtension(nextError.fileExtension ?? '');
                return;
            }
        }

        // All errors have been shown, proceed with valid files
        const firstValidFile = validFilesToUpload.at(0);
        if (firstValidFile) {
            proceedWithFileAction(firstValidFile);
        }
        hideModalAndReset();
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
                      checkIfAllValidatedAndProceed();
                  }}
                  onPassword={() => {
                      validatedPDFs.current = [...(validatedPDFs.current ?? []), file];
                      collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.PROTECTED_FILE});
                      checkIfAllValidatedAndProceed();
                  }}
                  onLoadError={() => {
                      validatedPDFs.current = [...(validatedPDFs.current ?? []), file];
                      collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED});
                      checkIfAllValidatedAndProceed();
                  }}
              />
          ))
        : undefined;

    const getModalPrompt = useCallback(() => {
        if (!fileError) {
            return '';
        }
        const prompt = getFileValidationErrorText(fileError, {fileType: invalidFileExtension}).reason;
        if (fileError === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE) {
            return (
                <Text>
                    {prompt}
                    <TextLink href=""> {translate('attachmentPicker.learnMoreAboutSupportedFiles')}</TextLink>
                </Text>
            );
        }
        return prompt;
    }, [fileError, invalidFileExtension, translate]);

    const ErrorModal = (
        <ConfirmModal
            title={getFileValidationErrorText(fileError, {fileType: invalidFileExtension}).title}
            onConfirm={onConfirm}
            onCancel={hideModalAndReset}
            isVisible={isErrorModalVisible}
            prompt={getModalPrompt()}
            confirmText={translate(isValidatingMultipleFiles ? 'common.continue' : 'common.close')}
            cancelText={translate('common.cancel')}
            shouldShowCancelButton={isValidatingMultipleFiles}
        />
    );

    return {
        isLoadingReceipt,
        PDFValidationComponent,
        validateFiles,
        ErrorModal,
    };
}

export default useFilesValidation;
