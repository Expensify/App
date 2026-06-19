import Onyx from 'react-native-onyx';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import {base64ToFile, convertFileObjectOrUriToBase64DataURL} from '@libs/fileDownload/FileUtils';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AvatarCropResult} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type SetAvatarCropDraftParams = {
    token: string;
    image: FileObject;
    maskType?: 'square' | 'circle';
    buttonLabelKey?: TranslationPaths;
};

type SetAvatarCropResultParams = {
    token: string;
    image: File | CustomRNImageManipulatorResult;
};

/**
 * Token of the crop flow initiated in THIS session. Lives in memory only (reset on reload), so it lets
 * the crop screen tell an in-session navigation apart from a refreshed/restored one whose initiating
 * opener no longer exists. The persisted Onyx draft can outlive the opener; this can't.
 */
let activeCropToken: string | undefined;

/** True only for a crop draft started in the current session (its opener is still alive to consume the result). */
function isActiveCropToken(token: string | undefined): boolean {
    return !!token && token === activeCropToken;
}

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

function setAvatarCropDraft({token, image, maskType, buttonLabelKey}: SetAvatarCropDraftParams): Promise<void> {
    activeCropToken = token;
    return serializeAvatarCropImage(image).then((imageUri) =>
        Onyx.set(ONYXKEYS.AVATAR_CROP_DRAFT, {
            token,
            imageUri: imageUri ?? '',
            imageName: image.name ?? '',
            imageType: image.type ?? '',
            ...(maskType && {maskType}),
            ...(buttonLabelKey && {buttonLabelKey}),
        }),
    );
}

function clearAvatarCropDraft(): Promise<void> {
    activeCropToken = undefined;
    return Onyx.set(ONYXKEYS.AVATAR_CROP_DRAFT, null);
}

function setAvatarCropResult({token, image}: SetAvatarCropResultParams): Promise<void> {
    return serializeAvatarCropImage(image).then((uri) =>
        Onyx.set(ONYXKEYS.AVATAR_CROP_RESULT, {
            token,
            uri: uri ?? '',
            name: image.name ?? '',
            type: image.type ?? '',
            size: image.size,
            ...('width' in image && {width: image.width}),
            ...('height' in image && {height: image.height}),
        }),
    );
}

function clearAvatarCropResult(): Promise<void> {
    return Onyx.set(ONYXKEYS.AVATAR_CROP_RESULT, null);
}

export {setAvatarCropDraft, clearAvatarCropDraft, setAvatarCropResult, clearAvatarCropResult, buildFileFromAvatarCropResult, isActiveCropToken};
