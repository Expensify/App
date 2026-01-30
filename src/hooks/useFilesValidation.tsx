import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {
    getFileValidationErrorText,
    hasHeicOrHeifExtension,
    normalizeFileObject,
    resizeImageIfNeeded,
    splitExtensionFromFileName,
    validateAttachment,
    validateImageForCorruption,
} from '@libs/fileDownload/FileUtils';
import type {ValidateAttachmentOptions} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

const DEFAULT_IS_VALIDATING_RECEIPTS = true;

type ErrorObject = {
    error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>;
    fileExtension?: string;
};

type ValidationOptions = {
    isValidatingReceipts?: boolean;
};

const sortFilesByOriginalOrder = (files: FileObject[], orderMap: Map<string, number>) => {
    return files.sort((a, b) => (orderMap.get(a.uri ?? '') ?? 0) - (orderMap.get(b.uri ?? '') ?? 0));
};

function useFilesValidation(onFilesValidated: (files: FileObject[], dataTransferItems: DataTransferItem[]) => void) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isValidatingFiles, setIsValidatingFiles] = useState(false);
    const [isValidatingReceipts, setIsValidatingReceipts] = useState<boolean>();
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [validFilesToUpload, setValidFilesToUpload] = useState([] as FileObject[]);
    const [invalidFileExtension, setInvalidFileExtension] = useState('');
    const [errorQueue, setErrorQueue] = useState<ErrorObject[]>([]);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const dataTransferItemList = useRef<DataTransferItem[]>([]);
    const collectedErrors = useRef<ErrorObject[]>([]);
    const originalFileOrder = useRef<Map<string, number>>(new Map());

    const updateFileOrderMapping = (oldFile: FileObject | undefined, newFile: FileObject) => {
        const originalIndex = originalFileOrder.current.get(oldFile?.uri ?? '');
        if (originalIndex !== undefined) {
            originalFileOrder.current.set(newFile.uri ?? '', originalIndex);
        }
    };

    const deduplicateErrors = (errors: ErrorObject[]) => {
        const uniqueErrors = new Set<string>();
        return errors.filter((error) => {
            const key = `${error.error}-${error.fileExtension ?? ''}`;
            if (uniqueErrors.has(key)) {
                return false;
            }
            uniqueErrors.add(key);
            return true;
        });
    };

    const resetValidationState = () => {
        setIsValidatingFiles(false);
        setIsValidatingReceipts(undefined);
        setIsValidatingMultipleFiles(false);
        setIsErrorModalVisible(false);
        setPdfFilesToRender([]);
        setIsLoaderVisible(false);
        setValidFilesToUpload([]);
        setFileError(null);
        setInvalidFileExtension('');
        setErrorQueue([]);
        setCurrentErrorIndex(0);
        validatedPDFs.current = [];
        validFiles.current = [];
        filesToValidate.current = [];
        dataTransferItemList.current = [];
        collectedErrors.current = [];
        originalFileOrder.current.clear();
    };

    const hideModalAndReset = () => {
        setIsErrorModalVisible(false);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            resetValidationState();
        });
    };

    const setErrorAndOpenModal = (error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>) => {
        setFileError(error);
        setIsErrorModalVisible(true);
    };

    const isValidFile = (originalFile: FileObject, item: DataTransferItem | undefined, validationOptions: ValidateAttachmentOptions) => {
        if (item && item.kind === 'file' && 'webkitGetAsEntry' in item) {
            const entry = item.webkitGetAsEntry();

            if (entry?.isDirectory) {
                collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED});
                return Promise.resolve(false);
            }
        }

        return normalizeFileObject(originalFile)
            .then((normalizedFile) =>
                validateImageForCorruption(normalizedFile).then(() => {
                    const error = validateAttachment(normalizedFile, validationOptions);
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
                setFileError(firstError.error);
                if (firstError.fileExtension) {
                    setInvalidFileExtension(firstError.fileExtension);
                }
                setIsErrorModalVisible(true);
            }
        } else if (validFiles.current.length > 0) {
            const sortedFiles = sortFilesByOriginalOrder(validFiles.current, originalFileOrder.current);
            onFilesValidated(sortedFiles, dataTransferItemList.current);
            resetValidationState();
        }
    };

    const validateAndResizeFiles = (files: FileObject[], items: DataTransferItem[], validationOptions?: ValidationOptions) => {
        // Early return for empty files
        if (files.length === 0) {
            return;
        }

        // Reset collected errors for new validation
        collectedErrors.current = [];

        for (const [index, file] of files.entries()) {
            originalFileOrder.current.set(file.uri ?? '', index);
        }

        Promise.all(
            files.map((file, index) =>
                isValidFile(file, items.at(index), {isValidatingMultipleFiles: files.length > 1, isValidatingReceipts: validationOptions?.isValidatingReceipts ?? isValidatingReceipts}).then(
                    (isValid) => (isValid ? file : null),
                ),
            ),
        )
            .then((validationResults) => {
                const filteredResults = validationResults.filter((result): result is FileObject => result !== null);
                const pdfsToLoad = filteredResults.filter((file) => Str.isPDF(file.name ?? ''));
                const otherFiles = filteredResults.filter((file) => !Str.isPDF(file.name ?? ''));

                // Check if we need to convert images
                if (otherFiles.some((file) => hasHeicOrHeifExtension(file))) {
                    setIsLoaderVisible(true);

                    return Promise.all(otherFiles.map((file) => convertHeicImageToJpegPromise(file))).then((convertedImages) => {
                        for (const [index, convertedFile] of convertedImages.entries()) {
                            updateFileOrderMapping(otherFiles.at(index), convertedFile);
                        }

                        // Check if we need to resize images
                        if (convertedImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                            return Promise.all(convertedImages.map((file) => resizeImageIfNeeded(file))).then((processedFiles) => {
                                for (const [index, resizedFile] of processedFiles.entries()) {
                                    updateFileOrderMapping(convertedImages.at(index), resizedFile);
                                }
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
                        for (const [index, resizedFile] of processedFiles.entries()) {
                            updateFileOrderMapping(otherFiles.at(index), resizedFile);
                        }
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
                        const sortedFiles = sortFilesByOriginalOrder(processedFiles, originalFileOrder.current);
                        onFilesValidated(sortedFiles, dataTransferItemList.current);
                        resetValidationState();
                    }
                }
            });
    };

    const validateFiles = (files: FileObject[], items?: DataTransferItem[], validationOptions?: ValidationOptions) => {
        if (isValidatingFiles) {
            Log.warn('Files are already being validated. Please wait for the current validation to complete before calling `validateFiles` again.');
            return;
        }

        setIsValidatingFiles(true);

        const validationOptionsWithDefaults = {
            ...validationOptions,
            isValidatingReceipts: validationOptions?.isValidatingReceipts ?? DEFAULT_IS_VALIDATING_RECEIPTS,
        };
        setIsValidatingReceipts(validationOptionsWithDefaults.isValidatingReceipts);

        if (files.length > 1) {
            setIsValidatingMultipleFiles(true);
        }
        if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
            filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            if (items) {
                dataTransferItemList.current = items.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            }
            setErrorAndOpenModal(CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED);
        } else {
            validateAndResizeFiles(files, items ?? [], validationOptionsWithDefaults);
        }
    };

    const onConfirmError = () => {
        if (fileError === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            setIsErrorModalVisible(false);
            validateAndResizeFiles(filesToValidate.current, dataTransferItemList.current);
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
        if (isValidatingReceipts === false && fileError) {
            setIsErrorModalVisible(false);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                if (sortedFiles.length !== 0) {
                    onFilesValidated(sortedFiles, dataTransferItemList.current);
                }
                resetValidationState();
            });
        } else {
            if (sortedFiles.length !== 0) {
                onFilesValidated(sortedFiles, dataTransferItemList.current);
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
                      if (isValidatingReceipts === true) {
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

    const getModalPrompt = () => {
        if (!fileError) {
            return '';
        }
        const prompt = getFileValidationErrorText(translate, fileError, {fileType: invalidFileExtension}, isValidatingReceipts === true).reason;
        if (fileError === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE || fileError === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE) {
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
            title={getFileValidationErrorText(translate, fileError, {fileType: invalidFileExtension}, isValidatingReceipts === true).title}
            onConfirm={onConfirmError}
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
