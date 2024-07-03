import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {OnboardingPurposeType} from '@src/CONST';

type OnboardingPersonalDetailsProps = Record<string, unknown>;

type BaseOnboardingPersonalDetailsOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<OnboardingPurposeType>;

    /** Saved onboarding admin chat report ID */
    onboardingAdminsChatReportID: OnyxEntry<string>;

    /** Saved onboarding policy ID */
    onboardingPolicyID: OnyxEntry<string>;
};

type BaseOnboardingPersonalDetailsProps = WithCurrentUserPersonalDetailsProps &
    BaseOnboardingPersonalDetailsOnyxProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;
    };

export type {OnboardingPersonalDetailsProps, BaseOnboardingPersonalDetailsOnyxProps, BaseOnboardingPersonalDetailsProps};
