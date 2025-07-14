import {Str} from 'expensify-common';
import React, {useCallback, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import ConfirmModal from '@components/ConfirmModal';
import {useFullScreenLoader} from '@components/FullScreenLoaderContext';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {
    getFileValidationErrorText,
    isHeicOrHeifImage,
    normalizeFileObject,
    resizeImageIfNeeded,
    splitExtensionFromFileName,
    validateAttachment,
    validateImageForCorruption,
} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

type ErrorObject = {
    error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>;
    fileExtension?: string;
};

function useFilesValidation(proceedWithFilesAction: (files: FileObject[]) => void, isValidatingReceipts = true) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [validFilesToUpload, setValidFilesToUpload] = useState([] as FileObject[]);
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);
    const [invalidFileExtension, setInvalidFileExtension] = useState('');
    const [errorQueue, setErrorQueue] = useState<ErrorObject[]>([]);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
    const {setIsLoaderVisible} = useFullScreenLoader();

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const collectedErrors = useRef<ErrorObject[]>([]);

    const deduplicateErrors = useCallback((errors: ErrorObject[]) => {
        const uniqueErrors = new Set<string>();
        return errors.filter((error) => {
            const key = `${error.error}-${error.fileExtension ?? ''}`;
            if (uniqueErrors.has(key)) {
                return false;
            }
            uniqueErrors.add(key);
            return true;
        });
    }, []);

    const resetValidationState = useCallback(() => {
        setIsErrorModalVisible(false);
        setPdfFilesToRender([]);
        setIsLoaderVisible(false);
        setValidFilesToUpload([]);
        setIsValidatingMultipleFiles(false);
        setFileError(null);
        setInvalidFileExtension('');
        setErrorQueue([]);
        setCurrentErrorIndex(0);
        validatedPDFs.current = [];
        validFiles.current = [];
        filesToValidate.current = [];
        collectedErrors.current = [];
    }, [setIsLoaderVisible]);

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
        return normalizeFileObject(originalFile)
            .then((normalizedFile) =>
                validateImageForCorruption(normalizedFile).then(() => {
                    const error = validateAttachment(normalizedFile, isCheckingMultipleFiles, isValidatingReceipts);
                    if (error) {
                        const errorData = {
                            error,
                            fileExtension: error === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE ? splitExtensionFromFileName(normalizedFile.name ?? '').fileExtension : undefined,
                        };
                        collectedErrors.current.push(errorData);
                        return false;
                    }
                    return true;
                }),
            )
            .catch(() => {
                collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED});
                return false;
            });
    };

    const convertHeicImageToJpegPromise = (file: FileObject): Promise<FileObject> => {
        return new Promise((resolve, reject) => {
            convertHeicImage(file, {
                onSuccess: (convertedFile) => resolve(convertedFile),
                onError: (nonConvertedFile) => {
                    reject(nonConvertedFile);
                },
            });
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
            const uniqueErrors = deduplicateErrors(collectedErrors.current);
            setErrorQueue(uniqueErrors);
            setCurrentErrorIndex(0);
            const firstError = uniqueErrors.at(0);
            if (firstError) {
                setFileError(firstError.error);
                if (firstError.fileExtension) {
                    setInvalidFileExtension(firstError.fileExtension);
                }
                setIsErrorModalVisible(true);
            }
        } else if (validFiles.current.length > 0) {
            proceedWithFilesAction(validFiles.current);
            resetValidationState();
        }
    }, [deduplicateErrors, pdfFilesToRender.length, proceedWithFilesAction, resetValidationState]);

    const validateAndResizeFiles = (files: FileObject[]) => {
        // Early return for empty files
        if (files.length === 0) {
            return;
        }

        // Reset collected errors for new validation
        collectedErrors.current = [];

        Promise.all(files.map((file) => isValidFile(file, files.length > 1).then((isValid) => (isValid ? file : null))))
            .then((validationResults) => {
                const filteredResults = validationResults.filter((result): result is FileObject => result !== null);
                const pdfsToLoad = filteredResults.filter((file) => Str.isPDF(file.name ?? ''));
                const otherFiles = filteredResults.filter((file) => !Str.isPDF(file.name ?? ''));

                // Check if we need to convert images
                if (otherFiles.some((file) => isHeicOrHeifImage(file))) {
                    setIsLoaderVisible(true);

                    return Promise.all(otherFiles.map((file) => convertHeicImageToJpegPromise(file))).then((convertedImages) => {
                        // Check if we need to resize images
                        if (convertedImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                            return Promise.all(convertedImages.map((file) => resizeImageIfNeeded(file))).then((processedFiles) => {
                                setIsLoaderVisible(false);
                                return Promise.resolve({processedFiles, pdfsToLoad});
                            });
                        }

                        // No resizing needed, just return the converted images
                        setIsLoaderVisible(false);
                        return Promise.resolve({processedFiles: convertedImages, pdfsToLoad});
                    });
                }

                // No conversion needed, but check if we need to resize images
                if (otherFiles.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                    setIsLoaderVisible(true);
                    return Promise.all(otherFiles.map((file) => resizeImageIfNeeded(file))).then((processedFiles) => {
                        setIsLoaderVisible(false);
                        return Promise.resolve({processedFiles, pdfsToLoad});
                    });
                }

                // No conversion or resizing needed, just return the valid images
                return Promise.resolve({processedFiles: otherFiles, pdfsToLoad});
            })
            .then(({processedFiles, pdfsToLoad}) => {
                if (pdfsToLoad.length) {
                    validFiles.current = processedFiles;
                    setPdfFilesToRender(pdfsToLoad);
                } else {
                    if (processedFiles.length > 0) {
                        setValidFilesToUpload(processedFiles);
                    }

                    if (collectedErrors.current.length > 0) {
                        const uniqueErrors = Array.from(new Set(collectedErrors.current.map((error) => JSON.stringify(error)))).map((errorStr) => JSON.parse(errorStr) as ErrorObject);
                        setErrorQueue(uniqueErrors);
                        setCurrentErrorIndex(0);
                        const firstError = uniqueErrors.at(0);
                        if (firstError) {
                            setFileError(firstError.error);
                            if (firstError.fileExtension) {
                                setInvalidFileExtension(firstError.fileExtension);
                            }
                            setIsErrorModalVisible(true);
                        }
                    } else if (processedFiles.length > 0) {
                        proceedWithFilesAction(processedFiles);
                        resetValidationState();
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
                if (validFiles.current.length === 0) {
                    setIsValidatingMultipleFiles(false);
                }
                setCurrentErrorIndex(nextIndex);
                setFileError(nextError.error);
                setInvalidFileExtension(nextError.fileExtension ?? '');
                return;
            }
        }

        // If we're validating attachments we need to use InteractionManager to ensure
        // the error modal is dismissed before opening the attachment modal
        if (!isValidatingReceipts && fileError) {
            setIsErrorModalVisible(false);
            InteractionManager.runAfterInteractions(() => {
                proceedWithFilesAction(validFilesToUpload);
                resetValidationState();
            });
        } else {
            proceedWithFilesAction(validFilesToUpload);
            hideModalAndReset();
        }
    };

    const PDFValidationComponent = pdfFilesToRender.length
        ? pdfFilesToRender.map((file) => (
              <PDFThumbnail
                  key={file.uri}
                  style={styles.invisiblePDF}
                  previewSourceURL={file.uri ?? ''}
                  onLoadSuccess={() => {
                      validatedPDFs.current.push(file);
                      validFiles.current.push(file);
                      checkIfAllValidatedAndProceed();
                  }}
                  onPassword={() => {
                      validatedPDFs.current.push(file);
                      if (isValidatingReceipts) {
                          collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.PROTECTED_FILE});
                      } else {
                          validFiles.current.push(file);
                      }
                      checkIfAllValidatedAndProceed();
                  }}
                  onLoadError={() => {
                      validatedPDFs.current.push(file);
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
        const prompt = getFileValidationErrorText(fileError, {fileType: invalidFileExtension}, isValidatingReceipts).reason;
        if (fileError === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE || fileError === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE) {
            return (
                <Text>
                    {prompt}
                    <TextLink href={CONST.BULK_UPLOAD_HELP_URL}> {translate('attachmentPicker.learnMoreAboutSupportedFiles')}</TextLink>
                </Text>
            );
        }
        return prompt;
    }, [fileError, invalidFileExtension, isValidatingReceipts, translate]);

    const ErrorModal = (
        <ConfirmModal
            title={getFileValidationErrorText(fileError, {fileType: invalidFileExtension}, isValidatingReceipts).title}
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
        PDFValidationComponent,
        validateFiles,
        ErrorModal,
    };
}

export default useFilesValidation;
