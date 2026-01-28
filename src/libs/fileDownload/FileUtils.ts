/* eslint-disable @typescript-eslint/no-deprecated */
import {Str} from 'expensify-common';
import {Alert, Linking, Platform} from 'react-native';
import type {ReactNativeBlobUtilReadStream} from 'react-native-blob-util';
import ReactNativeBlobUtil from 'react-native-blob-util';
import ImageSize from 'react-native-image-size';
import type {TupleToUnion, ValueOf} from 'type-fest';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import DateUtils from '@libs/DateUtils';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import saveLastRoute from '@libs/saveLastRoute';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {FileObject} from '@src/types/utils/Attachment';
import getImageManipulator from './getImageManipulator';
import getImageResolution from './getImageResolution';
import type {ReadFileAsync, SplitExtensionFromFileName} from './types';

/**
 * Show alert on successful attachment download
 * @param successMessage
 */
function showSuccessAlert(translate: LocalizedTranslate, successMessage?: string) {
    Alert.alert(
        translate('fileDownload.success.title'),
        // successMessage can be an empty string and we want to default to `Localize.translate('fileDownload.success.message')`
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        successMessage || translate('fileDownload.success.message'),
        [
            {
                text: translate('common.ok'),
                style: 'cancel',
            },
        ],
        {cancelable: false},
    );
}

/**
 * Show alert on attachment download error
 */
function showGeneralErrorAlert(translate: LocalizedTranslate) {
    Alert.alert(translate('fileDownload.generalError.title'), translate('fileDownload.generalError.message'), [
        {
            text: translate('common.cancel'),
            style: 'cancel',
        },
    ]);
}

/**
 * Show alert on attachment download permissions error
 */
function showPermissionErrorAlert(translate: LocalizedTranslate) {
    Alert.alert(translate('fileDownload.permissionError.title'), translate('fileDownload.permissionError.message'), [
        {
            text: translate('common.cancel'),
            style: 'cancel',
        },
        {
            text: translate('common.settings'),
            onPress: () => {
                Linking.openSettings();
            },
        },
    ]);
}

/**
 * Inform the users when they need to grant camera access and guide them to settings
 */
function showCameraPermissionsAlert(translate: LocalizedTranslate) {
    Alert.alert(
        translate('attachmentPicker.cameraPermissionRequired'),
        translate('attachmentPicker.expensifyDoesNotHaveAccessToCamera'),
        [
            {
                text: translate('common.cancel'),
                style: 'cancel',
            },
            {
                text: translate('common.settings'),
                onPress: () => {
                    Linking.openSettings();
                    // In the case of ios, the App reloads when we update camera permission from settings
                    // we are saving last route so we can navigate to it after app reload
                    saveLastRoute();
                },
            },
        ],
        {cancelable: false},
    );
}

/**
 * Extracts a filename from a given URL and sanitizes it for file system usage.
 *
 * This function takes a URL as input and performs the following operations:
 * 1. Extracts the last segment of the URL.
 * 2. Decodes the extracted segment from URL encoding to a plain string for better readability.
 * 3. Replaces any characters in the decoded string that are illegal in file names
 *    with underscores.
 */
