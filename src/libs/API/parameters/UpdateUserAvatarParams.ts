import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateUserAvatarParams = {
    file: File | CustomRNImageManipulatorResult | {uri: string; name: string};
};

export default UpdateUserAvatarParams;
