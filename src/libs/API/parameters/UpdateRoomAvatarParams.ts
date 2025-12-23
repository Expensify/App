import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateRoomAvatarParams = {
    reportID: string;
    file: File | CustomRNImageManipulatorResult | undefined;
    reportActionID: string;
};

export default UpdateRoomAvatarParams;
