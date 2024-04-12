import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

type OnboardingPurposeProps = Record<string, unknown>;

type BaseOnboardingPurposeOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<string>;
};

type BaseOnboardingPurposeProps = OnboardingPurposeProps &
    BaseOnboardingPurposeOnyxProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;

        /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
        shouldEnableMaxHeight: boolean;
    };

type OnboardingPersonalDetailsProps = Record<string, unknown>;

type BaseOnboardingPersonalDetailsOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<string>;
};

type BaseOnboardingPersonalDetailsProps = WithCurrentUserPersonalDetailsProps &
    BaseOnboardingPersonalDetailsOnyxProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;
    };

export type {
    BaseOnboardingPurposeOnyxProps,
    BaseOnboardingPurposeProps,
    OnboardingPurposeProps,
    OnboardingPersonalDetailsProps,
    BaseOnboardingPersonalDetailsOnyxProps,
    BaseOnboardingPersonalDetailsProps,
};
