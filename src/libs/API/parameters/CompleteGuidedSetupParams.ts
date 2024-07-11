import type {OnboardingPurposeType} from '@src/CONST';

type CompleteGuidedSetupParams = {
    firstName: string;
    lastName: string;
    actorAccountID: number;
    guidedSetupData: string;
    engagementChoice: OnboardingPurposeType;
    paymentSelected?: string;
};

export default CompleteGuidedSetupParams;
