import Log from '@libs/Log';

import type {FileObject} from '@src/types/utils/Attachment';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';

import type {HeicConverterFunction} from './types';

/** Conversion failures are usually transient memory-pressure errors, so a single delayed retry recovers most of them */
const HEIC_CONVERSION_RETRY_DELAY_MS = 300;

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
    retriesLeft = 1,
) => {
    let willRetry = false;
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
            if (retriesLeft > 0) {
                willRetry = true;
                Log.info('HEIC/HEIF conversion failed, retrying', false, {error: err instanceof Error ? err.message : String(err)});
                setTimeout(() => convertImageWithManipulator(file, sourceUri, originalExtension, {onSuccess, onError, onFinish}, retriesLeft - 1), HEIC_CONVERSION_RETRY_DELAY_MS);
                return;
            }
            Log.warn('Error converting HEIC/HEIF to JPEG', {error: err instanceof Error ? err.message : String(err)});
            onError(err, file);
        })
        .finally(() => {
            if (willRetry) {
                return;
            }
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

    // Conversion based on extension
    convertImageWithManipulator(file, file.uri, /\.(heic|heif)$/i, {
        onSuccess,
        onError,
        onFinish,
    });
};

export default convertHeicImage;
