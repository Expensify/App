import {Str} from 'expensify-common';
import React, {useCallback, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import {useFullScreenLoader} from '@components/FullScreenLoaderContext';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {validateAttachmentFile, validateMultipleAttachmentFiles} from '@libs/AttachmentValidation';
import type {SingleAttachmentInvalidResult, SingleAttachmentValidationError} from '@libs/AttachmentValidation';
import {getFileValidationErrorText, resizeImageIfNeeded} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

type ErrorObject = {
    error: SingleAttachmentValidationError;
    fileExtension?: string;
};

const sortFilesByOriginalOrder = (files: FileObject[], orderMap: Map<string, number>) => {
    return files.sort((a, b) => (orderMap.get(a.uri ?? '') ?? 0) - (orderMap.get(b.uri ?? '') ?? 0));
};

function useFilesValidation(onFilesValidated: (files: FileObject[]) => void, isValidatingReceipts = true, onSourceChanged?: (source: string | undefined) => void) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<SingleAttachmentValidationError>();
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [validFilesToUpload, setValidFilesToUpload] = useState<FileObject[]>([]);
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);
    const [invalidFileExtension, setInvalidFileExtension] = useState('');
    const [errorQueue, setErrorQueue] = useState<ErrorObject[]>([]);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
    const {setIsLoaderVisible} = useFullScreenLoader();

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const invalidFileResults = useRef<SingleAttachmentInvalidResult[]>([]);
    const dataTransferItemList = useRef<DataTransferItem[]>([]);
    const collectedErrors = useRef<ErrorObject[]>([]);
    const originalFileOrder = useRef<Map<string, number>>(new Map());

    const updateFileOrderMapping = useCallback((oldFile: FileObject | undefined, newFile: FileObject) => {
        const originalIndex = originalFileOrder.current.get(oldFile?.uri ?? '');
        if (originalIndex !== undefined) {
            originalFileOrder.current.set(newFile.uri ?? '', originalIndex);
        }
    }, []);

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
        setFileError(undefined);
        setInvalidFileExtension('');
        setErrorQueue([]);
        setCurrentErrorIndex(0);
        validatedPDFs.current = [];
        validFiles.current = [];
        filesToValidate.current = [];
        dataTransferItemList.current = [];
        collectedErrors.current = [];
        originalFileOrder.current.clear();
    }, [setIsLoaderVisible]);

    const hideModalAndReset = useCallback(() => {
        setIsErrorModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            resetValidationState();
        });
    }, [resetValidationState]);

    const setErrorAndOpenModal = (error: SingleAttachmentValidationError) => {
        setFileError(error);
        setIsErrorModalVisible(true);
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
            const sortedFiles = sortFilesByOriginalOrder(validFiles.current, originalFileOrder.current);
            onFilesValidated(sortedFiles);
            resetValidationState();
        }
    }, [deduplicateErrors, pdfFilesToRender.length, onFilesValidated, resetValidationState]);

    // Helper function to process remaining files (resizing and final resolution)
    const processRemainingFiles = useCallback(
        (
            convertedFiles: FileObject[],
            validFilesToProcess: FileObject[],
            filesToResize: FileObject[],
            pdfsToLoad: FileObject[],
            resolve: (value: {processedFiles: FileObject[]; pdfsToLoad: FileObject[]}) => void,
        ) => {
            if (filesToResize.length > 0) {
                setIsLoaderVisible(true);

                Promise.all(filesToResize.map((file) => resizeImageIfNeeded(file)))
                    .then((resizedFiles) => {
                        resizedFiles.forEach((resizedFile, index) => {
                            updateFileOrderMapping(filesToResize.at(index), resizedFile);
                        });

                        setIsLoaderVisible(false);
                        const allProcessedFiles = [...convertedFiles, ...validFilesToProcess, ...resizedFiles];
                        resolve({processedFiles: allProcessedFiles, pdfsToLoad});
                    })
                    .catch((error) => {
                        console.error('Error resizing files:', error);
                        setIsLoaderVisible(false);
                        // Fallback to files without resizing
                        const allProcessedFiles = [...convertedFiles, ...validFilesToProcess, ...filesToResize];
                        resolve({processedFiles: allProcessedFiles, pdfsToLoad});
                    });
            } else {
                // No resizing needed, return all processed files
                const allProcessedFiles = [...convertedFiles, ...validFilesToProcess];
                resolve({processedFiles: allProcessedFiles, pdfsToLoad});
            }
        },
        [setIsLoaderVisible, updateFileOrderMapping],
    );

    const convertAndResizeFiles = (invalidResults: SingleAttachmentInvalidResult[], files: FileObject[]) => {
        new Promise<{processedFiles: FileObject[]; pdfsToLoad: FileObject[]}>((resolve) => {
            const filteredResults = files.filter((result): result is FileObject => result !== null);
            const pdfsToLoad = filteredResults.filter((file) => Str.isPDF(file.name ?? ''));
            const otherFiles = filteredResults.filter((file) => !Str.isPDF(file.name ?? ''));

            // Group invalid results by error type for efficient processing
            const heicOrHeifResults = invalidResults.filter((result) => result.error === CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.HEIC_OR_HEIF_IMAGE);
            const fileTooLargeResults = invalidResults.filter((result) => result.error === CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE);

            // Get files that need conversion (HEIC/HEIF)
            const filesToConvert = heicOrHeifResults.map((result) => result.file);

            // Get files that need resizing (too large)
            const filesToResize = fileTooLargeResults.map((result) => result.file);

            // Get files that are valid and don't need processing
            const validFilesToProcess = otherFiles.filter(
                (file) => !filesToConvert.some((convertFile) => convertFile.uri === file.uri) && !filesToResize.some((resizeFile) => resizeFile.uri === file.uri),
            );

            // Process files that need conversion
            if (filesToConvert.length > 0) {
                setIsLoaderVisible(true);

                Promise.all(filesToConvert.map((file) => convertHeicImageToJpegPromise(file)))
                    .then((convertedFiles) => {
                        // Update file order mapping for converted files
                        convertedFiles.forEach((convertedFile, index) => {
                            updateFileOrderMapping(filesToConvert.at(index), convertedFile);
                        });

                        // Check if converted files also need resizing
                        const convertedFilesNeedingResize = convertedFiles.filter((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);

                        if (convertedFilesNeedingResize.length > 0) {
                            // Resize converted files that are too large
                            Promise.all(convertedFilesNeedingResize.map((file) => resizeImageIfNeeded(file))).then((resizedConvertedFiles) => {
                                resizedConvertedFiles.forEach((resizedFile, index) => {
                                    updateFileOrderMapping(convertedFilesNeedingResize.at(index), resizedFile);
                                });

                                // Process remaining files that need resizing (not converted)
                                processRemainingFiles(convertedFiles, validFilesToProcess, filesToResize, pdfsToLoad, resolve);
                            });
                        } else {
                            // No resizing needed for converted files, process remaining files
                            processRemainingFiles(convertedFiles, validFilesToProcess, filesToResize, pdfsToLoad, resolve);
                        }
                    })
                    .catch((error) => {
                        console.error('Error converting HEIC/HEIF files:', error);
                        setIsLoaderVisible(false);
                        // Fallback to processing remaining files without conversion
                        processRemainingFiles([], validFilesToProcess, filesToResize, pdfsToLoad, resolve);
                    });
            } else {
                // No conversion needed, process remaining files
                processRemainingFiles([], validFilesToProcess, filesToResize, pdfsToLoad, resolve);
            }
        }).then(({processedFiles, pdfsToLoad}) => {
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
                    const sortedFiles = sortFilesByOriginalOrder(processedFiles, originalFileOrder.current);
                    onFilesValidated(sortedFiles);
                    resetValidationState();
                }
            }
        });
    };

    const validateFiles = (files: File | FileObject[], items?: DataTransferItem[]) => {
        if (!files) {
            return;
        }

        // Reset collected errors for new validation
        collectedErrors.current = [];

        if (Array.isArray(files)) {
            setIsValidatingMultipleFiles(true);

            files.forEach((file, index) => {
                originalFileOrder.current.set(file.uri ?? '', index);
            });

            validateMultipleAttachmentFiles(files, items).then((result) => {
                if (result.isValid) {
                    onSourceChanged?.(result.validatedFiles.at(0)?.source);
                    onFilesValidated(result.validatedFiles);
                    return;
                }

                if (result.error === CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED) {
                    filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                    if (items) {
                        dataTransferItemList.current = items.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                    }
                }

                invalidFileResults.current = result.fileResults.filter((r) => r.isValid === false);
                convertAndResizeFiles(invalidFileResults.current, files);
                collectedErrors.current.push({error: result.error});
                setErrorAndOpenModal(result.error);
            });
            return;
        }

        originalFileOrder.current.set(files.uri ?? '', 0);

        validateAttachmentFile(files, items?.at(0)).then((result) => {
            if (result.isValid) {
                onSourceChanged?.(result.validatedFile.source);
                onFilesValidated([result.validatedFile.file]);
                return;
            }

            invalidFileResults.current = [result].filter((r) => r.isValid === false);
            convertAndResizeFiles(invalidFileResults.current, [files]);
            collectedErrors.current.push({error: result.error});
            setErrorAndOpenModal(result.error);
        });
    };

    const onConfirm = () => {
        if (fileError === CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED) {
            setIsErrorModalVisible(false);
            convertAndResizeFiles(invalidFileResults.current, filesToValidate.current);
            return;
        }

        if (currentErrorIndex < errorQueue.length - 1) {
            const nextIndex = currentErrorIndex + 1;
            const nextError = errorQueue.at(nextIndex);
            if (nextError) {
                if (isValidatingMultipleFiles && currentErrorIndex === errorQueue.length - 2 && validFilesToUpload.length === 0) {
                    setIsValidatingMultipleFiles(false);
                }
                setCurrentErrorIndex(nextIndex);
                setFileError(nextError.error);
                setInvalidFileExtension(nextError.fileExtension ?? '');
                return;
            }
        }

        const sortedFiles = sortFilesByOriginalOrder(validFilesToUpload, originalFileOrder.current);
        // If we're validating attachments we need to use InteractionManager to ensure
        // the error modal is dismissed before opening the attachment modal
        if (!isValidatingReceipts && fileError) {
            setIsErrorModalVisible(false);
            InteractionManager.runAfterInteractions(() => {
                if (sortedFiles.length !== 0) {
                    onFilesValidated(sortedFiles);
                }
                resetValidationState();
            });
        } else {
            if (sortedFiles.length !== 0) {
                onFilesValidated(sortedFiles);
            }
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
                          collectedErrors.current.push({error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.PROTECTED_FILE});
                      } else {
                          validFiles.current.push(file);
                      }
                      checkIfAllValidatedAndProceed();
                  }}
                  onLoadError={() => {
                      validatedPDFs.current.push(file);
                      collectedErrors.current.push({error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_CORRUPTED});
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
        if (fileError === CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.WRONG_FILE_TYPE || fileError === CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE) {
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
        validateFiles,
        PDFValidationComponent,
        ErrorModal,
    };
}

export default useFilesValidation;
