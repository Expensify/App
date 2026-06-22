import type {TranslationPaths} from '@src/languages/types';
import type AvatarCropImage from './AvatarCropImage';

/** Shape of the avatar crop mask */
type AvatarCropMaskType = 'square' | 'circle';

/** Input handed to the avatar crop screen for the image the user picked. */
type AvatarCropDraft = AvatarCropImage & {
    /** Shape of the crop mask */
    maskType?: AvatarCropMaskType;

    /** Translation key for the primary action button label */
    buttonLabelKey?: TranslationPaths;
};

export default AvatarCropDraft;
export type {AvatarCropMaskType};
