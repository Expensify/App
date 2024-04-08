import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateGroupChatAvatarParams = {
    reportID: string;
    file: File | CustomRNImageManipulatorResult;
};

export default UpdateGroupChatAvatarParams;
