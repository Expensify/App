import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type {OnboardingPurpose} from '@src/types/onyx';

type OnboardingPersonalDetailsProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS>;

type BaseOnboardingPersonalDetailsOnyxProps = {
    /** Saved onboarding purpose selected by the user */
    onboardingPurposeSelected: OnyxEntry<OnboardingPurpose>;

    /** Saved onboarding admin chat report ID */
    onboardingAdminsChatReportID: OnyxEntry<string>;

    /** Saved onboarding policy ID */
    onboardingPolicyID: OnyxEntry<string>;
};

type BaseOnboardingPersonalDetailsProps = WithCurrentUserPersonalDetailsProps &
    BaseOnboardingPersonalDetailsOnyxProps & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;

        route: RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS>;
    };

export type {OnboardingPersonalDetailsProps, BaseOnboardingPersonalDetailsOnyxProps, BaseOnboardingPersonalDetailsProps};
