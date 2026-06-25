import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type CreateAgentParams = {
    firstName?: string;
    customExpensifyAvatarID?: string;
    file?: File | CustomRNImageManipulatorResult;
    prompt: string;
    policyID?: string;
    optimisticAccountID: string;
};

export default CreateAgentParams;
