import type {OnboardingAccountingType, OnboardingCompanySizeType} from '@src/CONST';
import type {OnboardingPurpose} from '@src/types/onyx';

type CompleteGuidedSetupParams = {
    firstName: string;
    lastName: string;
    actorAccountID: number;
    guidedSetupData: string;
    engagementChoice: OnboardingPurpose;
    paymentSelected?: string;
    companySize?: OnboardingCompanySizeType;
    userReportedIntegration?: OnboardingAccountingType;
};

export default CompleteGuidedSetupParams;
