import {hasHeicOrHeifExtension} from '@libs/fileDownload/FileUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type {HeicConverterFunction} from './types';

const MAX_CANVAS_SIZE = 4096;
const JPEG_QUALITY = 0.85;

type HeicConverter = {
    heicTo: (options: {blob: Blob; type: string}) => Promise<Blob>;
    isHeic: (file: File) => Promise<boolean>;
};

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

                    const jpegFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
                    const jpegFile = Object.assign(new File([convertedBlob], jpegFileName, {type: CONST.IMAGE_FILE_FORMAT.JPEG}), {uri: URL.createObjectURL(convertedBlob)});
                    resolve(jpegFile);
                },
                CONST.IMAGE_FILE_FORMAT.JPEG,
                JPEG_QUALITY,
            );
        });
    });
};

const getHeicConverter = () => {
    // Use the CSP variant to ensure the library is loaded in a secure context. See https://github.com/hoppergee/heic-to?tab=readme-ov-file#cotent-security-policy
    // Use webpackMode: "eager" to ensure the library is loaded immediately without evaluating the code. See https://github.com/Expensify/App/pull/68727#issuecomment-3227196372
    return import(/* webpackMode: "eager" */ 'heic-to/csp').then(({heicTo, isHeic}: HeicConverter) => ({heicTo, isHeic}));
};

/**
 * Web implementation for converting HEIC/HEIF images to JPEG
 * @param file - The file to check and potentially convert
 * @param callbacks - Object containing callback functions for different stages of conversion
 */
const convertHeicImage: HeicConverterFunction = (file, {onSuccess = () => {}, onError = () => {}, onStart = () => {}, onFinish = () => {}} = {}) => {
    if (!file.uri || !hasHeicOrHeifExtension(file)) {
        onSuccess(file);
        return;
    }

    onStart();

    if (!file.uri) {
        onError(new Error('File URI is undefined'), file);
        onFinish();
        return;
    }

    // Start loading the conversion library in parallel with fetching the file
    const libraryPromise = getHeicConverter().catch((importError) => {
        console.error('Error loading heic-to library:', importError);
        // Re-throw a normalized error so the outer catch can handle it uniformly
        throw new Error('HEIC conversion library unavailable');
    });

    const fetchBlobPromise = fetch(file.uri).then((response) => response.blob());

    Promise.all([libraryPromise, fetchBlobPromise])
        .then(([heicConverter, blob]) => {
            const fileName = file.name ?? 'temp-file.heic';
            const fileFromBlob = new File([blob], fileName, {type: blob.type});

            // Strategy 1: Try heic-to library
            if (heicConverter && typeof heicConverter.heicTo === 'function') {
                return (heicConverter.isHeic as (file: File) => Promise<boolean>)(fileFromBlob).then((isHEIC) => {
                    if (isHEIC || hasHeicOrHeifExtension(file)) {
                        return heicConverter
                            .heicTo({blob, type: CONST.IMAGE_FILE_FORMAT.JPEG})
                            .then((convertedBlob) => {
                                const jpegFile = Object.assign(new File([convertedBlob], fileName.replace(/\.(heic|heif)$/i, '.jpg'), {type: CONST.IMAGE_FILE_FORMAT.JPEG}), {
                                    uri: URL.createObjectURL(convertedBlob),
                                });
                                onSuccess(jpegFile as FileObject);
                            })
                            .catch(() => {
                                // Strategy 2: Canvas fallback
                                return canvasFallback(fileFromBlob, fileName)
                                    .then(onSuccess)
                                    .catch((err) => {
                                        console.error('Canvas fallback failed:', err);
                                        onError(err, file);
                                    });
                            });
                    }
                    // Not a HEIC file, return original
                    onSuccess(file);
                });
            }

            // No library - use canvas fallback
            return canvasFallback(fileFromBlob, fileName)
                .then(onSuccess)
                .catch((err) => {
                    console.error('Canvas fallback failed:', err);
                    onError(err, file);
                });
        })
        .catch((err) => {
            console.error('Error processing the file:', err);
            onError(err, file);
        })
        .finally(() => {
            onFinish();
        });
};

export default convertHeicImage;
