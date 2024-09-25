import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type {OnboardingPurposeType} from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type OnboardingPersonalDetailsProps = Record<string, unknown> & PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS>;

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

        route: PlatformStackRouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS>;
    };

export type {OnboardingPersonalDetailsProps, BaseOnboardingPersonalDetailsOnyxProps, BaseOnboardingPersonalDetailsProps};
