import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnboardingCompanySizeType, OnboardingPurposeType} from '@src/CONST';

type CompleteGuidedSetupParams = {
    firstName: string;
    lastName: string;
    actorAccountID: number;
    guidedSetupData: string;
    engagementChoice: OnboardingPurposeType;
    paymentSelected?: string;
    companySize?: OnboardingCompanySizeType;
    userReportedIntegration?: ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME> | null;
};

export default CompleteGuidedSetupParams;
