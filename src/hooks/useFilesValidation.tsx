import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {validateAttachmentFile, validateMultipleAttachmentFiles} from '@libs/AttachmentValidation';
import type {MultipleAttachmentsValidationError, SingleAttachmentInvalidResult, SingleAttachmentValidationError} from '@libs/AttachmentValidation';
import {getFileValidationErrorText, resizeImageIfNeeded} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

const DEFAULT_IS_VALIDATING_RECEIPTS = true;

type ErrorObject = {
    error: SingleAttachmentValidationError | MultipleAttachmentsValidationError;
    fileExtension?: string;
};

type ValidationOptions = {
    isValidatingReceipts?: boolean;
};

type OnFilesValidated = (files: FileObject[], dataTransferItems: DataTransferItem[]) => void;

type ClassifiedFiles = {
    pdfsToLoad: FileObject[];
    nonPdfFiles: FileObject[];
    filesToConvert: FileObject[];
    filesToResize: FileObject[];
    validFilesToProcess: FileObject[];
};

/** Splits validated files into PDFs vs non-PDFs and groups invalid results by HEIC/HEIF vs FILE_TOO_LARGE. */
const classifyValidatedFiles = (files: FileObject[], invalidResults: SingleAttachmentInvalidResult[]): ClassifiedFiles => {
    type FileMap = Map<string, FileObject>;

    const pdfFilesMap: FileMap = new Map();
    const nonPdfFilesMap: FileMap = new Map();
    for (const file of files) {
        if (file === null) {
            continue;
        }
        const uri = file.uri ?? '';
        if (Str.isPDF(file.name ?? '')) {
            pdfFilesMap.set(uri, file);
        } else {
            nonPdfFilesMap.set(uri, file);
        }
    }

    const filesToConvert: FileObject[] = [];
    const filesToResize: FileObject[] = [];
    const urisToConvert = new Set<string>();
    const urisToResize = new Set<string>();
    for (const result of invalidResults) {
        const uri = result.file.uri ?? '';
        if (result.error === CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.HEIC_OR_HEIF_IMAGE) {
            filesToConvert.push(result.file);
            urisToConvert.add(uri);
        } else if (result.error === CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE) {
            filesToResize.push(result.file);
            urisToResize.add(uri);
        }
    }

    const validFilesToProcess: FileObject[] = [];
    for (const [uri, file] of nonPdfFilesMap) {
        if (!urisToConvert.has(uri) && !urisToResize.has(uri)) {
            validFilesToProcess.push(file);
        }
    }

    return {
        pdfsToLoad: Array.from(pdfFilesMap.values()),
        nonPdfFiles: Array.from(nonPdfFilesMap.values()),
        filesToConvert,
        filesToResize,
        validFilesToProcess,
    };
};

const sortFilesByOriginalOrder = (files: FileObject[], orderMap: Map<string, number>) => {
    return files.sort((a, b) => (orderMap.get(a.uri ?? '') ?? 0) - (orderMap.get(b.uri ?? '') ?? 0));
};

/** Replaces entries in convertedFiles that needed resize with their resized versions (by index in convertedNeedingResize). */
const mergeResizedIntoConverted = (convertedFiles: FileObject[], convertedNeedingResize: FileObject[], resizedConverted: FileObject[]): FileObject[] => {
    return convertedFiles.map((file) => {
        const j = convertedNeedingResize.indexOf(file);
        if (j >= 0) {
            return resizedConverted.at(j) ?? file;
        }
        return file;
    });
};

