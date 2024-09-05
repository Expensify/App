import type {OnboardingPurpose} from '@src/types/onyx';

type CompleteGuidedSetupParams = {
    firstName: string;
    lastName: string;
    actorAccountID: number;
    guidedSetupData: string;
    engagementChoice: OnboardingPurpose;
};

export default CompleteGuidedSetupParams;