function getFileName(url: string): string {
    const fileName = url.split('/').pop()?.split('?')[0].split('#')[0] ?? '';

    if (!fileName) {
        Log.warn('[FileUtils] Could not get attachment name', {url});
    }

    return decodeURIComponent(fileName).replaceAll(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_');
}

function isImage(fileName: string): boolean {
    return CONST.FILE_TYPE_REGEX.IMAGE.test(fileName);
}

function isVideo(fileName: string): boolean {
    return CONST.FILE_TYPE_REGEX.VIDEO.test(fileName);
}

/**
 * Returns file type based on the uri
 */
function getFileType(fileUrl: string): string | undefined {
    if (!fileUrl) {
        return;
    }

    const fileName = getFileName(fileUrl);

    if (!fileName) {
        return;
    }

    if (isImage(fileName)) {
        return CONST.ATTACHMENT_FILE_TYPE.IMAGE;
    }
    if (isVideo(fileName)) {
        return CONST.ATTACHMENT_FILE_TYPE.VIDEO;
    }
    return CONST.ATTACHMENT_FILE_TYPE.FILE;
}

/**
 * Returns the filename split into fileName and fileExtension
 */
const splitExtensionFromFileName: SplitExtensionFromFileName = (fullFileName) => {
    const fileName = fullFileName.trim();
    const splitFileName = fileName.split('.');
    const fileExtension = splitFileName.length > 1 ? splitFileName.pop() : '';
    return {fileName: splitFileName.join('.'), fileExtension: fileExtension ?? ''};
};

/**
 * Returns the filename replacing special characters with underscore
 */
function cleanFileName(fileName: string): string {
    return fileName.replaceAll(/[^a-zA-Z0-9\-._]/g, '_');
}

function appendTimeToFileName(fileName: string): string {
    const file = splitExtensionFromFileName(fileName);

    const fileNameWithoutExtension = file.fileName;
    const fileExtension = file.fileExtension;

    const time = DateUtils.getDBTime();
    const timeSuffix = `-${time}`;

    const lengthSafeFileNameWithoutExtension =
        Platform.OS === 'android' ? truncateFileNameToSafeLengthOnAndroid({fileNameWithoutExtension, fileSuffixLength: timeSuffix.length}) : fileNameWithoutExtension;

    let newFileName = `${lengthSafeFileNameWithoutExtension}${timeSuffix}`;

    // Replace all illegal characters before trying to download the attachment.
    newFileName = newFileName.replaceAll(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_');
    if (fileExtension) {
        newFileName += `.${fileExtension}`;
    }
    return newFileName;
}

const ANDROID_SAFE_FILE_NAME_LENGTH = 70;

/**
 * Truncates the file name to a safe length on Android
 * @param params - An object containing:
 *   @param params.fileNameWithoutExtension - The file name without the extension
 *   @param params.fileSuffixLength - The length of the file suffix
 * @returns The truncated file name
 */
function truncateFileNameToSafeLengthOnAndroid({fileNameWithoutExtension, fileSuffixLength}: {fileNameWithoutExtension: string; fileSuffixLength: number}): string {
    const safeFileNameLengthWithoutSuffix = ANDROID_SAFE_FILE_NAME_LENGTH - fileSuffixLength;

    return fileNameWithoutExtension.substring(0, safeFileNameLengthWithoutSuffix);
}

/**
 * Reads a locally uploaded file
 * @param path - the blob url of the locally uploaded file
 * @param fileName - name of the file to read
 */
const readFileAsync: ReadFileAsync = (path, fileName, onSuccess, onFailure = () => {}, fileType = '') =>
    new Promise((resolve) => {
        if (!path) {
            resolve();
            onFailure('[FileUtils] Path not specified');
            return;
        }
        fetch(path)
            .then((res) => {
                // For some reason, fetch is "Unable to read uploaded file"
                // on Android even though the blob is returned, so we'll ignore
                // in that case
                if (!res.ok && Platform.OS !== 'android') {
                    throw Error(res.statusText);
                }
                res.blob()
                    .then((blob) => {
                        // On Android devices, fetching blob for a file with name containing spaces fails to retrieve the type of file.
                        // In this case, let us fallback on fileType provided by the caller of this function.
                        const file = new File([blob], cleanFileName(fileName), {type: blob.type || fileType});
                        file.source = path;
                        // For some reason, the File object on iOS does not have a uri property
                        // so images aren't uploaded correctly to the backend
                        file.uri = path;
                        onSuccess(file);
                        resolve(file);
                    })
                    .catch((e) => {
                        console.debug('[FileUtils] Could not read uploaded file', e);
                        onFailure(e);
                        resolve();
                    });
            })
            .catch((e) => {
                console.debug('[FileUtils] Could not read uploaded file', e);
                onFailure(e);
                resolve();
            });
    });

/**
 * Converts a base64 encoded image string to a File instance.
 * Adds a `uri` property to the File instance for accessing the blob as a URI.
 *
 * @param base64 - The base64 encoded image string.
 * @param filename - Desired filename for the File instance.
 * @returns The File instance created from the base64 string with an additional `uri` property.
 *
 * @example
 * const base64Image = "data:image/png;base64,..."; // your base64 encoded image
 * const imageFile = base64ToFile(base64Image, "example.png");
 * console.log(imageFile.uri); // Blob URI
 */
function base64ToFile(base64: string, filename: string): File {
    // Decode the base64 string
    const byteString = atob(base64.split(',').at(1) ?? '');

    // Get the mime type from the base64 string
    const mimeString = base64.split(',').at(0)?.split(':').at(1)?.split(';').at(0);

    // Convert byte string to Uint8Array
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    // Create a blob from the Uint8Array
    const blob = new Blob([uint8Array], {type: mimeString});

    // Create a File instance from the Blob
    const file = new File([blob], filename, {type: mimeString, lastModified: Date.now()});

    // Add a uri property to the File instance for accessing the blob as a URI
    file.uri = URL.createObjectURL(blob);

    return file;
}

function validateImageForCorruption(file: FileObject): Promise<{width: number; height: number} | void> {
    if (!Str.isImage(file.name ?? '') || !file.uri) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        ImageSize.getSize(file.uri ?? '')
            .then((size) => {
                if (size.height <= 0 || size.width <= 0) {
                    return reject(new Error('Error reading file: The file is corrupted'));
                }
                resolve();
            })
            .catch(() => {
                return reject(new Error('Error reading file: The file is corrupted'));
            });
    });
}

