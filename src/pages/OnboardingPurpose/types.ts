import type {OnyxEntry} from 'react-native-onyx';
import type {OnboardingPurposeType} from '@src/CONST';

type OnboardingPurposeProps = Record<string, unknown>;

type BaseOnboardingPurposeOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<OnboardingPurposeType>;
};

type BaseOnboardingPurposeProps = OnboardingPurposeProps &
    BaseOnboardingPurposeOnyxProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;

        /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
        shouldEnableMaxHeight: boolean;
    };

export type {BaseOnboardingPurposeOnyxProps, BaseOnboardingPurposeProps, OnboardingPurposeProps};
