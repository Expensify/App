import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type CreateCompanyAgentParams = {
    prompt: string;
    policyID: string;
    role: ValueOf<typeof CONST.POLICY.ROLE>;
    firstName?: string;
    customExpensifyAvatarID?: string;
    file?: File | CustomRNImageManipulatorResult;
    optimisticAccountID: number;
    optimisticReportID: string;
    createdReportActionID: string;
};

export default CreateCompanyAgentParams;
