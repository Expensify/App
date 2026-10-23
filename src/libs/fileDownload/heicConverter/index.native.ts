import {getConvertedJpegFileName, getFileName, isLabelledDng} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import Log from '@libs/Log';

import type {FileObject} from '@src/types/utils/Attachment';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ReactNativeBlobUtil from 'react-native-blob-util';

import type {HeicConverterFunction} from './types';

/**
 * Helper function to convert a HEIC/HEIF or DNG image to JPEG using ImageManipulator
 * @param file - The original file object
 * @param sourceUri - URI of the image to convert
 * @param callbacks - Callback functions for the conversion process
 */
const convertImageWithManipulator = async (
    file: FileObject,
    sourceUri: string,
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
    try {
        const manipulatedImage = await ImageManipulator.manipulate(sourceUri).renderAsync();
        const manipulationResult = await manipulatedImage.saveAsync({format: SaveFormat.JPEG});
        // A JPEG made from a 25-75 MB DNG is a fraction of its size, so the upload size limits need the JPEG's own size.
        const {size} = await ReactNativeBlobUtil.fs.stat(fileURIToPath(manipulationResult.uri));
        onSuccess({
            uri: manipulationResult.uri,
            name: getConvertedJpegFileName(file.name, getFileName(manipulationResult.uri)),
            type: 'image/jpeg',
            size,
            width: manipulationResult.width,
            height: manipulationResult.height,
        });
    } catch (err) {
        Log.warn('Error converting image to JPEG', {error: err instanceof Error ? err.message : String(err)});
        onError(err, file);
    } finally {
        onFinish();
    }
};

/**
 * Native implementation for converting HEIC/HEIF and DNG images to JPEG
 * @param file - The file to check and potentially convert
 * @param callbacks - Object containing callback functions for different stages of conversion
 */
const convertHeicImage: HeicConverterFunction = (file, {onSuccess = () => {}, onError = () => {}, onStart = () => {}, onFinish = () => {}} = {}) => {
    const isHeic = file.name?.toLowerCase().endsWith('.heic') || file.name?.toLowerCase().endsWith('.heif');
    // A DNG can arrive without an `image/*` type (Android's MIME map doesn't know it on every device), so the type check
    // below only applies to HEIC. The backend rejects DNG, so it must be converted rather than passed through.
    const isDng = isLabelledDng(file);
    const needsConversion = isDng || (isHeic && !!file.type?.startsWith('image'));

    if (!file.uri || !needsConversion) {
        onSuccess(file);
        return;
    }

    onStart();

    convertImageWithManipulator(file, file.uri, {
        onSuccess,
        onError,
        onFinish,
    });
};

export default convertHeicImage;
