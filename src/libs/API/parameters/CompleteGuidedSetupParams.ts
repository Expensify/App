import type {OnboardingPurposeType} from '@src/CONST';

type CompleteGuidedSetupParams = {
    firstName: string;
    lastName: string;
    guidedSetupData: string;
    engagementChoice: OnboardingPurposeType;
};

export default CompleteGuidedSetupParams;
