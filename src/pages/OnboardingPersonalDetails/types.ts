import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingPersonalDetailsProps = Record<string, unknown> & PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS>;

type BaseOnboardingPersonalDetailsProps = WithCurrentUserPersonalDetailsProps &
    PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS> & {
        /* Whether to use native styles tailored for native devices */
        shouldUseNativeStyles: boolean;
    };

export type {OnboardingPersonalDetailsProps, BaseOnboardingPersonalDetailsProps};
