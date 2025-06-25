import {Str} from 'expensify-common';
import React, {useCallback, useRef, useState} from 'react';
import {Alert} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import {useFullScreenLoader} from '@components/FullScreenLoaderContext';
import PDFThumbnail from '@components/PDFThumbnail';
import {getFileValidationErrorText, isHeicOrHeifImage, resizeImageIfNeeded, splitExtensionFromFileName, validateAttachment, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import CONST from '@src/CONST';
import useLocalize from '../useLocalize';
import useThemeStyles from '../useThemeStyles';

type ErrorObject = {
    error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>;
    fileExtension?: string;
};

function useFilesValidation(proceedWithFilesAction: (files: FileObject[]) => void) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [pdfFilesToRender, setPdfFilesToRender] = useState<FileObject[]>([]);
    const [validFilesToUpload, setValidFilesToUpload] = useState([] as FileObject[]);
    const [errorQueue, setErrorQueue] = useState<ErrorObject[]>([]);
    const {setIsLoaderVisible} = useFullScreenLoader();
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

    const validatedPDFs = useRef<FileObject[]>([]);
    const validFiles = useRef<FileObject[]>([]);
    const filesToValidate = useRef<FileObject[]>([]);
    const collectedErrors = useRef<ErrorObject[]>([]);

    const resetValidationState = useCallback(() => {
        setPdfFilesToRender([]);
        setIsLoaderVisible(false);
        setValidFilesToUpload([]);
        setErrorQueue([]);
        setCurrentErrorIndex(0);
        validatedPDFs.current = [];
        validFiles.current = [];
        filesToValidate.current = [];
        collectedErrors.current = [];
    }, [setIsLoaderVisible]);

    const showErrorAlert = (error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>, fileExtension?: string, isCheckingMultipleFiles = false) => {
        const errorText = getFileValidationErrorText(error, {fileType: fileExtension});

        const buttons: Array<{text: string; style?: 'cancel'; onPress: () => void}> = [
            {
                text: translate('common.cancel'),
                style: 'cancel',
                onPress: () => resetValidationState(),
            },
        ];

        if (isCheckingMultipleFiles) {
            buttons.push({
                text: translate('common.continue'),
                onPress: () => {
                    if (error === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        validateAndResizeFiles(filesToValidate.current);
                        return;
                    }

                    if (currentErrorIndex < errorQueue.length - 1) {
                        const nextIndex = currentErrorIndex + 1;
                        const nextError = errorQueue.at(nextIndex);
                        if (nextError) {
                            setCurrentErrorIndex(nextIndex);
                            showErrorAlert(nextError.error, nextError.fileExtension, isCheckingMultipleFiles);
                            return;
                        }
                    }

                    if (validFilesToUpload.length > 0) {
                        proceedWithFilesAction(validFilesToUpload);
                    }
                },
            });
        }

        Alert.alert(errorText.title, errorText.reason, buttons);
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
            const uniqueErrors = Array.from(new Set(collectedErrors.current.map((error) => JSON.stringify(error)))).map((errorStr) => JSON.parse(errorStr) as ErrorObject);
            setErrorQueue(uniqueErrors);
            setCurrentErrorIndex(0);
            const firstError = uniqueErrors.at(0);
            if (firstError) {
                showErrorAlert(firstError.error, firstError.fileExtension, validFiles.current.length > 1);
            }
        } else if (validFiles.current.length > 0) {
            proceedWithFilesAction(validFiles.current);
            resetValidationState();
        }
    }, [pdfFilesToRender.length, showErrorAlert, proceedWithFilesAction, resetValidationState]);

    const validateAndResizeFiles = (files: FileObject[]) => {
        // Reset collected errors for new validation
        collectedErrors.current = [];
        const isCheckingMultipleFiles = files.length > 1;

        Promise.all(files.map((file) => isValidFile(file, isCheckingMultipleFiles).then((isValid) => (isValid ? file : null))))
            .then((validationResults) => {
                const filteredResults = validationResults.filter((result): result is FileObject => result !== null);
                const validImages = filteredResults.filter((file) => !Str.isPDF(file.name ?? ''));
                const pdfsToLoad = filteredResults.filter((file) => Str.isPDF(file.name ?? ''));

                // Check if we need to convert images
                if (validImages.some((file) => isHeicOrHeifImage(file))) {
                    setIsLoaderVisible(true);

                    return Promise.all(validImages.map((file) => convertHeicImageToJpegPromise(file))).then((convertedImages) => {
                        // Check if we need to resize images
                        if (convertedImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                            return Promise.all(convertedImages.map((file) => resizeImageIfNeeded(file))).then((processedImages) => {
                                setIsLoaderVisible(false);
                                return Promise.resolve({processedImages, pdfsToLoad});
                            });
                        }

                        // No resizing needed, just return the converted images
                        setIsLoaderVisible(false);
                        return Promise.resolve({processedImages: convertedImages, pdfsToLoad});
                    });
                }

                // No conversion needed, but check if we need to resize images
                if (validImages.some((file) => (file.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE)) {
                    setIsLoaderVisible(true);
                    return Promise.all(validImages.map((file) => resizeImageIfNeeded(file))).then((processedImages) => {
                        setIsLoaderVisible(false);
                        return Promise.resolve({processedImages, pdfsToLoad});
                    });
                }

                // No conversion or resizing needed, just return the valid images
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
                        const uniqueErrors = Array.from(new Set(collectedErrors.current.map((error) => JSON.stringify(error)))).map((errorStr) => JSON.parse(errorStr) as ErrorObject);
                        setErrorQueue(uniqueErrors);
                        setCurrentErrorIndex(0);
                        const firstError = uniqueErrors.at(0);
                        if (firstError) {
                            showErrorAlert(firstError.error, firstError.fileExtension, isCheckingMultipleFiles);
                        }
                    } else if (processedImages.length > 0) {
                        proceedWithFilesAction(processedImages);
                        resetValidationState();
                    }
                }
            });
    };

    const validateFiles = (files: FileObject[]) => {
        if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
            filesToValidate.current = files.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            showErrorAlert(CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED, undefined, files.length > 1);
        } else {
            validateAndResizeFiles(files);
        }
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

    return {
        PDFValidationComponent,
        validateFiles,
    };
}

export default useFilesValidation;
