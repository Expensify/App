import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateUserAvatarParams = {
    file?: File | CustomRNImageManipulatorResult;
    customExpensifyAvatarID?: string;
};

export default UpdateUserAvatarParams;
