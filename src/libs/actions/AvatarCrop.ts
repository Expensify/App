import {serializeAvatarCropImage} from '@libs/AvatarCropUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AvatarCropMaskType} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

type SetAvatarCropDraftParams = {
    token: string;
    image: FileObject;
    openerKey: string;
    maskType?: AvatarCropMaskType;
    buttonLabelKey?: TranslationPaths;
};

type SetAvatarCropResultParams = {
    token: string;
    image: File | CustomRNImageManipulatorResult;
};

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

function clearAvatarCropDraft(): Promise<void> {
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

export {setAvatarCropDraft, clearAvatarCropDraft, setAvatarCropResult, clearAvatarCropResult};
