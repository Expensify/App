import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import {verifyFileFormat} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type {HeicConverterFunction} from './types';

/**
 * Helper function to convert HEIC/HEIF image to JPEG using ImageManipulator
 * @param file - The original file object
 * @param sourceUri - URI of the image to convert
 * @param originalExtension - The original file extension pattern to replace
 * @param callbacks - Callback functions for the conversion process
 */
const convertImageWithManipulator = (
    file: FileObject,
    sourceUri: string,
    originalExtension: RegExp,
    {
        onSuccess = () => {},
        onError = () => {},
        onFinish = () => {},
    }: {
        onSuccess?: (convertedFile: FileObject) => void;
        onError?: (error: unknown, originalFile: FileObject) => void;
        onFinish?: () => void;
    } = {},
) => {
    const imageManipulatorContext = ImageManipulator.manipulate(sourceUri);
    imageManipulatorContext
        .renderAsync()
        .then((manipulatedImage) => manipulatedImage.saveAsync({format: SaveFormat.JPEG}))
        .then((manipulationResult) => {
            const convertedFile = {
                uri: manipulationResult.uri,
                name: file.name?.replace(originalExtension, '.jpg') ?? 'converted-image.jpg',
                type: 'image/jpeg',
                size: file.size,
                width: manipulationResult.width,
                height: manipulationResult.height,
            };
            onSuccess(convertedFile);
        })
        .catch((err) => {
            console.error('Error converting HEIC/HEIF to JPEG:', err);
            onError(err, file);
        })
        .finally(() => {
            onFinish();
        });
};

/**
 * Native implementation for converting HEIC/HEIF images to JPEG
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

    // Conversion based on extension
    if (needsConversion) {
        const fileUri = file.uri;
        convertImageWithManipulator(file, fileUri, /\.(heic|heif)$/i, {
            onSuccess,
            onError,
            onFinish,
        });
        return;
    }

    // If not detected by extension, check using file signatures
    verifyFileFormat({fileUri: file.uri, formatSignatures: CONST.HEIC_SIGNATURES})
        .then((isHEIC) => {
            if (isHEIC) {
                const fileUri = file.uri;
                if (!fileUri) {
                    onError(new Error('File URI is undefined'), file);
                    onFinish();
                    return;
                }
                convertImageWithManipulator(file, fileUri, /\.heic$/i, {
                    onSuccess,
                    onError,
                    onFinish,
                });
                return;
            }

            onSuccess(file);
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
