import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {getFileValidationErrorText, hasHeicOrHeifExtension, resizeImageIfNeeded, splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import type {FileValidationError} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import Log from '@libs/Log';
import validateAttachmentFile from '@libs/validateAttachmentFile';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

const DEFAULT_IS_VALIDATING_RECEIPTS = true;
const MIN_LOADER_VISIBLE_DURATION_MS = 200;

type ValidationOptions = {
    isValidatingReceipts?: boolean;
};

type ValidationState = {
    isValidatingReceipts: boolean;
    isValidatingMultipleFiles: boolean;
};

const sortFilesByOriginalOrder = (files: FileObject[], orderMap: Map<string, number>) => {
    return files.sort((a, b) => (orderMap.get(a.uri ?? '') ?? 0) - (orderMap.get(b.uri ?? '') ?? 0));
};

const isImageFile = (file: FileObject) => !!hasHeicOrHeifExtension(file) || Str.isImage(file.name ?? '');

function useFilesValidation(onFilesValidated: (files: FileObject[], dataTransferItems: DataTransferItem[]) => void) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [isValidatingFiles, setIsValidatingFiles] = useState(false);

    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const dataTransferItemList = useRef<DataTransferItem[]>([]);
    const collectedErrors = useRef<FileValidationError[]>([]);
    const originalFileOrder = useRef<Map<string, number>>(new Map());
    const pendingAfterHide = useRef<() => void>(() => {});
    const loaderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const validFilesToUploadRef = useRef<FileObject[]>([]);
    const currentValidationState = useRef<ValidationState>({isValidatingReceipts: false, isValidatingMultipleFiles: false});

    const updateFileOrderMapping = (oldFile: FileObject | undefined, newFile: FileObject) => {
        const originalIndex = originalFileOrder.current.get(oldFile?.uri ?? '');
        if (originalIndex !== undefined) {
            originalFileOrder.current.set(newFile.uri ?? '', originalIndex);
        }
    };

    const deduplicateErrors = (errors: FileValidationError[]) => {
        const uniqueErrors = new Set<string>();
        return errors.filter((error) => {
            const key = `${error.error}-${error.fileType ?? ''}`;
            if (uniqueErrors.has(key)) {
                return false;
            }
            uniqueErrors.add(key);
            return true;
        });
    };

    useEffect(() => {
        return () => {
            if (!loaderTimeoutRef.current) {
                return;
            }
            clearTimeout(loaderTimeoutRef.current);
            loaderTimeoutRef.current = undefined;
        };
    }, []);

    const reset = () => {
        setIsValidatingFiles(false);
        setPdfFilesToRender([]);
        setIsLoaderVisible(false);
        validatedPDFs.current = [];
        validFiles.current = [];
        filesToValidate.current = [];
        dataTransferItemList.current = [];
        collectedErrors.current = [];
        originalFileOrder.current.clear();
        validFilesToUploadRef.current = [];
        currentValidationState.current = {isValidatingReceipts: false, isValidatingMultipleFiles: false};
    };

    const runPendingAfterHide = () => {
        const action = pendingAfterHide.current;
        pendingAfterHide.current = () => {};
        action();
    };

    const getModalPrompt = (error: FileValidationError | null) => {
        if (!error) {
            return '';
        }
        const fileValidationErrorText = getFileValidationErrorText(translate, error, {isValidatingReceipt: currentValidationState.current.isValidatingReceipts});
        const prompt = fileValidationErrorText.reason;
        if (error.error === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE) {
            return (
                <Text>
                    {prompt}
                    <TextLink href={CONST.BULK_UPLOAD_HELP_URL}> {translate('attachmentPicker.learnMoreAboutSupportedFiles')}</TextLink>
                </Text>
            );
        }
        return prompt;
    };

    const showErrorModal = async (error: FileValidationError, currentIndex: number, allErrors: FileValidationError[]) => {
        const fileValidationErrorText = getFileValidationErrorText(translate, error, {isValidatingReceipt: currentValidationState.current.isValidatingReceipts});

        const result = await showConfirmModal({
            title: fileValidationErrorText.title,
            prompt: getModalPrompt(error),
            confirmText: translate(currentValidationState.current.isValidatingMultipleFiles ? 'common.continue' : 'common.close'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: currentValidationState.current.isValidatingMultipleFiles,
        });

        if (result.action === ModalActions.CONFIRM) {
            // Handle MAX_FILE_LIMIT_EXCEEDED separately
            if (error.error === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
                validateAndResizeFiles(filesToValidate.current, dataTransferItemList.current, currentValidationState.current);
                return;
            }

            // Show next error if available
            if (currentIndex < allErrors.length - 1) {
                const nextIndex = currentIndex + 1;
                const nextError = allErrors.at(nextIndex);
                if (nextError) {
                    if (currentValidationState.current.isValidatingMultipleFiles && currentIndex === allErrors.length - 2 && validFilesToUploadRef.current.length === 0) {
                        currentValidationState.current.isValidatingMultipleFiles = false;
                    }
                    showErrorModal(nextError, nextIndex, allErrors);
                    return;
                }
            }

            // No more errors, proceed with valid files
            const sortedFiles = sortFilesByOriginalOrder(validFilesToUploadRef.current, originalFileOrder.current);
            // If we're validating attachments we need to wait for the error modal close
            // transition to finish before opening the attachment modal
            if (currentValidationState.current.isValidatingReceipts === false && error) {
                pendingAfterHide.current = () => {
                    if (sortedFiles.length !== 0) {
                        onFilesValidated(sortedFiles, dataTransferItemList.current);
                    }
                    reset();
                };
                runPendingAfterHide();
            } else {
                if (sortedFiles.length !== 0) {
                    onFilesValidated(sortedFiles, dataTransferItemList.current);
                }
                reset();
            }
        } else {
            // User cancelled
            pendingAfterHide.current = reset;
            runPendingAfterHide();
        }
    };

    const checkIfAllValidatedAndProceed = () => {
        if (!validatedPDFs.current || !validFiles.current) {
            return;
        }

        if (validatedPDFs.current.length !== pdfFilesToRender.length) {
            return;
        }

        if (validFiles.current.length > 0) {
            validFilesToUploadRef.current = validFiles.current;
        }

        if (collectedErrors.current.length > 0) {
            const uniqueErrors = deduplicateErrors(collectedErrors.current);
            const firstError = uniqueErrors.at(0);
            if (firstError) {
                showErrorModal(firstError, 0, uniqueErrors);
            }
        } else if (validFiles.current.length > 0) {
            const sortedFiles = sortFilesByOriginalOrder(validFiles.current, originalFileOrder.current);
            onFilesValidated(sortedFiles, dataTransferItemList.current);
            reset();
        }
    };

    async function validateAndResizeFiles(files: FileObject[], items: DataTransferItem[], validationState: ValidationState) {
        if (files.length === 0) {
            return;
        }

        let loaderStartTime: number | undefined;
        const showLoader = () => {
            if (loaderStartTime === undefined) {
                loaderStartTime = Date.now();
            }
            setIsLoaderVisible(true);
        };

        // Reset collected errors for new validation
        collectedErrors.current = [];

        for (const [index, file] of files.entries()) {
            originalFileOrder.current.set(file.uri ?? '', index);
        }

        const pdfsToLoad: FileObject[] = [];
        const validNonPdfFiles: FileObject[] = [];

        const filesToResize: FileObject[] = [];
        const filesToConvert: FileObject[] = [];
        await Promise.all(
            files.map(async (file, index) => {
                const result = await validateAttachmentFile(file, items.at(index), validationState.isValidatingReceipts);

                if (result.isValid) {
                    if (Str.isPDF(result.file.name ?? '')) {
                        pdfsToLoad.push(result.file);
                    } else {
                        validNonPdfFiles.push(result.file);
                    }
                    return;
                }

                if (result.error === CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE && isImageFile(file)) {
                    filesToResize.push(file);
                    return;
                }

                if (result.error === CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE) {
                    filesToConvert.push(file);
                    return;
                }

                const errorData = {
                    error: result.error,
                    isValidatingMultipleFiles: validationState.isValidatingMultipleFiles,
                    fileType: result.error === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE ? splitExtensionFromFileName(file.name ?? '').fileExtension : undefined,
                } satisfies FileValidationError;
                collectedErrors.current.push(errorData);
            }),
        );

        if (filesToConvert.length > 0) {
            showLoader();

            const convertedFilesToResize: FileObject[] = [];
            const convertedFiles: FileObject[] = [];
            await Promise.all(
                filesToConvert.map(
                    (file) =>
                        new Promise<void>((resolve) => {
                            convertHeicImage(file, {
                                onSuccess: (convertedFile) => {
                                    if (validationState.isValidatingReceipts && convertedFile.size && convertedFile.size > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE) {
                                        convertedFilesToResize.push(convertedFile);
                                        resolve();
                                        return;
                                    }

                                    if (!validationState.isValidatingReceipts && convertedFile.size && convertedFile.size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                                        collectedErrors.current.push({
                                            error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE,
                                            isValidatingMultipleFiles: validationState.isValidatingMultipleFiles,
                                        });
                                        resolve();
                                        return;
                                    }

                                    convertedFiles.push(convertedFile);
                                    resolve();
                                },
                                onError: () => {
                                    Log.warn('HEIC conversion failed, falling back to original file', {fileName: file.name});
                                    convertedFiles.push(file);
                                    resolve();
                                },
                            });
                        }),
                ),
            );

            filesToResize.push(...convertedFilesToResize);
            validNonPdfFiles.push(...convertedFiles);

            for (const [index, convertedFile] of convertedFiles.entries()) {
                updateFileOrderMapping(filesToConvert.at(index), convertedFile);
            }
        }

        if (filesToResize.length > 0) {
            showLoader();

            const toResizeResults = await Promise.allSettled(filesToResize.map((file) => resizeImageIfNeeded(file)));

            for (const [index, result] of toResizeResults.entries()) {
                if (result.status === 'fulfilled') {
                    const value = result.value;
                    validNonPdfFiles.push(value);
                    updateFileOrderMapping(filesToResize.at(index), value);
                } else {
                    const errorMessage = result.reason instanceof Error ? result.reason.message : undefined;
                    if (errorMessage === CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE) {
                        collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE, isValidatingMultipleFiles: validationState.isValidatingMultipleFiles});
                    } else {
                        collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED, isValidatingMultipleFiles: validationState.isValidatingMultipleFiles});
                    }
                }
            }
        }

        const handleNext = () => {
            if (pdfsToLoad.length) {
                validFiles.current = validNonPdfFiles;
                setPdfFilesToRender(pdfsToLoad);
                return;
            }

            if (validNonPdfFiles.length > 0) {
                validFilesToUploadRef.current = validNonPdfFiles;
            }

            if (collectedErrors.current.length > 0) {
                const uniqueErrors = deduplicateErrors(collectedErrors.current);
                const firstError = uniqueErrors.at(0);
                if (firstError) {
                    showErrorModal(firstError, 0, uniqueErrors);
                }
            } else if (validNonPdfFiles.length > 0) {
                const sortedFiles = sortFilesByOriginalOrder(validNonPdfFiles, originalFileOrder.current);
                onFilesValidated(sortedFiles, dataTransferItemList.current);
                reset();
            }
        };

        const hideLoaderAndHandleNext = () => {
            setIsLoaderVisible(false);
            handleNext();
        };

        const extendLoaderIfNeeded = () => {
            if (loaderStartTime === undefined) {
                hideLoaderAndHandleNext();
                return;
            }

            const elapsedTime = Date.now() - loaderStartTime;
            const shouldDelayHide = collectedErrors.current.length > 0 && elapsedTime < MIN_LOADER_VISIBLE_DURATION_MS;

            if (!shouldDelayHide) {
                hideLoaderAndHandleNext();
                return;
            }

            loaderTimeoutRef.current = setTimeout(() => {
                hideLoaderAndHandleNext();
            }, MIN_LOADER_VISIBLE_DURATION_MS - elapsedTime);
        };

        extendLoaderIfNeeded();
    }

    const validateFiles = (files: FileObject[], items?: DataTransferItem[], validationOptions?: ValidationOptions) => {
        if (isValidatingFiles) {
            Log.warn('Files are already being validated. Please wait for the current validation to complete before calling `validateFiles` again.');
            return;
        }

        setIsValidatingFiles(true);

        const validationState: ValidationState = {
            isValidatingReceipts: validationOptions?.isValidatingReceipts ?? DEFAULT_IS_VALIDATING_RECEIPTS,
            isValidatingMultipleFiles: files.length > 1,
        };
        currentValidationState.current = validationState;

        if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
            filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            if (items) {
                dataTransferItemList.current = items.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            }
            const error = {error: CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED, isValidatingMultipleFiles: validationState.isValidatingMultipleFiles};
            showErrorModal(error, 0, [error]);
        } else {
            validateAndResizeFiles(files, items ?? [], validationState);
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
                      if (currentValidationState.current.isValidatingReceipts === true) {
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

    return {
        PDFValidationComponent,
        validateFiles,
    };
}

export default useFilesValidation;
