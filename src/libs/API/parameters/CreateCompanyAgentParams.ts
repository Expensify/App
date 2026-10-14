import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type CreateCompanyAgentParams = {
    prompt: string;
    policyID: string;
    role: string;
    firstName?: string;
    customExpensifyAvatarID?: string;
    file?: File | CustomRNImageManipulatorResult;
    optimisticAccountID: number;
    optimisticReportID: string;
    createdReportActionID: string;
};

export default CreateCompanyAgentParams;
