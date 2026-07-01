import CONST from '@src/CONST';
import type {AvatarCropResult} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import type {CustomRNImageManipulatorResult} from './cropOrRotateImage/types';
import {base64ToFile, convertFileObjectOrUriToBase64DataURL} from './fileDownload/FileUtils';
import getPlatform from './getPlatform';
import Log from './Log';

/**
 * Serializes an image for Onyx storage. On web the image is converted to a base64 data URL so it
 * survives a page refresh (blob URLs do not). On native the file URI is persisted as-is.
 */
function serializeAvatarCropImage(image: FileObject | File | CustomRNImageManipulatorResult): Promise<string | undefined> {
    const uri = image.uri;
    if (!uri) {
        return Promise.resolve(undefined);
    }

    if (getPlatform() !== CONST.PLATFORM.WEB) {
        return Promise.resolve(uri);
    }

    return convertFileObjectOrUriToBase64DataURL(image).catch((error) => {
        Log.warn('Failed to serialize avatar crop image to base64', {error});
        return uri;
    });
}

/**
 * Reconstructs the cropped image from the Onyx result. On web a base64 data URL is turned back into
 * a real File (with a freshly minted blob URI); on native the stored object is returned as-is.
 */
function buildFileFromAvatarCropResult(result: AvatarCropResult): File | CustomRNImageManipulatorResult {
    if (getPlatform() === CONST.PLATFORM.WEB && result.uri.startsWith('data:')) {
        try {
            return base64ToFile(result.uri, result.name);
        } catch (error) {
            Log.warn('Failed to deserialize avatar crop result from base64', {error});
        }
    }

    return {
        uri: result.uri,
        name: result.name,
        type: result.type,
        size: result.size ?? 0,
        width: result.width ?? 0,
        height: result.height ?? 0,
    };
}

export {serializeAvatarCropImage, buildFileFromAvatarCropResult};