function useFilesValidation(onFilesValidated: OnFilesValidated) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isValidatingFiles, setIsValidatingFiles] = useState(false);
    const [isValidatingReceipt, setIsValidatingReceipt] = useState<boolean>();
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<SingleAttachmentValidationError | MultipleAttachmentsValidationError | null>(null);
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [validFilesToUpload, setValidFilesToUpload] = useState<FileObject[]>([]);
    const [invalidFileExtension, setInvalidFileExtension] = useState('');
    const [errorQueue, setErrorQueue] = useState<ErrorObject[]>([]);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const invalidFileResults = useRef<SingleAttachmentInvalidResult[]>([]);
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
        setIsValidatingReceipt(undefined);
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

    /** Resizes files with loader; updates order mapping. Returns originals on error. */
    const resizeFilesWithLoader = (files: FileObject[]): Promise<FileObject[]> => {
        if (files.length === 0) {
            return Promise.resolve([]);
        }
        setIsLoaderVisible(true);
        return Promise.all(files.map((file) => resizeImageIfNeeded(file)))
            .then((resizedFiles) => {
                for (const [index, resizedFile] of resizedFiles.entries()) {
                    updateFileOrderMapping(files.at(index), resizedFile);
                }
                setIsLoaderVisible(false);
                return resizedFiles;
            })
            .catch((error) => {
                Log.alert('Error resizing files:', {error});
                setIsLoaderVisible(false);
                return files;
            });
    };

    /** Resizes filesToResize (if any), then returns combined processedFiles and pdfsToLoad. */
    const finishProcessing = (
        convertedFiles: FileObject[],
        validFilesToProcess: FileObject[],
        filesToResize: FileObject[],
        pdfsToLoad: FileObject[],
    ): Promise<{processedFiles: FileObject[]; pdfsToLoad: FileObject[]}> => {
        if (filesToResize.length === 0) {
            const processedFiles = [...convertedFiles, ...validFilesToProcess];
            return Promise.resolve({processedFiles, pdfsToLoad});
        }
        return resizeFilesWithLoader(filesToResize).then((resizedFiles) => {
            const processedFiles = [...convertedFiles, ...validFilesToProcess, ...resizedFiles];
            return {processedFiles, pdfsToLoad};
        });
    };

    /** Applies the result of convert+resize: either show PDFs for validation or complete with errors/onFilesValidated. */
    const applyProcessedResult = ({processedFiles, pdfsToLoad}: {processedFiles: FileObject[]; pdfsToLoad: FileObject[]}) => {
        if (pdfsToLoad.length > 0) {
            validFiles.current = processedFiles;
            setPdfFilesToRender(pdfsToLoad);
            return;
        }

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
    };

    const convertAndResizeFiles = (invalidResults: SingleAttachmentInvalidResult[], files: FileObject[]) => {
        const {pdfsToLoad, nonPdfFiles, filesToConvert, filesToResize, validFilesToProcess} = classifyValidatedFiles(files, invalidResults);

        const runConversionThenFinish = (): Promise<{processedFiles: FileObject[]; pdfsToLoad: FileObject[]}> => {
            setIsLoaderVisible(true);
            return Promise.all(filesToConvert.map((file) => convertHeicImageToJpegPromise(file)))
                .then((convertedFiles) => {
                    for (const [index, convertedFile] of convertedFiles.entries()) {
                        updateFileOrderMapping(filesToConvert.at(index), convertedFile);
                    }
                    const convertedNeedingResize = convertedFiles.filter((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);
                    if (convertedNeedingResize.length > 0) {
                        return resizeFilesWithLoader(convertedNeedingResize).then((resizedConverted) => {
                            const mergedConverted = mergeResizedIntoConverted(convertedFiles, convertedNeedingResize, resizedConverted);
                            return finishProcessing(mergedConverted, validFilesToProcess, filesToResize, pdfsToLoad);
                        });
                    }
                    return finishProcessing(convertedFiles, validFilesToProcess, filesToResize, pdfsToLoad);
                })
                .catch((error) => {
                    Log.alert('Error converting HEIC/HEIF files:', {error});
                    return {processedFiles: validFilesToProcess, pdfsToLoad};
                })
                .finally(() => {
                    setIsLoaderVisible(false);
                });
        };

        const runNoConversionPath = (): Promise<{processedFiles: FileObject[]; pdfsToLoad: FileObject[]}> => {
            const anyNonPdfTooLarge = nonPdfFiles.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);
            if (anyNonPdfTooLarge) {
                return resizeFilesWithLoader(nonPdfFiles).then((processedFiles) => ({processedFiles, pdfsToLoad}));
            }
            return finishProcessing([], validFilesToProcess, filesToResize, pdfsToLoad);
        };

        const promise = filesToConvert.length > 0 ? runConversionThenFinish() : runNoConversionPath();

        promise.then(applyProcessedResult);
    };

    /** Handles result of multiple-file validation: either completes with valid files or starts convert/resize for invalid. */
    const handleMultipleFilesResult = (result: Awaited<ReturnType<typeof validateMultipleAttachmentFiles>>, files: FileObject[], items?: DataTransferItem[]) => {
        if (result.isValid) {
            const fileObjects = result.validatedFiles.map((f) => f.file);
            onFilesValidated(fileObjects, dataTransferItemList.current);
            return;
        }

        if (result.error === CONST.FILE_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED) {
            filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            if (items) {
                dataTransferItemList.current = items.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            }
        }

        const invalidResults = result.fileResults.filter((r) => r.isValid === false);
        invalidFileResults.current = invalidResults;

        if (result.error) {
            collectedErrors.current.push({error: result.error});
            setErrorAndOpenModal(result.error);
        }

        convertAndResizeFiles(invalidResults, files);
    };

    /** Handles result of single-file validation: either completes with valid file or starts convert/resize for invalid. */
    const handleSingleFileResult = (result: Awaited<ReturnType<typeof validateAttachmentFile>>, file: FileObject) => {
        if (result.isValid) {
            onFilesValidated([result.validatedFile.file], dataTransferItemList.current);
            return;
        }

        invalidFileResults.current = [result];

        if (result.error) {
            collectedErrors.current.push({error: result.error});
            setErrorAndOpenModal(result.error);
        }

        convertAndResizeFiles(invalidFileResults.current, [file]);
    };

    const validateFiles = (files: File | FileObject[], items?: DataTransferItem[], validationOptions?: ValidationOptions) => {
        if (isValidatingFiles) {
            Log.warn('Files are already being validated. Please wait for the current validation to complete before calling `validateFiles` again.');
            return;
        }

        if (!files) {
            return;
        }

        setIsValidatingFiles(true);

        const isReceiptValidation = validationOptions?.isValidatingReceipts ?? DEFAULT_IS_VALIDATING_RECEIPTS;
        setIsValidatingReceipt(isReceiptValidation);
        collectedErrors.current = [];

        if (Array.isArray(files)) {
            setIsValidatingMultipleFiles(true);
            for (const [index, file] of files.entries()) {
                originalFileOrder.current.set(file.uri ?? '', index);
            }
            validateMultipleAttachmentFiles(files, items, isReceiptValidation).then((result) => handleMultipleFilesResult(result, files, items));
            return;
        }

        originalFileOrder.current.set(files.uri ?? '', 0);
        validateAttachmentFile(files, items?.at(0), isReceiptValidation).then((result) => handleSingleFileResult(result, files));
    };

    const onConfirmError = () => {
        if (fileError === CONST.FILE_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED) {
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
        if (isValidatingReceipt === false && fileError) {
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
                      if (isValidatingReceipt) {
                          collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.PROTECTED_FILE});
                      } else {
                          validFiles.current.push(file);
                      }
                      checkIfAllValidatedAndProceed();
                  }}
                  onLoadError={() => {
                      validatedPDFs.current.push(file);
                      collectedErrors.current.push({error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_CORRUPTED});
                      checkIfAllValidatedAndProceed();
                  }}
              />
          ))
        : undefined;

    const fileValidationErrorText = getFileValidationErrorText(translate, fileError, {fileType: invalidFileExtension}, {isValidatingReceipt, isValidatingMultipleFiles});

    const getModalPrompt = () => {
        if (!fileError) {
            return '';
        }
        const prompt = fileValidationErrorText.reason;
        if (fileError === CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE) {
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
