import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkProps = Record<string, unknown> & PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORK>;

type BaseOnboardingWorkProps = OnboardingWorkProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingWorkProps, BaseOnboardingWorkProps};
