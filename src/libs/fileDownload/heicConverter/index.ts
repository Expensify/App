import type {HeicConverterFunction} from './types';

type HeicConverter = {
    heicTo: (options: {blob: Blob; type: string}) => Promise<Blob>;
    isHeic: (file: File) => Promise<boolean>;
};

const getHeicConverter = () => {
    // Use the CSP variant to ensure the library is loaded in a secure context. See https://github.com/hoppergee/heic-to?tab=readme-ov-file#cotent-security-policy
    // Use webpackMode: "eager" to ensure the library is loaded immediately without evaluating the code. See https://github.com/Expensify/App/pull/68727#issuecomment-3227196372
    // @ts-expect-error - heic-to/csp is not correctly typed but exists
    return import(/* webpackMode: "eager" */ 'heic-to/csp').then(({heicTo, isHeic}: HeicConverter) => ({heicTo, isHeic}));
};

/**
 * Attempts Canvas API fallback conversion for HEIC files
 * @param blob - The HEIC blob to convert
 * @param fileName - Original filename
 * @returns Promise<File> - Converted JPEG file or throws error
 */
const tryCanvasFallback = (blob: Blob, fileName: string): Promise<File> => {
    // Check if browser supports ImageBitmap and createImageBitmap
    if (typeof createImageBitmap === 'undefined') {
        throw new Error('Canvas API fallback not supported in this browser');
    }

    // Try to create ImageBitmap directly from blob
    return createImageBitmap(blob)
        .then((imageBitmap) => {
            // Create canvas and draw the image
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            ctx.drawImage(imageBitmap, 0, 0);

            // Convert canvas to JPEG blob
            return new Promise<File>((resolve, reject) => {
                canvas.toBlob(
                    (convertedBlob) => {
                        if (!convertedBlob) {
                            reject(new Error('Canvas conversion failed'));
                            return;
                        }

                        const jpegFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
                        const jpegFile = new File([convertedBlob], jpegFileName, {type: 'image/jpeg'});
                        jpegFile.uri = URL.createObjectURL(jpegFile);
                        resolve(jpegFile);
                    },
                    'image/jpeg',
                    0.85,
                );
            });
        });
};

/**
 * Web implementation for converting HEIC/HEIF images to JPEG with multiple fallback strategies
 * @param file - The file to check and potentially convert
 * @param callbacks - Object containing callback functions for different stages of conversion
 */
const convertHeicImage: HeicConverterFunction = (file, {onSuccess = () => {}, onError = () => {}, onStart = () => {}, onFinish = () => {}} = {}) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const needsConversion = file.name?.toLowerCase().endsWith('.heic') || file.name?.toLowerCase().endsWith('.heif');

    if (!needsConversion || !file.uri || !file.type?.startsWith('image')) {
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
        // Don't throw here, we'll try fallbacks
        return null;
    });

    const fetchBlobPromise = fetch(file.uri)
        .then((response) => response.blob())
        .then((blob) => {
            return blob;
        });

    Promise.all([libraryPromise, fetchBlobPromise])
        .then(([heicConverter, blob]) => {
            const fileName = file.name ?? 'temp-file.heic';

            // Strategy 1: Try heic-to library (primary method)
            if (heicConverter) {
                return heicConverter.heicTo({
                    blob,
                    type: 'image/jpeg',
                })
                .then((convertedBlob) => {
                    const jpegFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
                    const jpegFile = new File([convertedBlob], jpegFileName, {type: 'image/jpeg'});
                    jpegFile.uri = URL.createObjectURL(jpegFile);
                    onSuccess(jpegFile);
                })
                .catch(() => {
                    // Strategy 2: Try Canvas API with ImageBitmap
                    return tryCanvasFallback(blob, fileName)
                        .then((canvasResult) => {
                            onSuccess(canvasResult);
                        })
                        .catch((canvasError) => {
                            onError(canvasError, file);
                        });
                });
            }

            // Strategy 2: Try Canvas API with ImageBitmap (when no heic converter)
            return tryCanvasFallback(blob, fileName)
                .then((canvasResult) => {
                    onSuccess(canvasResult);
                })
                .catch((canvasError) => {
                    onError(canvasError, file);
                });

            // Create a clean File object from the blob without URI property
            const heicFile = new File([blob], fileName, {type: file.type ?? 'image/heic'});

            onSuccess(heicFile);
        })
        .catch(() => {
            // Even if we can't process/convert the HEIC file, still allow upload
            const fileName = file.name ? file.name : 'converted-image.heic';

            // Re-fetch the blob to ensure we have a clean File object
            fetch(file.uri ?? '')
                .then((response) => response.blob())
                .then((blob) => {
                    const heicFile = new File([blob], fileName, {type: file.type ?? 'image/heic'});
                    onSuccess(heicFile);
                })
                .catch(() => {
                    // If we can't fetch, create a minimal file object
                    const heicFile = new File([], fileName, {type: file.type ?? 'image/heic'});
                    onError(new Error('Failed to process HEIC file'), heicFile);
                });
        })
        .finally(() => {
            onFinish();
        });
};

export default convertHeicImage;
