import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';

type OnboardingWorkEmailProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORK_EMAIL>;

type BaseOnboardingWorkEmailProps = {
    shouldUseNativeStyles: boolean;
    route: RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORK_EMAIL>;
};

export type {OnboardingWorkEmailProps, BaseOnboardingWorkEmailProps};
