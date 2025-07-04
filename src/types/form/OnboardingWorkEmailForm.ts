import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    ONBOARDING_WORK_EMAIL: 'onboardingWorkEmail',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type OnboardingWorkEmailForm = Form<
    InputID,
    {
        [INPUT_IDS.ONBOARDING_WORK_EMAIL]: string;
    }
>;

export type {OnboardingWorkEmailForm};
export default INPUT_IDS;
