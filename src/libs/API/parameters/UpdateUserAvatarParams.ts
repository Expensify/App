import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage';

type UpdateUserAvatarParams = {
    file: File | CustomRNImageManipulatorResult;
};

export default UpdateUserAvatarParams;
