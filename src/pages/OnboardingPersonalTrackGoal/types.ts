import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

type OnboardingPersonalTrackGoalProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL>;

type BaseOnboardingPersonalTrackGoalProps = OnboardingPersonalTrackGoalProps & {
    shouldUseNativeStyles: boolean;
};

export type {OnboardingPersonalTrackGoalProps, BaseOnboardingPersonalTrackGoalProps};
