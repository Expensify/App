import {heicTo, isHeic} from 'heic-to';
import type {HeicConverterFunction} from './types';

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

    fetch(file.uri)
        .then((response) => response.blob())
        .then((blob) => {
            const fileFromBlob = new File([blob], file.name ?? 'temp-file', {
                type: blob.type,
            });

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
                        })
                        .finally(() => {
                            onFinish();
                        });
                }

                onSuccess(file);
                onFinish();
            });
        })
        .catch((err) => {
            console.error('Error processing the file:', err);
            onError(err, file);
            onFinish();
        });
};

export default convertHeicImage;
