import type {OnyxEntry} from 'react-native-onyx';
import type {OnboardingPurposeType} from '@src/CONST';

type OnboardingWorkProps = Record<string, unknown>;

type BaseOnboardingWorkOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<OnboardingPurposeType>;

    /** Saved onboarding purpose selected by the user */
    onboardingPolicyID: OnyxEntry<string>;
};

type BaseOnboardingWorkProps = BaseOnboardingWorkOnyxProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingWorkProps, BaseOnboardingWorkOnyxProps, BaseOnboardingWorkProps};
