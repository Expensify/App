import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

type OnboardingPersonalTrackGoalProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL>;

type BaseOnboardingPersonalTrackGoalProps = OnboardingPersonalTrackGoalProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingPersonalTrackGoalProps, BaseOnboardingPersonalTrackGoalProps};
