import type {HeicConverterFunction} from './types';

type HeicConverter = {
    heicTo: (options: {blob: Blob; type: string}) => Promise<Blob>;
    isHeic: (file: File) => Promise<boolean>;
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
        // Re-throw a normalized error so the outer catch can handle it uniformly
        throw new Error('HEIC conversion library unavailable');
    });

    const fetchBlobPromise = fetch(file.uri).then((response) => response.blob());

    Promise.all([libraryPromise, fetchBlobPromise])
        .then(([{heicTo, isHeic}, blob]) => {
            const fileFromBlob = new File([blob], file.name ?? 'temp-file', {type: blob.type});

            return isHeic(fileFromBlob).then((isHEIC) => {
                if (isHEIC || needsConversion) {
                    return heicTo({
                        blob,
                        type: 'image/jpeg',
                    })
                        .then((convertedBlob) => {
                            const fileName = file.name ? file.name.replace(/\.(heic|heif)$/i, '.jpg') : 'converted-image.jpg';
                            const jpegFile = new File([convertedBlob], fileName, {type: 'image/jpeg'});
                            jpegFile.uri = URL.createObjectURL(jpegFile);
                            onSuccess(jpegFile);
                        })
                        .catch((err) => {
                            console.error('Error converting image format to JPEG:', err);
                            onError(err, file);
                        });
                }

                onSuccess(file);
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
