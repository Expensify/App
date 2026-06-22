import Onyx from 'react-native-onyx';
import {serializeAvatarCropImage} from '@libs/AvatarCropUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AvatarCropMaskType} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type SetAvatarCropDraftParams = {
    token: string;
    image: FileObject;
    maskType?: AvatarCropMaskType;
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

function setAvatarCropDraft({token, image, maskType, buttonLabelKey}: SetAvatarCropDraftParams): Promise<void> {
    activeCropToken = token;
    return serializeAvatarCropImage(image).then((uri) =>
        Onyx.set(ONYXKEYS.AVATAR_CROP_DRAFT, {
            token,
            uri: uri ?? '',
            name: image.name ?? '',
            type: image.type ?? '',
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

export {setAvatarCropDraft, clearAvatarCropDraft, setAvatarCropResult, clearAvatarCropResult, isActiveCropToken};
