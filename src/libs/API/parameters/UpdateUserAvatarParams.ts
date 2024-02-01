import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateUserAvatarParams = {
    file: File | CustomRNImageManipulatorResult;
};

export default UpdateUserAvatarParams;
