import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import PDFThumbnail from '@components/PDFThumbnail';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {validateMultipleAttachmentFiles} from '@libs/AttachmentValidation';
import type {FileValidationError, SingleAttachmentInvalidResult} from '@libs/AttachmentValidation';
import {getFileValidationErrorText, resizeImageIfNeeded} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

const DEFAULT_IS_VALIDATING_RECEIPTS = true;

type ErrorObject = {
    error: FileValidationError;
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

type ValidatedFiles = {
    processedFiles: FileObject[];
    pdfsToLoad: FileObject[];
};

/** Splits validated files into PDFs vs non-PDFs and groups invalid results by HEIC/HEIF vs FILE_TOO_LARGE. */
function classifyValidatedFiles(files: FileObject[], invalidResults: SingleAttachmentInvalidResult[]): ClassifiedFiles {
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
        if (result.error === CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE) {
            filesToConvert.push(result.file);
            urisToConvert.add(uri);
        } else if (result.error === CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE) {
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
}

function sortFilesByOriginalOrder(files: FileObject[], orderMap: Map<string, number>) {
    return files.sort((a, b) => (orderMap.get(a.uri ?? '') ?? 0) - (orderMap.get(b.uri ?? '') ?? 0));
}

/** Extracts the ordered file list from validation result. Downstream logic does not need the original files param. */
function getFilesFromValidationResult(result: Awaited<ReturnType<typeof validateMultipleAttachmentFiles>>): FileObject[] {
    if (result.isValid) {
        return result.validatedFiles.map((f) => f.file);
    }
    // fileResults preserves original order; each result has .file or .validatedFile.file
    if (result.fileResults?.length) {
        return result.fileResults.map((r) => (r.isValid ? r.validatedFile.file : r.file));
    }
    return result.files ?? [];
}

function deduplicateErrors(errors: ErrorObject[]) {
    const uniqueErrors = new Set<string>();
    return errors.filter((error) => {
        const key = `${error.error}-${error.fileExtension ?? ''}`;
        if (uniqueErrors.has(key)) {
            return false;
        }
        uniqueErrors.add(key);
        return true;
    });
}

function useFilesValidation(onFilesValidated: OnFilesValidated) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isValidatingFiles, setIsValidatingFiles] = useState(false);
    const [isValidatingReceipt, setIsValidatingReceipt] = useState<boolean>();
    const [isValidatingMultipleFiles, setIsValidatingMultipleFiles] = useState(false);

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [fileError, setFileError] = useState<FileValidationError | null>(null);
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [validFilesToUpload, setValidFilesToUpload] = useState<FileObject[]>([]);
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

    function updateFileOrderMapping(oldFile: FileObject | undefined, newFile: FileObject) {
        const originalIndex = originalFileOrder.current.get(oldFile?.uri ?? '');
        if (originalIndex !== undefined) {
            originalFileOrder.current.set(newFile.uri ?? '', originalIndex);
        }
    }

    function reset() {
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
    }

    const hideModalAndReset = () => {
        setIsErrorModalVisible(false);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            reset();
        });
    };

    function setErrorAndOpenModal(error: FileValidationError) {
        setFileError(error);
        setIsErrorModalVisible(true);
    }

    function convertHeicImageToJpegPromise(file: FileObject): Promise<FileObject> {
        return new Promise((resolve, reject) => {
            convertHeicImage(file, {
                onSuccess: (convertedFile) => resolve(convertedFile),
                onError: (nonConvertedFile) => {
                    reject(nonConvertedFile);
                },
            });
        });
    }

    function checkIfAllValidatedAndProceed() {
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
            reset();
        }
    }

    /** Resizes files with loader; updates order mapping. Returns originals on error. */
    async function resizeFilesWithLoader(files: FileObject[]): Promise<FileObject[]> {
        if (files.length === 0) {
            return [];
        }
        setIsLoaderVisible(true);
        let resizedFiles: FileObject[] = [];

        try {
            resizedFiles = await Promise.all(files.map((file) => resizeImageIfNeeded(file)));
        } catch (error) {
            Log.alert('Error resizing files:', {error});
            setIsLoaderVisible(false);
            return files;
        }

        for (const [index, resizedFile] of resizedFiles.entries()) {
            const originalFile = files.at(index);

            updateFileOrderMapping(originalFile, resizedFile);
        }

        setIsLoaderVisible(false);
        return resizedFiles;
    }

    /** Merges converted, resized, and valid files into one list; resizes filesToResize if any. */
    async function mergeConvertedResizedAndValid(
        convertedFiles: FileObject[],
        validFilesToProcess: FileObject[],
        filesToResize: FileObject[],
        pdfsToLoad: FileObject[],
    ): Promise<ValidatedFiles> {
        if (filesToResize.length === 0) {
            const processedFiles = [...convertedFiles, ...validFilesToProcess];
            return {processedFiles, pdfsToLoad};
        }

        const resizedFiles = await resizeFilesWithLoader(filesToResize);
        const processedFiles = [...convertedFiles, ...validFilesToProcess, ...resizedFiles];
        return {processedFiles, pdfsToLoad};
    }

    /** Completes validation: either show PDFs for validation or finish with errors/onFilesValidated. */
    const completeValidation = ({processedFiles, pdfsToLoad}: {processedFiles: FileObject[]; pdfsToLoad: FileObject[]}) => {
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
            reset();
        }
    };

    async function convertAndResizeFiles(invalidResults: SingleAttachmentInvalidResult[], files: FileObject[]) {
        const {pdfsToLoad, nonPdfFiles, filesToConvert, filesToResize, validFilesToProcess} = classifyValidatedFiles(files, invalidResults);

        if (filesToConvert.length === 0) {
            const anyNonPdfTooLarge = nonPdfFiles.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);
            if (anyNonPdfTooLarge) {
                const resizedFiles = await resizeFilesWithLoader(nonPdfFiles);
                return completeValidation({processedFiles: resizedFiles, pdfsToLoad});
            }
            const mergedConvertedResizedFiles = await mergeConvertedResizedAndValid([], validFilesToProcess, filesToResize, pdfsToLoad);

            return completeValidation(mergedConvertedResizedFiles);
        }

        setIsLoaderVisible(true);

        let convertedFiles: FileObject[] | undefined;
        let mergedConvertedResizedFiles: ValidatedFiles | undefined;
        try {
            convertedFiles = await Promise.all(filesToConvert.map((file) => convertHeicImageToJpegPromise(file)));

            const convertedNeedingResize = convertedFiles.filter((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);

            if (convertedNeedingResize.length === 0) {
                mergedConvertedResizedFiles = await mergeConvertedResizedAndValid(convertedFiles, validFilesToProcess, filesToResize, pdfsToLoad);
                return completeValidation(mergedConvertedResizedFiles);
            }

            const resizedConverted = await resizeFilesWithLoader(convertedNeedingResize);

            const mergedConverted = convertedFiles.map((file) => {
                const index = convertedNeedingResize.indexOf(file);
                const fileNeededConverting = index >= 0;
                if (fileNeededConverting) {
                    return resizedConverted.at(index) ?? file;
                }
                return file;
            });

            setIsLoaderVisible(false);

            mergedConvertedResizedFiles = await mergeConvertedResizedAndValid(mergedConverted, validFilesToProcess, filesToResize, pdfsToLoad);
        } catch (error) {
            Log.alert('Error converting HEIC/HEIF files:', {error});
            setIsLoaderVisible(false);

            mergedConvertedResizedFiles = await mergeConvertedResizedAndValid([], validFilesToProcess, filesToResize, pdfsToLoad);
        }

        if (convertedFiles) {
            for (const [index, convertedFile] of convertedFiles.entries()) {
                updateFileOrderMapping(filesToConvert.at(index), convertedFile);
            }
        }

        return completeValidation(mergedConvertedResizedFiles);
    }

    async function validateFiles(filesParam: File | FileObject[], items?: DataTransferItem[], validationOptions?: ValidationOptions) {
        if (isValidatingFiles) {
            Log.warn('Files are already being validated. Please wait for the current validation to complete before calling `validateFiles` again.');
            return;
        }

        if (!filesParam) {
            return;
        }

        setIsValidatingFiles(true);
        dataTransferItemList.current = items ?? [];

        const isReceiptValidation = validationOptions?.isValidatingReceipts ?? DEFAULT_IS_VALIDATING_RECEIPTS;
        setIsValidatingReceipt(isReceiptValidation);
        collectedErrors.current = [];

        const files = Array.isArray(filesParam) ? filesParam : [filesParam];

        if (files.length > 1) {
            setIsValidatingMultipleFiles(true);
        }

        const result = await validateMultipleAttachmentFiles(files, items, isReceiptValidation);

        if (items) {
            dataTransferItemList.current = items;
        }

        const derivedFiles = getFilesFromValidationResult(result);

        if (!result.isValid && result.error === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            filesToValidate.current = result.files?.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) ?? [];
            if (items) {
                dataTransferItemList.current = items.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            }
        }

        for (const [index, file] of derivedFiles.entries()) {
            originalFileOrder.current.set(file.uri ?? '', index);
        }

        const invalidResults = !result.isValid && 'fileResults' in result ? result.fileResults.filter((fileResult) => !fileResult.isValid) : [];

        if (!result.isValid && result.error) {
            collectedErrors.current.push({error: result.error});
            setErrorAndOpenModal(result.error);
        }

        return convertAndResizeFiles(invalidResults, derivedFiles);
    }

    const onConfirmError = () => {
        if (fileError === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            setIsErrorModalVisible(false);
            convertAndResizeFiles([], filesToValidate.current);
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
                reset();
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

    const fileValidationErrorText = getFileValidationErrorText(translate, fileError, {fileType: invalidFileExtension}, {isValidatingReceipt, isValidatingMultipleFiles});

    const getModalPrompt = () => {
        if (!fileError) {
            return '';
        }
        const prompt = fileValidationErrorText.reason;
        if (fileError === CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE) {
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