/** Verify file format based on the magic bytes of the file - some formats might be identified by multiple signatures */
function verifyFileFormat({fileUri, formatSignatures}: {fileUri: string; formatSignatures: readonly string[]}) {
    const MAGIC_BYTES_NEEDED = 16;

    if (!fileUri || !formatSignatures || formatSignatures.length === 0) {
        return Promise.resolve(false);
    }

    const cleanUri = fileUri.replace('file://', '');

    if (Platform.OS === 'ios') {
        return ReactNativeBlobUtil.fs.readFile(cleanUri, 'base64').then((fullBase64Data: string) => {
            const base64CharsNeeded = Math.ceil((MAGIC_BYTES_NEEDED * 4) / 3);
            const base64Data = fullBase64Data.substring(0, base64CharsNeeded);
            if (!base64Data) {
                return false;
            }

            try {
                const binaryString = atob(base64Data);

                const startOffset = 4;
                const bytesToRead = 12;
                const endOffset = startOffset + bytesToRead;

                if (binaryString.length < endOffset) {
                    return false;
                }

                const bytes = new Uint8Array(bytesToRead);
                for (let i = 0; i < bytesToRead; i++) {
                    bytes[i] = binaryString.charCodeAt(startOffset + i);
                }

                const hex = Array.from(bytes)
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');

                const result = formatSignatures.some((signature) => hex.startsWith(signature));
                return result;
            } catch (e) {
                return false;
            }
        });
    }

    return new Promise<boolean>((resolve) => {
        ReactNativeBlobUtil.fs
            .readStream(cleanUri, 'base64', 64, 0)
            .then((stream: ReactNativeBlobUtilReadStream) => {
                let base64Data = '';
                let hasEnoughData = false;

                const processData = () => {
                    if (!base64Data) {
                        resolve(false);
                        return;
                    }

                    try {
                        const binaryString = atob(base64Data);

                        const startOffset = 4;
                        const bytesToRead = 12;
                        const endOffset = startOffset + bytesToRead;

                        if (binaryString.length < endOffset) {
                            resolve(false);
                            return;
                        }

                        const bytes = new Uint8Array(bytesToRead);
                        for (let i = 0; i < bytesToRead; i++) {
                            bytes[i] = binaryString.charCodeAt(startOffset + i);
                        }

                        const hex = Array.from(bytes)
                            .map((b) => b.toString(16).padStart(2, '0'))
                            .join('');

                        const result = formatSignatures.some((signature) => hex.startsWith(signature));
                        resolve(result);
                    } catch (e) {
                        resolve(false);
                    }
                };

                stream.onData((chunk: string | number[]) => {
                    if (hasEnoughData) {
                        return;
                    }

                    try {
                        let chunkStr: string;
                        if (Array.isArray(chunk)) {
                            chunkStr = chunk.map((code) => String.fromCharCode(code)).join('');
                        } else {
                            chunkStr = chunk;
                        }
                        base64Data += chunkStr;

                        const decodedByteCount = Math.floor((base64Data.length * 3) / 4);
                        if (decodedByteCount >= MAGIC_BYTES_NEEDED) {
                            hasEnoughData = true;
                            processData();
                        }
                    } catch (e) {
                        if (!hasEnoughData) {
                            hasEnoughData = true;
                            resolve(false);
                        }
                    }
                });

                stream.onError(() => {
                    if (hasEnoughData) {
                        return;
                    }
                    hasEnoughData = true;
                    resolve(false);
                });

                stream.onEnd(() => {
                    if (hasEnoughData) {
                        return;
                    }
                    hasEnoughData = true;
                    processData();
                });

                stream.open();
            })
            .catch(() => resolve(false));
    });
}

