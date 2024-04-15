import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

type OnboardingWorkProps = Record<string, unknown>;

type BaseOnboardingWorkOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<string>;
};

type BaseOnboardingWorkProps = WithCurrentUserPersonalDetailsProps &
    BaseOnboardingWorkOnyxProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;
    };

export type {OnboardingWorkProps, BaseOnboardingWorkOnyxProps, BaseOnboardingWorkProps};
