import type {TranslationPaths} from '@src/languages/types';

/**
 * Input handed to the avatar crop screen. The picked image is stored as a base64 data URL on web
 * (so it survives a page refresh) or a file URI on native.
 */
type AvatarCropDraft = {
    /** Correlates this crop flow with the opener that started it */
    token: string;

    /** Image to crop, as a base64 data URL (web) or file URI (native) */
    imageUri: string;

    /** Name of the image */
    imageName: string;

    /** MIME type of the image */
    imageType: string;

    /** Shape of the crop mask */
    maskType?: 'square' | 'circle';

    /** Translation key for the primary action button label */
    buttonLabelKey?: TranslationPaths;
};

export default AvatarCropDraft;