function isLocalFile(receiptUri?: string | number): boolean {
    if (!receiptUri) {
        return false;
    }
    return typeof receiptUri === 'number' || receiptUri?.startsWith('blob:') || receiptUri?.startsWith('file:') || receiptUri?.startsWith('/');
}

function getFileResolution(targetFile: FileObject | undefined): Promise<{width: number; height: number} | null> {
    if (!targetFile) {
        return Promise.resolve(null);
    }

    // If the file already has width and height, return them directly
    if ('width' in targetFile && 'height' in targetFile) {
        return Promise.resolve({width: targetFile.width ?? 0, height: targetFile.height ?? 0});
    }

    // Otherwise, attempt to get the image resolution
    return getImageResolution(targetFile)
        .then(({width, height}) => ({width, height}))
        .catch((error: Error) => {
            Log.hmmm('Failed to get image resolution:', error);
            return null;
        });
}

function isHighResolutionImage(resolution: {width: number; height: number} | null): boolean {
    return resolution !== null && (resolution.width > CONST.IMAGE_HIGH_RESOLUTION_THRESHOLD || resolution.height > CONST.IMAGE_HIGH_RESOLUTION_THRESHOLD);
}

const getImageDimensionsAfterResize = (file: FileObject) =>
    ImageSize.getSize(file.uri ?? '').then(({width, height}) => {
        const scaleFactor = CONST.MAX_IMAGE_DIMENSION / (width < height ? height : width);
        const newWidth = Math.max(1, width * scaleFactor);
        const newHeight = Math.max(1, height * scaleFactor);

        return {width: newWidth, height: newHeight};
    });

const createFile = (file: File): FileObject => {
    if (getPlatform() === CONST.PLATFORM.ANDROID || getPlatform() === CONST.PLATFORM.IOS) {
        return {
            uri: file.uri,
            name: file.name,
            type: file.type,
        };
    }
    return new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
    });
};

const resizeImageIfNeeded = (file: FileObject) => {
    if (!file || !Str.isImage(file.name ?? '') || (file?.size ?? 0) <= CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
        return Promise.resolve(file);
    }
    return getImageDimensionsAfterResize(file)
        .then(({width, height}) => getImageManipulator({fileUri: file.uri ?? '', width, height, fileName: file.name ?? '', type: file.type}))
        .then((result) => createFile(result));
};

