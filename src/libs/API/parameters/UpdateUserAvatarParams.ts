import type {LetterAvatarSchemeKey} from '@libs/Avatars/letterAvatarPalette';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateUserAvatarParams = {
    file?: File | CustomRNImageManipulatorResult;
    customExpensifyAvatarID?: string;
    color?: LetterAvatarSchemeKey;
};

export default UpdateUserAvatarParams;
