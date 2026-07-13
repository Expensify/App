import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type UpdateAgentAvatarParams = {
    agentAccountID: number;
    file?: File | CustomRNImageManipulatorResult;
    customExpensifyAvatarID?: string;
};

export default UpdateAgentAvatarParams;
