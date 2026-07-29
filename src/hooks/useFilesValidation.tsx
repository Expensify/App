import ConfirmModal from '@components/ConfirmModal';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
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

import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';

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

    const [isValidatingFiles, setIsValidatingFiles] = useState(false);
    const [isValidatingReceipts, setIsValidatingReceipts] = useState<boolean>();
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<FileValidationError | null>(null);
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    // Index of the PDF currently being validated — thumbnails are rendered one at a time (see
    // PDFValidationComponent below), and this advances to the next PDF when the current one settles.
    const [validatedPDFCount, setValidatedPDFCount] = useState(0);
    const [validFilesToUpload, setValidFilesToUpload] = useState([] as FileObject[]);
    const [errorQueue, setErrorQueue] = useState<FileValidationError[]>([]);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const dataTransferItemList = useRef<DataTransferItem[]>([]);
    const collectedErrors = useRef<FileValidationError[]>([]);
    const originalFileOrder = useRef<Map<string, number>>(new Map());
    const pendingAfterHide = useRef<() => void>(() => {});
    const loaderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
        setIsValidatingReceipts(undefined);
        setIsErrorModalVisible(false);
        setPdfFilesToRender([]);
        setValidatedPDFCount(0);
        setIsLoaderVisible(false);
        setValidFilesToUpload([]);
        setFileError(null);
        setErrorQueue([]);
        setCurrentErrorIndex(0);
        validatedPDFs.current = [];
        validFiles.current = [];
        filesToValidate.current = [];
        dataTransferItemList.current = [];
        collectedErrors.current = [];
        originalFileOrder.current.clear();
    };

    const runPendingAfterHide = () => {
        const action = pendingAfterHide.current;
        pendingAfterHide.current = () => {};
        action();
    };

    const hideModalAndReset = () => {
        pendingAfterHide.current = reset;
        setIsErrorModalVisible(false);
    };

    const checkIfAllValidatedAndProceed = () => {
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
                setFileError(firstError);
                setIsErrorModalVisible(true);
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
        // Validate sequentially so only one image is decoded and held in memory at a time. Validating the
        // whole batch with Promise.all multiplies peak memory by the number of selected files (each pass
        // decodes the full-resolution image), which can kill the WebContent process on memory-constrained
        // mobile Safari when 3+ photos are selected — the tab reloads and the attachments are lost.
        for (const [index, file] of files.entries()) {
            // eslint-disable-next-line no-await-in-loop
            const result = await validateAttachmentFile(file, items.at(index), validationState.isValidatingReceipts);

            if (result.isValid) {
                if (Str.isPDF(result.file.name ?? '')) {
                    pdfsToLoad.push(result.file);
                } else {
                    validNonPdfFiles.push(result.file);
                }
                continue;
            }

            if (result.error === CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE && isImageFile(file)) {
                filesToResize.push(file);
                continue;
            }

            if (result.error === CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE) {
                filesToConvert.push(file);
                continue;
            }

            const errorData = {
                error: result.error,
                isValidatingMultipleFiles: validationState.isValidatingMultipleFiles,
                fileType: result.error === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE ? splitExtensionFromFileName(file.name ?? '').fileExtension : undefined,
            } satisfies FileValidationError;
            collectedErrors.current.push(errorData);
        }

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
                setValidatedPDFCount(0);
                setPdfFilesToRender(pdfsToLoad);
                return;
            }

            if (validNonPdfFiles.length > 0) {
                setValidFilesToUpload(validNonPdfFiles);
            }

            if (collectedErrors.current.length > 0) {
                const uniqueErrors = deduplicateErrors(collectedErrors.current);
                setErrorQueue(uniqueErrors);
                setCurrentErrorIndex(0);
                const firstError = uniqueErrors.at(0);
                if (firstError) {
                    setFileError(firstError);
                    setIsErrorModalVisible(true);
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
        setIsValidatingReceipts(validationState.isValidatingReceipts);
        setIsValidatingMultipleFiles(validationState.isValidatingMultipleFiles);

        if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
            filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            if (items) {
                dataTransferItemList.current = items.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            }
            setFileError({error: CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED, isValidatingMultipleFiles: validationState.isValidatingMultipleFiles});
            setIsErrorModalVisible(true);
        } else {
            validateAndResizeFiles(files, items ?? [], validationState);
        }
    };

    const onConfirmError = () => {
        if (fileError?.error === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            setIsErrorModalVisible(false);
            const validationState: ValidationState = {
                isValidatingReceipts: isValidatingReceipts ?? false,
                isValidatingMultipleFiles,
            };
            validateAndResizeFiles(filesToValidate.current, dataTransferItemList.current, validationState);
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
                setFileError(nextError);
                return;
            }
        }

        const sortedFiles = sortFilesByOriginalOrder(validFilesToUpload, originalFileOrder.current);
        // If we're validating attachments we need to wait for the error modal close
        // transition to finish before opening the attachment modal
        if (isValidatingReceipts === false && fileError) {
            pendingAfterHide.current = () => {
                if (sortedFiles.length !== 0) {
                    onFilesValidated(sortedFiles, dataTransferItemList.current);
                }
                reset();
            };
            setIsErrorModalVisible(false);
        } else {
            if (sortedFiles.length !== 0) {
                onFilesValidated(sortedFiles, dataTransferItemList.current);
            }
            hideModalAndReset();
        }
    };

    // Validate the PDFs one at a time: every mounted PDFThumbnail is a full PDF.js document parse (its own
    // worker + parsed document), so rendering the whole batch at once multiplies peak memory by the number of
    // selected PDFs — the same batch-decode problem the sequential image validation above avoids — which can
    // kill the WebContent process on memory-constrained mobile Safari and reload the tab. Each thumbnail
    // advances validatedPDFCount when it settles (success/password/error), mounting the next one.
    const pdfFileToValidate = pdfFilesToRender.at(validatedPDFCount);
    const PDFValidationComponent = pdfFileToValidate ? (
        <PDFThumbnail
            key={pdfFileToValidate.uri}
            style={styles.invisiblePDF}
            previewSourceURL={pdfFileToValidate.uri ?? ''}
            onLoadSuccess={() => {
                validatedPDFs.current.push(pdfFileToValidate);
                validFiles.current.push(pdfFileToValidate);
                setValidatedPDFCount((count) => count + 1);
                checkIfAllValidatedAndProceed();
            }}
            onPassword={() => {
                validatedPDFs.current.push(pdfFileToValidate);
                if (isValidatingReceipts === true) {
                    collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.PROTECTED_FILE});
                } else {
                    validFiles.current.push(pdfFileToValidate);
                }
                setValidatedPDFCount((count) => count + 1);
                checkIfAllValidatedAndProceed();
            }}
            onLoadError={() => {
                validatedPDFs.current.push(pdfFileToValidate);
                collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED});
                setValidatedPDFCount((count) => count + 1);
                checkIfAllValidatedAndProceed();
            }}
        />
    ) : undefined;

    const fileValidationErrorText = getFileValidationErrorText(translate, fileError, {isValidatingReceipt: isValidatingReceipts});

    const getModalPrompt = () => {
        if (!fileError) {
            return '';
        }
        const prompt = fileValidationErrorText.reason;
        if (fileError.error === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE) {
            return (
                <Text>
                    {prompt}
                    <TextLink href={CONST.BULK_UPLOAD_HELP_URL}> {translate('attachmentPicker.learnMoreAboutSupportedFiles')}</TextLink>
                </Text>
            );
        }
        return prompt;
    };

    const ErrorModal = (
        <ConfirmModal
            title={fileValidationErrorText.title}
            onConfirm={onConfirmError}
            onCancel={hideModalAndReset}
            onModalHide={runPendingAfterHide}
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
