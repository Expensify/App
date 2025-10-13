import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdatePolicyRoomAvatarParams = {
    reportID: string;
    file: File | CustomRNImageManipulatorResult | undefined;
};

export default UpdatePolicyRoomAvatarParams;