const validateReceipt = (file: FileObject, setUploadReceiptError: (isInvalid: boolean, title: TranslationPaths, reason: TranslationPaths) => void) => {
    return validateImageForCorruption(file)
        .then(() => {
            const {fileExtension} = splitExtensionFromFileName(file?.name ?? '');
            if (
                !CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(
                    fileExtension.toLowerCase() as TupleToUnion<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>,
                )
            ) {
                setUploadReceiptError(true, 'attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension');
                return false;
            }

            if (!Str.isImage(file.name ?? '') && (file?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE) {
                setUploadReceiptError(true, 'attachmentPicker.attachmentTooLarge', 'attachmentPicker.sizeExceededWithLimit');
                return false;
            }

            if ((file?.size ?? 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                setUploadReceiptError(true, 'attachmentPicker.attachmentTooSmall', 'attachmentPicker.sizeNotMet');
                return false;
            }
            return true;
        })
        .catch(() => {
            setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.errorWhileSelectingCorruptedAttachment');
            return false;
        });
};

const isValidReceiptExtension = (file: FileObject) => {
    const {fileExtension} = splitExtensionFromFileName(file?.name ?? '');
    return CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(
        fileExtension.toLowerCase() as TupleToUnion<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>,
    );
};

const hasHeicOrHeifExtension = (file: FileObject) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return file.name?.toLowerCase().endsWith('.heic') || file.name?.toLowerCase().endsWith('.heif');
};

/**
 * Normalizes a file-like object specifically for Android clipboard image pasting,
 * where limited file metadata is available (e.g., only a URI).
 * If the object is already a File or contains a size, it is returned as-is.
 * Otherwise, it attempts to fetch the file via its URI and reconstruct a File
 * with full metadata (name, size, type).
 */
const normalizeFileObject = (file: FileObject): Promise<FileObject> => {
    if (file instanceof File || file instanceof Blob) {
        return Promise.resolve(file);
    }

    const isAndroidNative = getPlatform() === CONST.PLATFORM.ANDROID;
    const isIOSNative = getPlatform() === CONST.PLATFORM.IOS;
    const isNativePlatform = isAndroidNative || isIOSNative;

    if (!isNativePlatform || 'size' in file) {
        return Promise.resolve(file);
    }

    if (typeof file.uri !== 'string') {
        return Promise.resolve(file);
    }

    return fetch(file.uri)
        .then((response) => response.blob())
        .then((blob) => {
            const name = file.name ?? 'unknown';
            const type = file.type ?? blob.type ?? 'application/octet-stream';
            const normalizedFile = new File([blob], name, {type});
            return normalizedFile;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

type ValidateAttachmentOptions = {
    isValidatingReceipts?: boolean;
    isValidatingMultipleFiles?: boolean;
};

const validateAttachment = (file: FileObject, validationOptions?: ValidateAttachmentOptions) => {
    const maxFileSize = validationOptions?.isValidatingReceipts ? CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE : CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE;

    if (validationOptions?.isValidatingReceipts && !isValidReceiptExtension(file)) {
        return validationOptions?.isValidatingMultipleFiles ? CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE : CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE;
    }

    if (!Str.isImage(file.name ?? '') && !hasHeicOrHeifExtension(file) && (file?.size ?? 0) > maxFileSize) {
        return validationOptions?.isValidatingMultipleFiles ? CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE_MULTIPLE : CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE;
    }

    if (validationOptions?.isValidatingReceipts && (file?.size ?? 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        return CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL;
    }

    return '';
};

type TranslationAdditionalData = {
    maxUploadSizeInMB?: number;
    fileLimit?: number;
    fileType?: string;
};

const getFileValidationErrorText = (
    translate: LocalizedTranslate,
    validationError: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null,
    additionalData: TranslationAdditionalData = {},
    isValidatingReceipt = false,
): {
    title: string;
    reason: string;
} => {
    if (!validationError) {
        return {
            title: '',
            reason: '',
        };
    }
    const maxSize = isValidatingReceipt ? CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE : CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE;
    switch (validationError) {
        case CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE:
            return {
                title: translate('attachmentPicker.wrongFileType'),
                reason: translate('attachmentPicker.notAllowedExtension'),
            };
        case CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE:
            return {
                title: translate('attachmentPicker.someFilesCantBeUploaded'),
                reason: translate('attachmentPicker.unsupportedFileType', {fileType: additionalData.fileType ?? ''}),
            };
        case CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE:
            return {
                title: translate('attachmentPicker.attachmentTooLarge'),
                reason: isValidatingReceipt
                    ? translate('attachmentPicker.sizeExceededWithLimit', {
                          maxUploadSizeInMB: additionalData.maxUploadSizeInMB ?? CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE / 1024 / 1024,
                      })
                    : translate('attachmentPicker.sizeExceeded'),
            };
        case CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE_MULTIPLE:
            return {
                title: translate('attachmentPicker.someFilesCantBeUploaded'),
                reason: translate('attachmentPicker.sizeLimitExceeded', {
                    maxUploadSizeInMB: additionalData.maxUploadSizeInMB ?? maxSize / 1024 / 1024,
                }),
            };
        case CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL:
            return {
                title: translate('attachmentPicker.attachmentTooSmall'),
                reason: translate('attachmentPicker.sizeNotMet'),
            };
        case CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED:
            return {
                title: translate('attachmentPicker.attachmentError'),
                reason: translate('attachmentPicker.folderNotAllowedMessage'),
            };
        case CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED:
            return {
                title: translate('attachmentPicker.someFilesCantBeUploaded'),
                reason: translate('attachmentPicker.maxFileLimitExceeded'),
            };
        case CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED:
            return {
                title: translate('attachmentPicker.attachmentError'),
                reason: translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'),
            };
        case CONST.FILE_VALIDATION_ERRORS.PROTECTED_FILE:
            return {
                title: translate('attachmentPicker.attachmentError'),
                reason: translate('attachmentPicker.protectedPDFNotSupported'),
            };
        default:
            return {
                title: translate('attachmentPicker.attachmentError'),
                reason: translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'),
            };
    }
};

const getConfirmModalPrompt = (translate: LocalizedTranslate, attachmentInvalidReason: TranslationPaths | undefined) => {
    if (!attachmentInvalidReason) {
        return '';
    }
    if (attachmentInvalidReason === 'attachmentPicker.sizeExceededWithLimit') {
        return translate(attachmentInvalidReason, {maxUploadSizeInMB: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE / (1024 * 1024)});
    }
    return translate(attachmentInvalidReason);
};

const MAX_CANVAS_SIZE = 4096;
const JPEG_QUALITY = 0.85;

/**
 * Canvas fallback for converting HEIC to JPEG in web browsers
 */
const canvasFallback = (blob: Blob, fileName: string): Promise<File> => {
    if (typeof createImageBitmap === 'undefined') {
        return Promise.reject(new Error('Canvas fallback not supported in this browser'));
    }

    return createImageBitmap(blob).then((imageBitmap) => {
        const canvas = document.createElement('canvas');

        const scale = Math.min(1, MAX_CANVAS_SIZE / Math.max(imageBitmap.width, imageBitmap.height));

        canvas.width = Math.floor(imageBitmap.width * scale);
        canvas.height = Math.floor(imageBitmap.height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

        return new Promise<File>((resolve, reject) => {
            canvas.toBlob(
                (convertedBlob) => {
                    if (!convertedBlob) {
                        reject(new Error('Canvas conversion failed - returned null blob'));
                        return;
                    }

                    const jpegFileName = fileName.replaceAll(/\.(heic|heif)$/gi, '.jpg');
                    const jpegFile = Object.assign(new File([convertedBlob], jpegFileName, {type: CONST.IMAGE_FILE_FORMAT.JPEG}), {uri: URL.createObjectURL(convertedBlob)});
                    resolve(jpegFile);
                },
                CONST.IMAGE_FILE_FORMAT.JPEG,
                JPEG_QUALITY,
            );
        });
    });
};

function getFileWithUri(file: File) {
    const newFile = file;
    newFile.uri = URL.createObjectURL(newFile);
    return newFile as FileObject;
}

function getFilesFromClipboardEvent(event: DragEvent) {
    const files = event.dataTransfer?.files;
    if (!files || files?.length === 0) {
        return [];
    }

    return Array.from(files).map((file) => getFileWithUri(file));
}

function cleanFileObject(fileObject: FileObject): FileObject {
    if ('getAsFile' in fileObject && typeof fileObject.getAsFile === 'function') {
        return fileObject.getAsFile() as FileObject;
    }

    return fileObject;
}

function cleanFileObjectName(fileObject: FileObject): FileObject {
    if (fileObject instanceof File) {
        const cleanName = cleanFileName(fileObject.name);
        if (fileObject.name !== cleanName) {
            const updatedFile = new File([fileObject], cleanName, {type: fileObject.type});
            const inputSource = URL.createObjectURL(updatedFile);
            updatedFile.uri = inputSource;
            return updatedFile;
        }
        if (!fileObject.uri) {
            const inputSource = URL.createObjectURL(fileObject);
            // eslint-disable-next-line no-param-reassign
            fileObject.uri = inputSource;
        }
    }
    return fileObject;
}

export {
    showGeneralErrorAlert,
    showSuccessAlert,
    showPermissionErrorAlert,
    showCameraPermissionsAlert,
    splitExtensionFromFileName,
    getFileName,
    getFileType,
    cleanFileName,
    appendTimeToFileName,
    ANDROID_SAFE_FILE_NAME_LENGTH,
    truncateFileNameToSafeLengthOnAndroid,
    readFileAsync,
    base64ToFile,
    isLocalFile,
    validateImageForCorruption,
    isImage,
    getFileResolution,
    isHighResolutionImage,
    verifyFileFormat,
    getImageDimensionsAfterResize,
    resizeImageIfNeeded,
    createFile,
    validateReceipt,
    validateAttachment,
    normalizeFileObject,
    isValidReceiptExtension,
    getFileValidationErrorText,
    hasHeicOrHeifExtension,
    getConfirmModalPrompt,
    canvasFallback,
    getFilesFromClipboardEvent,
    cleanFileObject,
    cleanFileObjectName,
};

export type {ValidateAttachmentOptions};
