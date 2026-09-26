import {isLabelledDng} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import Log from '@libs/Log';

import type {FileObject} from '@src/types/utils/Attachment';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ReactNativeBlobUtil from 'react-native-blob-util';

import type {HeicConverterFunction} from './types';

/**
 * Size of the converted JPEG on disk. The original file's size is only a fallback: a JPEG made from a 25-75 MB DNG is
 * a fraction of it, and reusing the original would trip the attachment size limits for a file that fits them.
 */
function getConvertedFileSize(uri: string, fallbackSize: number | null | undefined): Promise<number | null | undefined> {
    return Promise.resolve()
        .then(() => ReactNativeBlobUtil.fs.stat(fileURIToPath(uri)))
        .then((stats) => (typeof stats?.size === 'number' ? stats.size : fallbackSize))
        .catch(() => fallbackSize);
}

/**
 * Name for the converted JPEG: the original extension is swapped for `.jpg`, or `.jpg` is appended when the file was
 * recognized by MIME type and its name carries no matching extension.
 */
function getConvertedFileName(fileName: string | undefined, originalExtension: RegExp): string {
    if (!fileName) {
        return 'converted-image.jpg';
    }
    return originalExtension.test(fileName) ? fileName.replace(originalExtension, '.jpg') : `${fileName}.jpg`;
}

/**
 * Helper function to convert a HEIC/HEIF or DNG image to JPEG using ImageManipulator
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
        .then((manipulationResult) =>
            getConvertedFileSize(manipulationResult.uri, file.size).then((size) => {
                const convertedFile = {
                    uri: manipulationResult.uri,
                    name: getConvertedFileName(file.name, originalExtension),
                    type: 'image/jpeg',
                    size,
                    width: manipulationResult.width,
                    height: manipulationResult.height,
                };
                onSuccess(convertedFile);
            }),
        )
        .catch((err) => {
            Log.warn('Error converting image to JPEG', {error: err instanceof Error ? err.message : String(err)});
            onError(err, file);
        })
        .finally(() => {
            onFinish();
        });
};

/**
 * Native implementation for converting HEIC/HEIF and DNG images to JPEG
 * @param file - The file to check and potentially convert
 * @param callbacks - Object containing callback functions for different stages of conversion
 */
const convertHeicImage: HeicConverterFunction = (file, {onSuccess = () => {}, onError = () => {}, onStart = () => {}, onFinish = () => {}} = {}) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isHeic = file.name?.toLowerCase().endsWith('.heic') || file.name?.toLowerCase().endsWith('.heif');
    // A DNG can arrive without an `image/*` type (Android's MIME map doesn't know it on every device), so the type check
    // below only applies to HEIC. The backend rejects DNG, so it must be converted rather than passed through.
    const isDng = isLabelledDng(file);

    if (!file.uri || (!isDng && (!isHeic || !file.type?.startsWith('image')))) {
        onSuccess(file);
        return;
    }

    onStart();

    // Conversion based on extension
    convertImageWithManipulator(file, file.uri, isDng ? /\.dng$/i : /\.(heic|heif)$/i, {
        onSuccess,
        onError,
        onFinish,
    });
};

export default convertHeicImage;
