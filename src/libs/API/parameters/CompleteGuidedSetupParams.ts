import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type CompleteGuidedSetupParams = {
    firstName: string;
    lastName: string;
    guidedSetupData: string;
    engagementChoice: ValueOf<typeof CONST.ONBOARDING_CHOICES>;
};

export default CompleteGuidedSetupParams;
