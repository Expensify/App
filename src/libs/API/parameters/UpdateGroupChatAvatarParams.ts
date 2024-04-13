import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateGroupChatAvatarParams = {
    reportID: string;
    file: File | CustomRNImageManipulatorResult | undefined;
};

export default UpdateGroupChatAvatarParams;
