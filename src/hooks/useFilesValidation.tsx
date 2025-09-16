import {Str} from 'expensify-common';
import React, {useCallback, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import {useFullScreenLoader} from '@components/FullScreenLoaderContext';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {validateAttachmentFile, validateMultipleAttachmentFiles} from '@libs/AttachmentValidation';
import type {MultipleAttachmentsValidationError, SingleAttachmentInvalidResult, SingleAttachmentValidationError} from '@libs/AttachmentValidation';
import {getFileValidationErrorText, isHeicOrHeifImage, resizeImageIfNeeded} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

type ErrorObject = {
    error: SingleAttachmentValidationError | MultipleAttachmentsValidationError;
    fileExtension?: string;
};

const sortFilesByOriginalOrder = (files: FileObject[], orderMap: Map<string, number>) => {
    return files.sort((a, b) => (orderMap.get(a.uri ?? '') ?? 0) - (orderMap.get(b.uri ?? '') ?? 0));
};

function useFilesValidation(onFilesValidated: (files: FileObject[]) => void, isValidatingReceipts = true, onSourceChanged?: (source: string | undefined) => void) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<SingleAttachmentValidationError | MultipleAttachmentsValidationError>();
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

    const setErrorAndOpenModal = (error: SingleAttachmentValidationError | MultipleAttachmentsValidationError) => {
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

    const convertAndResizeFiles = (invalidResults: SingleAttachmentInvalidResult[], files: FileObject[]) => {
        new Promise<{processedFiles: FileObject[]; pdfsToLoad: FileObject[]}>((resolve) => {
            const filteredResults = files.filter((result): result is FileObject => result !== null);
            const pdfsToLoad = filteredResults.filter((file) => Str.isPDF(file.name ?? ''));
            const otherFiles = filteredResults.filter((file) => !Str.isPDF(file.name ?? ''));

            const heicOrImageResults = invalidResults.filter((result) => result.error === CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.HEIC_OR_HEIF_IMAGE);

            heicOrImageResults.map((result) => {
                    setIsLoaderVisible(true);

                Promise.all(result.map((result) => convertHeicImageToJpegPromise(result.file))).then((convertedImages) => {
                    convertedImages.forEach((convertedFile, index) => {
                        updateFileOrderMapping(otherFiles.at(index), convertedFile);
                    });

                    // Check if we need to resize images
                    if (convertedImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                        Promise.all(convertedImages.map((file) => resizeImageIfNeeded(file))).then((processedFiles) => {
                            processedFiles.forEach((resizedFile, index) => {
                                updateFileOrderMapping(convertedImages.at(index), resizedFile);
                            });
                            setIsLoaderVisible(false);
                            resolve({processedFiles, pdfsToLoad});
                        });
                    }

                    // No resizing needed, just return the converted images
                    setIsLoaderVisible(false);
                    resolve({processedFiles: convertedImages, pdfsToLoad});
                });
                }
            });

            // Check if we need to convert images
            if (otherFiles.some((file) => isHeicOrHeifImage(file))) {
                setIsLoaderVisible(true);

                Promise.all(otherFiles.map((file) => convertHeicImageToJpegPromise(file))).then((convertedImages) => {
                    convertedImages.forEach((convertedFile, index) => {
                        updateFileOrderMapping(otherFiles.at(index), convertedFile);
                    });

                    // Check if we need to resize images
                    if (convertedImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                        Promise.all(convertedImages.map((file) => resizeImageIfNeeded(file))).then((processedFiles) => {
                            processedFiles.forEach((resizedFile, index) => {
                                updateFileOrderMapping(convertedImages.at(index), resizedFile);
                            });
                            setIsLoaderVisible(false);
                            resolve({processedFiles, pdfsToLoad});
                        });
                    }

                    // No resizing needed, just return the converted images
                    setIsLoaderVisible(false);
                    resolve({processedFiles: convertedImages, pdfsToLoad});
                });
            }

            // No conversion needed, but check if we need to resize images
            if (otherFiles.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                setIsLoaderVisible(true);
                Promise.all(otherFiles.map((file) => resizeImageIfNeeded(file))).then((processedFiles) => {
                    processedFiles.forEach((resizedFile, index) => {
                        updateFileOrderMapping(otherFiles.at(index), resizedFile);
                    });
                    setIsLoaderVisible(false);
                    resolve({processedFiles, pdfsToLoad});
                });
            }

            // No conversion or resizing needed, just return the valid images
            resolve({processedFiles: otherFiles, pdfsToLoad});
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
                    return;
                }

                if (result.error === CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED) {
                    filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                    if (items) {
                        dataTransferItemList.current = items.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                    }
                }

                convertAndResizeFiles(result, result.files);
                collectedErrors.current.push({error: result.error});
                setErrorAndOpenModal(result.error);
            });
            return;
        }

        originalFileOrder.current.set(files.uri ?? '', 0);

        validateAttachmentFile(files, items?.at(0)).then((result) => {
            if (result.isValid) {
                onSourceChanged?.(result.validatedFile.source);
                return;
            }

            convertAndResizeFiles([result], [files]);
            collectedErrors.current.push({error: result.error});
            setErrorAndOpenModal(result.error);
        });
    };

    const onConfirm = () => {
        if (fileError === CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED) {
            setIsErrorModalVisible(false);
            convertAndResizeFiles(filesToValidate.current);
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
