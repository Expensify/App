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

    /** Route of the opener that started the crop; lets that opener re-adopt the flow after a page refresh */
    openerKey: string;
};

export default AvatarCropDraft;
export type {AvatarCropMaskType};
