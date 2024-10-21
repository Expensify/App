import type {OnboardingAccountingType, OnboardingCompanySizeType, OnboardingPurposeType} from '@src/CONST';

type CompleteGuidedSetupParams = {
    firstName: string;
    lastName: string;
    actorAccountID: number;
    guidedSetupData: string;
    engagementChoice: OnboardingPurposeType;
    paymentSelected?: string;
    companySize?: OnboardingCompanySizeType;
    userReportedIntegration?: OnboardingAccountingType;
};

export default CompleteGuidedSetupParams;
