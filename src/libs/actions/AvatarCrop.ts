import {serializeAvatarCropImage} from '@libs/AvatarCropUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AvatarCropMaskType} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

type SetAvatarCropDraftParams = {
    /** Unique token pairing this draft with the opener that created it */
    token: string;

    /** Image the user picked, to be cropped on the avatar crop screen */
    image: FileObject;

    /** Route of the opener that started the crop; lets that opener re-adopt the flow after a page refresh */
    openerKey: string;

    /** Shape of the crop mask */
    maskType?: AvatarCropMaskType;

    /** Translation key for the primary action button label */
    buttonLabelKey?: TranslationPaths;
};

type SetAvatarCropResultParams = {
    /** Token of the draft this result answers; the opener only consumes results matching its own token */
    token: string;

    /** Cropped image produced by the avatar crop screen */
    image: File | CustomRNImageManipulatorResult;
};

/**
 * Stores the image the user picked (plus crop options) so the avatar crop screen can read it.
 * The image is serialized for persistence (base64 on web) before being written to Onyx.
 */
function setAvatarCropDraft({token, image, openerKey, maskType, buttonLabelKey}: SetAvatarCropDraftParams): Promise<void> {
    return serializeAvatarCropImage(image).then((uri) =>
        Onyx.set(ONYXKEYS.AVATAR_CROP_DRAFT, {
            token,
            openerKey,
            uri: uri ?? '',
            name: image.name ?? '',
            type: image.type ?? '',
            ...(maskType && {maskType}),
            ...(buttonLabelKey && {buttonLabelKey}),
        }),
    );
}

/** Clears the crop draft, e.g. when the crop flow is dismissed or the draft has been consumed */
function clearAvatarCropDraft(): Promise<void> {
    return Onyx.set(ONYXKEYS.AVATAR_CROP_DRAFT, null);
}

/**
 * Stores the cropped image so the opener can pick it up and upload it.
 * The image is serialized for persistence (base64 on web) before being written to Onyx.
 */
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

/** Clears the crop result once the opener has consumed it */
function clearAvatarCropResult(): Promise<void> {
    return Onyx.set(ONYXKEYS.AVATAR_CROP_RESULT, null);
}

export {setAvatarCropDraft, clearAvatarCropDraft, setAvatarCropResult, clearAvatarCropResult};
